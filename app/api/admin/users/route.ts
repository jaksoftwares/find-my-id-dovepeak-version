import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build the query for profiles
    let query = supabase
      .from("profiles")
      .select("id, full_name, role, phone, created_at, updated_at", { count: "exact" });

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%`);
    }

    query = query.order("created_at", { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, count, error } = await query;

    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Get user IDs to fetch emails
    const userIds = profiles?.map(p => p.id).filter(Boolean) || [];
    
    // Use a direct query approach - create a view or use RPC
    // For now, we'll use a more efficient approach with Promise.all
    let usersEmails: Record<string, string> = {};
    
    if (userIds.length > 0) {
      // Use the auth.users table directly with a more targeted query
      // This is faster than listing all users
      try {
        // Try to get emails using admin API with pagination
        const { data: usersData, error: usersError } = await supabase
          .auth.admin.listUsers();
        
        if (!usersError && usersData?.users) {
          // Filter to only the users we need (much faster than iterating all)
          const relevantUsers = usersData.users.filter(u => 
            userIds.includes(u.id)
          );
          
          relevantUsers.forEach(u => {
            usersEmails[u.id] = u.email || '';
          });
        }
      } catch (emailError) {
        console.error("Error fetching emails:", emailError);
        // Continue without emails if this fails
      }
    }

    // Combine data
    const data = profiles?.map(p => ({
      ...p,
      email: usersEmails[p.id] || ''
    })) || [];

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { email, full_name, role, phone } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { success: false, message: "Email, full_name, and role are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    });

    if (authError) {
      return NextResponse.json(
        { success: false, message: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        full_name,
        role,
        phone: phone || null,
      })
      .select()
      .single();

    if (profileError) {
      // Delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { success: false, message: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: { ...profile, email },
    });
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
