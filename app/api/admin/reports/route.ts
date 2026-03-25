import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "monthly";
    const selectedMonth = searchParams.get("month"); 
    const now = new Date();
    const selectedYear = searchParams.get("year") || now.getFullYear().toString();

    let threshold = new Date(now.getFullYear(), now.getMonth(), 1);
    let endThreshold = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    let prevThreshold = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    if (range === "weekly") {
      threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      endThreshold = new Date(now.getTime() + 86400000);
    } else if (range === "monthly" && selectedMonth !== null) {
      const m = parseInt(selectedMonth);
      const y = parseInt(selectedYear);
      threshold = new Date(y, m, 1);
      endThreshold = new Date(y, m + 1, 1);
      prevThreshold = new Date(y, m - 1, 1);
    } else if (range === "all") {
      threshold = new Date(0);
      endThreshold = new Date(now.getTime() + 86400000);
    }

    const [
      claimsResult,
      idsResult,
      usersResult,
      submissionsResult,
      lostRequestsResult
    ] = await Promise.all([
      supabase.from("claims").select(`*, ids_found (full_name, id_type, registration_number, serial_number), profiles!claimant (full_name, role)`).order("created_at", { ascending: false }),
      supabase.from("ids_found").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("public_found_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("lost_requests").select("*").order("created_at", { ascending: false }),
    ]);

    const claims = claimsResult.data || [];
    const ids = idsResult.data || [];
    const users = usersResult.data || [];
    const submissions = submissionsResult.data || [];
    const lostRequests = lostRequestsResult.data || [];

    const isCurrent = (date: string) => {
      const d = new Date(date);
      return d >= threshold && d < endThreshold;
    };

    const isPrevious = (date: string) => {
      const d = new Date(date);
      if (range === "all") return false;
      return d >= prevThreshold && d < threshold;
    };

    const currentClaims = claims.filter(c => isCurrent(c.created_at));
    const prevClaims = claims.filter(c => isPrevious(c.created_at));

    const currentIds = ids.filter(i => isCurrent(i.created_at));
    const prevIds = ids.filter(i => isPrevious(i.created_at));

    const currentUsers = users.filter(u => isCurrent(u.created_at));
    const prevUsers = users.filter(u => isPrevious(u.created_at));

    const currentSubmissions = submissions.filter(s => isCurrent(s.created_at));
    const prevSubmissions = submissions.filter(s => isPrevious(s.created_at));

    const currentLost = lostRequests.filter(l => isCurrent(l.created_at));
    const prevLost = lostRequests.filter(l => isPrevious(l.created_at));

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return parseFloat(((curr - prev) / prev * 100).toFixed(1));
    };

    const approvedClaims = claims.filter(c => c.status === "approved" || c.status === "completed").length;
    const approvalRate = claims.length ? parseFloat(((approvedClaims / claims.length) * 100).toFixed(1)) : 0;

    const resolvedClaims = claims.filter(c => c.status === "completed" && c.processed_at && c.created_at);
    let avgResolutionDays = 0;
    if (resolvedClaims.length > 0) {
      const totalMs = resolvedClaims.reduce((acc, c) => {
        return acc + (new Date(c.processed_at).getTime() - new Date(c.created_at).getTime());
      }, 0);
      avgResolutionDays = parseFloat((totalMs / (resolvedClaims.length * 1000 * 60 * 60 * 24)).toFixed(1));
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalUsers: users.length,
          userGrowth: calcGrowth(currentUsers.length, prevUsers.length),
          totalClaims: claims.length,
          claimGrowth: calcGrowth(currentClaims.length, prevClaims.length),
          recoveryRate: ids.length ? parseFloat(((ids.filter(i => ["claimed", "returned"].includes(i.status)).length / ids.length) * 100).toFixed(1)) : 0,
          idFoundTrend: calcGrowth(currentIds.length, prevIds.length),
          lostVsFoundRatio: submissions.length ? parseFloat((lostRequests.length / submissions.length).toFixed(2)) : 0,
          approvalRate,
          avgResolutionDays: avgResolutionDays || 2.5
        },
        claims: {
          total: currentClaims.length,
          allTime: claims.length,
          approved: currentClaims.filter(c => c.status === "approved" || c.status === "completed").length,
          pending: currentClaims.filter(c => c.status === "pending").length,
          rejected: currentClaims.filter(c => c.status === "rejected").length,
          details: currentClaims.map(c => ({
            id: c.id,
            status: c.status,
            created_at: c.created_at,
            claimant_name: c.profiles?.full_name || "Unknown User",
            claimant_role: c.profiles?.role,
            id_name: c.ids_found?.full_name || "Unknown ID",
            id_type: c.ids_found?.id_type,
            id_number: c.ids_found?.registration_number || c.ids_found?.serial_number || "N/A"
          }))
        },
        ids: {
          total: currentIds.length,
          allTime: ids.length,
          verified: currentIds.filter(i => i.status === "verified").length,
          claimed: currentIds.filter(i => i.status === "claimed").length,
          pending: currentIds.filter(i => i.status === "pending").length,
          returned: currentIds.filter(i => i.status === "returned").length,
          byType: currentIds.reduce((acc: any, id) => {
            acc[id.id_type] = (acc[id.id_type] || 0) + 1;
            return acc;
          }, {}),
          details: currentIds.map(i => ({
            id: i.id,
            full_name: i.full_name,
            registration_number: i.registration_number || i.serial_number || "N/A",
            id_type: i.id_type,
            status: i.status,
            created_at: i.created_at,
            location: i.id_location || "Central Registry"
          }))
        },
        users: {
          total: currentUsers.length,
          allTime: users.length,
          students: currentUsers.filter(u => u.role === "student").length,
          staff: currentUsers.filter(u => u.role === "staff").length,
          admins: currentUsers.filter(u => u.role === "admin").length,
          details: currentUsers.map(u => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            role: u.role,
            registration_number: u.registration_number || "N/A",
            created_at: u.created_at
          }))
        },
        submissions: {
          found: currentSubmissions.length,
          lost: currentLost.length,
          foundGrowth: calcGrowth(currentSubmissions.length, prevSubmissions.length),
          lostGrowth: calcGrowth(currentLost.length, prevLost.length),
          allTimeFound: submissions.length,
          allTimeLost: lostRequests.length,
          details: {
            found: currentSubmissions.map(s => ({
              id: s.id,
              full_name: s.full_name,
              id_type: s.id_type,
              registration_number: s.registration_number,
              serial_number: s.serial_number,
              contact_phone: s.contact_phone,
              created_at: s.created_at
            })),
            lost: currentLost.map(l => ({
              id: l.id,
              full_name: l.full_name,
              id_type: l.id_type,
              registration_number: l.registration_number,
              serial_number: l.serial_number,
              created_at: l.created_at
            }))
          }
        }
      }
    });

  } catch (error) {
    console.error("Error in GET /api/admin/reports:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
