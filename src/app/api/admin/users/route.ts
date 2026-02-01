/**
 * Admin Users API
 * GET /api/admin/users - List all users (admin only)
 * POST /api/admin/users - Update user role/credits (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import { isUserAdmin, logAdminAction, mapDbProfileToProfile, addUserCredits } from "@/lib/auth/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get admin user
    const authHeader = request.headers.get("authorization");
    const { data: { user } } = await supabase.auth.getUser(
      authHeader?.replace("Bearer ", "")
    );
    
    if (!user || !(await isUserAdmin(user.id))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const plan = searchParams.get("plan");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Build query
    let query = supabase
      .from("profiles")
      .select(`
        *,
        plan:plans(id, name, tier)
      `, { count: "exact" });
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    
    if (role) {
      query = query.eq("role", role);
    }
    
    if (plan) {
      query = query.eq("plan_id", plan);
    }
    
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    const users = (data || []).map(mapDbProfileToProfile);
    
    return NextResponse.json({
      users,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get admin user
    const authHeader = request.headers.get("authorization");
    const { data: { user: adminUser } } = await supabase.auth.getUser(
      authHeader?.replace("Bearer ", "")
    );
    
    if (!adminUser || !(await isUserAdmin(adminUser.id))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { userId, action, data } = body;
    
    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action" },
        { status: 400 }
      );
    }
    
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    
    switch (action) {
      case "update_role": {
        const { role } = data;
        
        // Super admin can only be set by super admin
        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", adminUser.id)
          .single();
        
        if (role === "super_admin" && adminProfile?.role !== "super_admin") {
          return NextResponse.json(
            { error: "Only super admins can grant super admin role" },
            { status: 403 }
          );
        }
        
        const { error } = await supabase
          .from("profiles")
          .update({ role, updated_at: new Date().toISOString() })
          .eq("id", userId);
        
        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        }
        
        await logAdminAction(
          adminUser.id,
          "update_role",
          "user",
          userId,
          { newRole: role },
          clientIp
        );
        
        return NextResponse.json({ success: true });
      }
      
      case "add_credits": {
        const { amount, reason } = data;
        
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { error: "Invalid amount" },
            { status: 400 }
          );
        }
        
        const success = await addUserCredits(
          userId,
          amount,
          "admin_grant",
          reason || "Admin grant",
          adminUser.id
        );
        
        if (!success) {
          return NextResponse.json(
            { error: "Failed to add credits" },
            { status: 500 }
          );
        }
        
        await logAdminAction(
          adminUser.id,
          "add_credits",
          "user",
          userId,
          { amount, reason },
          clientIp
        );
        
        return NextResponse.json({ success: true });
      }
      
      case "update_plan": {
        const { planId } = data;
        
        const { error } = await supabase
          .from("profiles")
          .update({
            plan_id: planId,
            plan_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        
        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        }
        
        await logAdminAction(
          adminUser.id,
          "update_plan",
          "user",
          userId,
          { planId },
          clientIp
        );
        
        return NextResponse.json({ success: true });
      }
      
      case "toggle_active": {
        const { isActive } = data;
        
        const { error } = await supabase
          .from("profiles")
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        
        if (error) {
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        }
        
        await logAdminAction(
          adminUser.id,
          isActive ? "activate_user" : "deactivate_user",
          "user",
          userId,
          {},
          clientIp
        );
        
        return NextResponse.json({ success: true });
      }
      
      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Admin users POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
