"use client";

import { useState, useCallback } from "react";
import { useAuth } from "./auth-context";
import type { CreditTransaction, CreditCost, CreditCheckResponse } from "@/types/auth";

export function useCredits() {
  const { profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get current balance
  const balance = profile?.creditsBalance ?? 0;

  // Check if user has enough credits
  const hasCredits = useCallback((amount: number): boolean => {
    return balance >= amount;
  }, [balance]);

  // Check credits for an operation
  const checkCredits = useCallback(async (
    operationType: string,
    modelName?: string
  ): Promise<CreditCheckResponse> => {
    try {
      const res = await fetch("/api/credits/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationType, modelName }),
      });
      
      if (res.ok) {
        return await res.json();
      }
      
      return {
        hasCredits: false,
        balance: 0,
        required: 0,
        canProceed: false,
      };
    } catch {
      return {
        hasCredits: false,
        balance: 0,
        required: 0,
        canProceed: false,
      };
    }
  }, []);

  // Deduct credits (called by API internally, this is for manual deductions)
  const deductCredits = useCallback(async (
    amount: number,
    description: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/credits/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          description,
          referenceType,
          referenceId,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error };
      }
      
      await refreshProfile();
      return { success: true };
    } catch {
      return { success: false, error: "Failed to deduct credits" };
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  // Get transaction history
  const getTransactions = useCallback(async (
    limit = 50,
    offset = 0
  ): Promise<CreditTransaction[]> => {
    try {
      const res = await fetch(
        `/api/credits/transactions?limit=${limit}&offset=${offset}`
      );
      
      if (res.ok) {
        const data = await res.json();
        return data.transactions;
      }
      
      return [];
    } catch {
      return [];
    }
  }, []);

  // Get credit costs
  const getCosts = useCallback(async (): Promise<CreditCost[]> => {
    try {
      const res = await fetch("/api/credits/costs");
      
      if (res.ok) {
        const data = await res.json();
        return data.costs;
      }
      
      return [];
    } catch {
      return [];
    }
  }, []);

  return {
    balance,
    hasCredits,
    checkCredits,
    deductCredits,
    getTransactions,
    getCosts,
    isLoading,
    creditsUsedTotal: profile?.creditsUsedTotal ?? 0,
  };
}
