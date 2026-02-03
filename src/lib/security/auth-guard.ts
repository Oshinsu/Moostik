/**
 * MOOSTIK Auth Guard
 * Reusable authentication utilities for API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/auth";

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role?: UserRole;
  error?: string;
}

/**
 * Verify authentication from request headers
 * Returns user info if authenticated, error otherwise
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return {
      authenticated: false,
      error: "Missing authorization header",
    };
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return {
      authenticated: false,
      error: "Invalid authorization header format",
    };
  }

  try {
    const supabase = createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        authenticated: false,
        error: "Invalid or expired token",
      };
    }

    // Get user role from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return {
      authenticated: true,
      userId: user.id,
      email: user.email,
      role: profile?.role || "user",
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      authenticated: false,
      error: "Authentication failed",
    };
  }
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ auth: AuthResult; response?: NextResponse }> {
  const auth = await verifyAuth(request);

  if (!auth.authenticated) {
    return {
      auth,
      response: NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { auth };
}

/**
 * Require admin role - returns 403 if not admin
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ auth: AuthResult; response?: NextResponse }> {
  const { auth, response } = await requireAuth(request);

  if (response) {
    return { auth, response };
  }

  const isAdmin = auth.role === "admin" || auth.role === "super_admin";

  if (!isAdmin) {
    return {
      auth,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { auth };
}

/**
 * Require specific roles - returns 403 if role not in allowed list
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ auth: AuthResult; response?: NextResponse }> {
  const { auth, response } = await requireAuth(request);

  if (response) {
    return { auth, response };
  }

  if (!auth.role || !allowedRoles.includes(auth.role)) {
    return {
      auth,
      response: NextResponse.json(
        { error: `Access denied. Required roles: ${allowedRoles.join(", ")}` },
        { status: 403 }
      ),
    };
  }

  return { auth };
}

/**
 * Optional authentication - doesn't fail if not authenticated
 * Useful for endpoints that work differently for authenticated users
 */
export async function optionalAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { authenticated: false };
  }

  return verifyAuth(request);
}

// ============================================================================
// CREDIT VERIFICATION
// ============================================================================

export interface CreditCheckResult {
  hasCredits: boolean;
  balance: number;
  required: number;
  canProceed: boolean;
}

/**
 * Check if user has enough credits for an operation
 */
export async function checkCredits(
  userId: string,
  requiredCredits: number
): Promise<CreditCheckResult> {
  try {
    const supabase = createServerClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return {
        hasCredits: false,
        balance: 0,
        required: requiredCredits,
        canProceed: false,
      };
    }

    const balance = profile.credits_balance || 0;
    const hasCredits = balance >= requiredCredits;

    return {
      hasCredits,
      balance,
      required: requiredCredits,
      canProceed: hasCredits,
    };
  } catch (error) {
    console.error("Credit check error:", error);
    return {
      hasCredits: false,
      balance: 0,
      required: requiredCredits,
      canProceed: false,
    };
  }
}

/**
 * Deduct credits from user balance
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<boolean> {
  try {
    const supabase = createServerClient();

    // Get current balance
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      return false;
    }

    const newBalance = (profile.credits_balance || 0) - amount;

    if (newBalance < 0) {
      return false;
    }

    // Update balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits_balance: newBalance })
      .eq("id", userId);

    if (updateError) {
      return false;
    }

    // Log transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      type: "usage",
      amount: -amount,
      balance_before: profile.credits_balance,
      balance_after: newBalance,
      description,
      status: "completed",
    });

    return true;
  } catch (error) {
    console.error("Credit deduction error:", error);
    return false;
  }
}
