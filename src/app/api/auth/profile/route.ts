/**
 * Profile API
 * GET /api/auth/profile - Get user profile
 * PATCH /api/auth/profile - Update user profile
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import { mapDbProfileToProfile, mapDbPlanToPlan } from "@/lib/auth/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // SECURITY: Require authentication for profile access
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token and get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !authUser) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get userId from query param, but only allow users to access their own profile
    // unless they are admin (checked below)
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    // If no userId provided, use the authenticated user's ID
    const userId = requestedUserId || authUser.id;

    // SECURITY: Users can only access their own profile unless admin
    if (userId !== authUser.id) {
      // Check if requester is admin
      const { data: requesterProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();

      const isAdmin = requesterProfile?.role === "admin" || requesterProfile?.role === "super_admin";

      if (!isAdmin) {
        return NextResponse.json(
          { error: "Access denied: cannot view other users' profiles" },
          { status: 403 }
        );
      }
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        plan:plans(*)
      `)
      .eq("id", userId)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }
    
    const profile = mapDbProfileToProfile(data);
    const plan = data.plan ? mapDbPlanToPlan(data.plan) : null;
    
    return NextResponse.json({ profile, plan });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get current user from auth header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      displayName,
      avatarUrl,
      preferences,
    } = body;
    
    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (displayName !== undefined) updates.display_name = displayName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (preferences !== undefined) updates.preferences = preferences;
    
    // Get user ID from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ profile: mapDbProfileToProfile(data) });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
