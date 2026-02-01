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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }
    
    const supabase = createServerClient();
    
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
