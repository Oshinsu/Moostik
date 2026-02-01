/**
 * MOOSTIK Supabase Module
 * Centralized exports for Supabase integration
 */

export { supabase, createServerClient } from "./client";
export type { Database, SupabaseClient } from "./client";
export type { Tables, Enums, Views } from "./database.types";
