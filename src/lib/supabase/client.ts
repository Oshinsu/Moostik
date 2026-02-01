/**
 * MOOSTIK Supabase Client
 * SOTA January 2026
 * 
 * Source: https://supabase.com/docs/guides/realtime/getting_started
 * Using the new publishable key format (sb_publishable_xxx)
 */

import { createClient, SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Browser client for client-side operations
 * Uses the anon/publishable key with RLS
 * Returns null if not configured
 */
export const supabase: SupabaseClientType<Database> | null = 
  isSupabaseConfigured() 
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

/**
 * Server client factory for server-side operations
 * Use this in API routes and server components
 */
export function createServerClient(): SupabaseClientType<Database> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Export types for convenience
export type { Database } from "./database.types";
export type SupabaseClient = SupabaseClientType<Database>;
