/**
 * BLOODWINGS STUDIO - Credits API
 * 
 * GET /api/credits - Get user's credit balance and history
 * POST /api/credits - Deduct credits for an operation
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import {
  getCreditBalance,
  getCreditHistory,
  deductCredits,
  checkCredits,
} from "@/lib/credits";

// ============================================================================
// GET - Get balance and history
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get balance
    const balance = await getCreditBalance(user.id);
    
    if (!balance) {
      return NextResponse.json(
        { error: "Could not retrieve credit balance" },
        { status: 500 }
      );
    }
    
    // Get history if requested
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get("history") === "true";
    const historyLimit = parseInt(searchParams.get("limit") || "20");
    
    let history: Awaited<ReturnType<typeof getCreditHistory>> = [];
    if (includeHistory) {
      history = await getCreditHistory(user.id, historyLimit);
    }
    
    // Get user's plan from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_id, role")
      .eq("id", user.id)
      .single();
    
    return NextResponse.json({
      balance: {
        available: balance.available,
        used: balance.used,
        bonus: balance.bonusCredits,
        rollover: balance.rollover,
        total: balance.total,
        monthlyAllowance: balance.monthlyAllowance,
      },
      plan: profile?.plan_id || "free",
      subscriptionStatus: "active",
      history,
    });
  } catch (error) {
    console.error("Credits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Deduct credits or check availability
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action, operation, quantity = 1, resourceId, description } = body;
    
    // Action: check - just check if user has enough credits
    if (action === "check") {
      const result = await checkCredits(user.id, operation, quantity);
      return NextResponse.json({
        allowed: result.allowed,
        cost: result.cost,
        balance: result.balance.total,
        reason: result.reason,
      });
    }
    
    // Action: deduct - actually deduct credits
    if (action === "deduct") {
      // First check
      const check = await checkCredits(user.id, operation, quantity);
      if (!check.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: check.reason || "Insufficient credits",
            balance: check.balance.total,
            cost: check.cost,
          },
          { status: 402 } // Payment Required
        );
      }
      
      // Then deduct
      const result = await deductCredits(
        user.id,
        operation,
        quantity,
        resourceId,
        description
      );
      
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || "Failed to deduct credits",
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        newBalance: result.newBalance,
        transactionId: result.transactionId,
        cost: check.cost,
      });
    }
    
    return NextResponse.json(
      { error: "Invalid action. Use 'check' or 'deduct'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Credits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
