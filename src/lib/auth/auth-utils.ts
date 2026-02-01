/**
 * MOOSTIK Auth Utilities
 * Bloodwing Studio - SOTA Février 2026
 */

import { createServerClient } from "@/lib/supabase/client";
import type { Profile, Plan, UserRole } from "@/types/auth";

// ============================================
// SERVER-SIDE AUTH HELPERS
// ============================================

/**
 * Get the current user's profile from server-side
 */
export async function getServerProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        plan:plans(*)
      `)
      .eq("id", userId)
      .single();
    
    if (error || !data) return null;
    
    return mapDbProfileToProfile(data);
  } catch {
    return null;
  }
}

/**
 * Check if user is admin (server-side)
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (error || !data) return false;
    
    return data.role === "admin" || data.role === "super_admin";
  } catch {
    return false;
  }
}

/**
 * Check if user is super admin (server-side)
 */
export async function isUserSuperAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    if (error || !data) return false;
    
    return data.role === "super_admin";
  } catch {
    return false;
  }
}

/**
 * Deduct credits (server-side)
 */
export async function deductUserCredits(
  userId: string,
  amount: number,
  description: string,
  referenceType?: string,
  referenceId?: string
): Promise<boolean> {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase.rpc("deduct_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_type: "usage",
      p_description: description,
      p_reference_type: referenceType,
      p_reference_id: referenceId,
    });
    
    return !error && data === true;
  } catch {
    return false;
  }
}

/**
 * Add credits (server-side)
 */
export async function addUserCredits(
  userId: string,
  amount: number,
  type: "bonus" | "purchase" | "gift" | "admin_grant" | "subscription",
  description: string,
  adminId?: string
): Promise<boolean> {
  try {
    const supabase = createServerClient();
    
    const { data, error } = await supabase.rpc("add_credits", {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_description: description,
      p_created_by: adminId,
    });
    
    return !error && data === true;
  } catch {
    return false;
  }
}

/**
 * Log admin action
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  try {
    const supabase = createServerClient();
    
    await supabase.from("admin_logs").insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: (details || {}) as import("@/lib/supabase/database.types").Json,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

// ============================================
// MAPPERS
// ============================================

export function mapDbProfileToProfile(data: Record<string, unknown>): Profile {
  return {
    id: data.id as string,
    email: data.email as string,
    displayName: data.display_name as string | null,
    avatarUrl: data.avatar_url as string | null,
    role: data.role as UserRole,
    planId: data.plan_id as string,
    planStartedAt: data.plan_started_at as string | null,
    planExpiresAt: data.plan_expires_at as string | null,
    creditsBalance: data.credits_balance as number,
    creditsUsedTotal: data.credits_used_total as number,
    imagesGenerated: data.images_generated as number,
    videosGenerated: data.videos_generated as number,
    episodesCreated: data.episodes_created as number,
    preferences: (data.preferences as Record<string, unknown>) || {},
    stripeCustomerId: data.stripe_customer_id as string | null,
    isActive: data.is_active as boolean,
    isVerified: data.is_verified as boolean,
    lastActiveAt: data.last_active_at as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    plan: data.plan ? mapDbPlanToPlan(data.plan as Record<string, unknown>) : undefined,
  };
}

export function mapDbPlanToPlan(data: Record<string, unknown>): Plan {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | null,
    tier: data.tier as Plan["tier"],
    priceMonthly: Number(data.price_monthly),
    priceYearly: Number(data.price_yearly),
    creditsMonthly: data.credits_monthly as number,
    maxEpisodes: data.max_episodes as number | null,
    maxShotsPerEpisode: data.max_shots_per_episode as number | null,
    maxParallelGenerations: data.max_parallel_generations as number,
    maxVideoDurationSeconds: data.max_video_duration_seconds as number,
    hasVideoGeneration: data.has_video_generation as boolean,
    hasBloodDirector: data.has_blood_director as boolean,
    hasHdExport: data.has_hd_export as boolean,
    has4kExport: data.has_4k_export as boolean,
    hasApiAccess: data.has_api_access as boolean,
    hasPriorityQueue: data.has_priority_queue as boolean,
    hasCustomModels: data.has_custom_models as boolean,
    badgeText: data.badge_text as string | null,
    badgeColor: data.badge_color as string | null,
    isPopular: data.is_popular as boolean,
    isActive: data.is_active as boolean,
    displayOrder: data.display_order as number,
  };
}

// ============================================
// VALIDATION
// ============================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }
  
  return { valid: errors.length === 0, errors };
}

// ============================================
// ROLE HELPERS
// ============================================

export const ROLE_HIERARCHY: UserRole[] = [
  "user",
  "member",
  "creator",
  "admin",
  "super_admin",
];

export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    user: "Utilisateur",
    member: "Membre",
    creator: "Créateur",
    admin: "Administrateur",
    super_admin: "Super Admin",
  };
  return names[role];
}
