/**
 * Credits Check API
 * POST /api/credits/check - Check if user has enough credits
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get user from auth
    const authHeader = request.headers.get("authorization");
    const { data: { user } } = await supabase.auth.getUser(
      authHeader?.replace("Bearer ", "")
    );
    
    if (!user) {
      return NextResponse.json({
        hasCredits: false,
        balance: 0,
        required: 0,
        canProceed: false,
      });
    }
    
    const body = await request.json();
    const { operationType, modelName } = body;
    
    // Get user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", user.id)
      .single();
    
    const balance = profile?.credits_balance ?? 0;
    
    // Get cost for operation
    let query = supabase
      .from("credit_costs")
      .select("credits_cost")
      .eq("operation_type", operationType)
      .eq("is_active", true);
    
    if (modelName) {
      query = query.eq("model_name", modelName);
    }
    
    const { data: costData } = await query.single();
    const required = costData?.credits_cost ?? 1;
    
    return NextResponse.json({
      hasCredits: balance >= required,
      balance,
      required,
      canProceed: balance >= required,
    });
  } catch (error) {
    console.error("Credits check error:", error);
    return NextResponse.json({
      hasCredits: false,
      balance: 0,
      required: 0,
      canProceed: false,
    });
  }
}
