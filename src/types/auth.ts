/**
 * MOOSTIK Auth & Credits Types
 * Bloodwing Studio - SOTA Février 2026
 */

// ============================================
// ENUMS
// ============================================

export type UserPlan = "free" | "starter" | "pro" | "studio" | "enterprise";

export type UserRole = "user" | "member" | "creator" | "admin" | "super_admin";

export type TransactionType = 
  | "purchase"
  | "usage"
  | "bonus"
  | "refund"
  | "gift"
  | "subscription"
  | "admin_grant";

export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";

// ============================================
// PLAN
// ============================================

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  tier: UserPlan;
  priceMonthly: number;
  priceYearly: number;
  creditsMonthly: number;
  
  // Limits
  maxEpisodes: number | null;
  maxShotsPerEpisode: number | null;
  maxParallelGenerations: number;
  maxVideoDurationSeconds: number;
  
  // Features
  hasVideoGeneration: boolean;
  hasBloodDirector: boolean;
  hasHdExport: boolean;
  has4kExport: boolean;
  hasApiAccess: boolean;
  hasPriorityQueue: boolean;
  hasCustomModels: boolean;
  
  // Display
  badgeText: string | null;
  badgeColor: string | null;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string | number;
}

// ============================================
// PROFILE
// ============================================

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  
  // Role & Plan
  role: UserRole;
  planId: string;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  
  // Credits
  creditsBalance: number;
  creditsUsedTotal: number;
  
  // Stats
  imagesGenerated: number;
  videosGenerated: number;
  episodesCreated: number;
  
  // Preferences
  preferences: ProfilePreferences;
  
  // Meta
  stripeCustomerId: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  plan?: Plan;
}

export interface ProfilePreferences {
  theme?: "dark" | "light" | "system";
  defaultVideoProvider?: string;
  defaultImageModel?: string;
  notifications?: {
    email?: boolean;
    generationComplete?: boolean;
    weeklyReport?: boolean;
  };
  language?: string;
}

// ============================================
// TRANSACTIONS
// ============================================

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: Record<string, unknown>;
  referenceType: string | null;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface CreditCost {
  id: string;
  name: string;
  description: string | null;
  creditsCost: number;
  operationType: string;
  modelName: string | null;
  isActive: boolean;
}

// ============================================
// SUBSCRIPTION
// ============================================

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAt: string | null;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined
  plan?: Plan;
}

// ============================================
// INVITATION
// ============================================

export interface Invitation {
  id: string;
  code: string;
  email: string | null;
  role: UserRole;
  planId: string | null;
  bonusCredits: number;
  maxUses: number;
  currentUses: number;
  createdBy: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

// ============================================
// ADMIN
// ============================================

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
  
  // Joined
  admin?: Profile;
}

// ============================================
// AUTH STATE
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  plan: Plan | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// ============================================
// API RESPONSES
// ============================================

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  profile?: Profile;
  error?: string;
}

export interface CreditCheckResponse {
  hasCredits: boolean;
  balance: number;
  required: number;
  canProceed: boolean;
}

export interface PlanCheckResponse {
  hasFeature: boolean;
  currentPlan: Plan;
  requiredPlan: UserPlan;
  upgradeRequired: boolean;
}
