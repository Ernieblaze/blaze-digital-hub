/**
 * Supabase server client — SERVER ONLY (uses the service-role key).
 *
 * Setup:
 * 1. Create a project at supabase.com (free plan is fine).
 * 2. Run supabase/schema.sql in the project's SQL Editor.
 * 3. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and on
 *    Vercel (Project → Settings → Environment Variables).
 *
 * Until configured, features that need it (newsletter storage) degrade
 * gracefully instead of crashing.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
