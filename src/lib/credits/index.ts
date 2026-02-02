/**
 * BLOODWINGS STUDIO - Credits System
 * 
 * Gère les crédits utilisateurs:
 * - Vérification des limites
 * - Déduction à l'usage
 * - Transactions
 * - Rollover mensuel
 * 
 * NOTE: This implementation uses mock data for development.
 * In production, connect to Supabase using the schema in supabase/schema.sql
 */

import { PLANS, CREDIT_COSTS, type PlanTier } from "@/types/bloodwings";

// ============================================================================
// TYPES
// ============================================================================

export interface CreditBalance {
  available: number;
  used: number;
  monthlyAllowance: number;
  bonusCredits: number;
  rollover: number;
  total: number;
}

export interface CreditCheckResult {
  allowed: boolean;
  balance: CreditBalance;
  cost: number;
  reason?: string;
}

export interface CreditDeductResult {
  success: boolean;
  newBalance: number;
  transactionId?: string;
  error?: string;
}

// ============================================================================
// MOCK STORAGE (Replace with Supabase in production)
// ============================================================================

const mockCredits: Record<string, CreditBalance> = {};
const mockTransactions: Record<string, Array<{
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}>> = {};

function initMockUser(userId: string, plan: PlanTier = "free") {
  if (!mockCredits[userId]) {
    const planConfig = PLANS[plan];
    mockCredits[userId] = {
      available: planConfig.limits.maxCreditsPerMonth,
      used: 0,
      monthlyAllowance: planConfig.limits.maxCreditsPerMonth,
      bonusCredits: 0,
      rollover: 0,
      total: planConfig.limits.maxCreditsPerMonth,
    };
    mockTransactions[userId] = [];
  }
}

// ============================================================================
// CREDIT COSTS
// ============================================================================

export function getCreditCost(operation: string, quantity: number = 1): number {
  const cost = CREDIT_COSTS[operation];
  if (!cost) {
    console.warn(`Unknown credit operation: ${operation}`);
    return 1; // Default cost
  }
  return cost.amount * quantity;
}

export function getVideoCreditCost(
  provider: "runway_turbo" | "runway_alpha" | "kling" | "kling_audio",
  durationSeconds: number
): number {
  const costKey = `video_${provider}`;
  const cost = CREDIT_COSTS[costKey];
  if (!cost) return durationSeconds * 3; // Default fallback
  return cost.amount * durationSeconds;
}

// ============================================================================
// CREDIT OPERATIONS
// ============================================================================

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<CreditBalance | null> {
  initMockUser(userId);
  return mockCredits[userId] || null;
}

/**
 * Check if user has enough credits for an operation
 */
export async function checkCredits(
  userId: string,
  operation: string,
  quantity: number = 1
): Promise<CreditCheckResult> {
  const balance = await getCreditBalance(userId);
  
  if (!balance) {
    return {
      allowed: false,
      balance: { available: 0, used: 0, monthlyAllowance: 0, bonusCredits: 0, rollover: 0, total: 0 },
      cost: 0,
      reason: "Could not retrieve credit balance",
    };
  }
  
  const cost = getCreditCost(operation, quantity);
  const totalAvailable = balance.total;
  
  if (totalAvailable < cost) {
    return {
      allowed: false,
      balance,
      cost,
      reason: `Insufficient credits. Need ${cost}, have ${totalAvailable}`,
    };
  }
  
  return {
    allowed: true,
    balance,
    cost,
  };
}

/**
 * Deduct credits from user's balance
 */
export async function deductCredits(
  userId: string,
  operation: string,
  quantity: number = 1,
  resourceId?: string,
  description?: string
): Promise<CreditDeductResult> {
  initMockUser(userId);
  
  const balance = mockCredits[userId];
  const cost = getCreditCost(operation, quantity);
  
  if (balance.total < cost) {
    return { success: false, newBalance: balance.total, error: "Insufficient credits" };
  }
  
  // Deduct from available first
  balance.available -= cost;
  balance.used += cost;
  balance.total = balance.available + balance.bonusCredits + balance.rollover;
  
  // Record transaction
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  mockTransactions[userId].push({
    id: transactionId,
    type: "usage",
    amount: -cost,
    balanceAfter: balance.total,
    description: description || CREDIT_COSTS[operation]?.description || operation,
    createdAt: new Date().toISOString(),
  });
  
  return {
    success: true,
    newBalance: balance.total,
    transactionId,
  };
}

/**
 * Add credits to user's balance
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: "purchase" | "bonus" | "refund" | "rollover",
  description?: string
): Promise<CreditDeductResult> {
  initMockUser(userId);
  
  const balance = mockCredits[userId];
  
  if (type === "bonus" || type === "refund") {
    balance.bonusCredits += amount;
  } else if (type === "rollover") {
    balance.rollover += amount;
  } else {
    balance.available += amount;
  }
  
  balance.total = balance.available + balance.bonusCredits + balance.rollover;
  
  // Record transaction
  mockTransactions[userId].push({
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type,
    amount,
    balanceAfter: balance.total,
    description: description || `${type} credits`,
    createdAt: new Date().toISOString(),
  });
  
  return {
    success: true,
    newBalance: balance.total,
  };
}

/**
 * Initialize credits for new user
 */
export async function initializeUserCredits(
  userId: string,
  plan: PlanTier = "free"
): Promise<boolean> {
  initMockUser(userId, plan);
  return true;
}

/**
 * Get credit usage history
 */
export async function getCreditHistory(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}>> {
  initMockUser(userId);
  return (mockTransactions[userId] || []).slice(0, limit);
}

// ============================================================================
// HELPERS
// ============================================================================

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

/**
 * Process monthly reset (called by cron)
 */
export async function processMonthlyReset(): Promise<void> {
  for (const userId of Object.keys(mockCredits)) {
    const balance = mockCredits[userId];
    const hasRollover = balance.monthlyAllowance >= 800; // Studio+ plans
    
    if (hasRollover && balance.available > 0) {
      balance.rollover = Math.min(balance.available, balance.monthlyAllowance * 2);
    } else {
      balance.rollover = 0;
    }
    
    balance.available = balance.monthlyAllowance;
    balance.used = 0;
    balance.total = balance.available + balance.bonusCredits + balance.rollover;
  }
}
