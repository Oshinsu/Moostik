/**
 * Plans API
 * GET /api/plans - Get all active plans
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import { mapDbPlanToPlan } from "@/lib/auth/auth-utils";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    const plans = (data || []).map(mapDbPlanToPlan);
    
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Plans GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
