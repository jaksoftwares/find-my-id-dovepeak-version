import { requireAdmin } from "@/lib/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    
    const supabaseAdmin = await createAdminClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build the query for profiles
    let query = supabaseAdmin
      .from("profiles")
      .select("id, full_name, role, phone, registration_number, faculty, created_at, updated_at", { count: "exact" });

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
      try {
        const supabaseAdmin = await createAdminClient();
        
        // Try to get emails using admin API with pagination
        const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        
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
    const { email, password, full_name, role, phone, registration_number, faculty } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { success: false, message: "Email, full_name, and role are required" },
        { status: 400 }
      );
    }

    // Security: Only super_admin can create admin or super_admin users
    const requesterRole = auth.session.profile.role;
    if ((role === 'admin' || role === 'super_admin') && requesterRole !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: "Forbidden: Only super admins can create administrative accounts" },
        { status: 403 }
      );
    }

    const supabaseAdmin = await createAdminClient();

    // 1. Pre-flight check: Does the user already exist in Auth?
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && existingUsers.users.some(u => u.email === email)) {
      return NextResponse.json(
        { success: false, message: `Conflict: A user with the email address ${email} already exists in the system.` },
        { status: 409 }
      );
    }

    // 2. Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'Welcome@123',
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        phone: phone || '',
        registration_number: registration_number || '',
        faculty: faculty || '',
      },
    });

    if (authError) {
      console.error("Supabase Auth Deep Error:", authError);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Supabase Auth Error: ${authError.message}`,
          details: authError.code || 'unexpected_failure',
          hint: "If this is a 500 error, please verify your Supabase Database Triggers or SMTP settings."
        },
        { status: authError.status || 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, message: "System failed to return user data after creation. Check Supabase logs." },
        { status: 500 }
      );
    }

    // 2. Upsert profile in database (upsert handles cases where a trigger already created it)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        full_name,
        role,
        email,
        phone: phone || null,
        registration_number: registration_number || null,
        faculty: faculty || null,
      })
      .select()
      .single();

    if (profileError) {
      // Delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
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
