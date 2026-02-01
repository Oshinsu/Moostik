"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile, Plan, AuthState, UserRole } from "@/types/auth";

// ============================================
// CONTEXT
// ============================================

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile from API
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/auth/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setPlan(data.plan);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setPlan(null);
        }

        if (event === "SIGNED_OUT") {
          setProfile(null);
          setPlan(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Sign in
  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase not configured" };
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error: error.message };
    return {};
  };

  // Sign up
  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!supabase) return { error: "Supabase not configured" };
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    
    if (error) return { error: error.message };
    return {};
  };

  // Sign out
  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!supabase) return { error: "Supabase not configured" };
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) return { error: error.message };
    return {};
  };

  // Reset password
  const resetPassword = async (email: string) => {
    if (!supabase) return { error: "Supabase not configured" };
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) return { error: error.message };
    return {};
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "Not authenticated" };
    
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Failed to update profile" };
      }
      
      await fetchProfile(user.id);
      return {};
    } catch {
      return { error: "Failed to update profile" };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  const isSuperAdmin = profile?.role === "super_admin";

  const value: AuthContextType = {
    user: user ? { id: user.id, email: user.email!, profile } : null,
    profile,
    plan,
    isLoading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
