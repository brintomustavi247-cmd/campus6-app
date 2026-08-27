import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CAMPUS 6.0 - SUPABASE CLIENT (v10.1 - AUTH HARDENED)
// ============================================================================
//
// FIXES:
//  FIX A  Explicit auth configuration:
//         - persistSession  : session survives reloads (survives OAuth redirect
//                             boot — essential to the login-loop fix in App.tsx)
//         - autoRefreshToken: keeps access tokens alive in background tabs
//         - detectSessionInUrl: parses BOTH ?code= (PKCE) and #access_token=
//                             (implicit) results after the Google redirect
//         - flowType:'pkce' : recommended modern OAuth flow. Applies only to
//                             NEW sign-in attempts; detectSessionInUrl handles
//                             the callback either way. If your project predates
//                             PKCE and misbehaves, revert this single line to
//                             'implicit' — nothing else depends on it.
//
//  FIX B  Credentials from env with explicit warning when falling back.
//         SECURITY NOTE: the previous anon key was committed to source control.
//         Anon keys are public-facing BY DESIGN (RLS protects your data), but
//         rotate it in Supabase → Settings → API when convenient, and move
//         BOTH values into .env.local. Confirm RLS covers: users,
//         study_sessions (users: SELECT for everyone on leaderboard cols;
//         UPDATE restricted to own row; study_sessions INSERT own-only).
// ============================================================================

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://borulznmosklrtvpkkxr.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcnVsem5tb3NrbHJ0dnBra3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczOTU4OTcsImV4cCI6MjEwMjk3MTg5N30.a7YxFhA-_RGZdCa6eUikbKbbwSXxA7YaZdgtKdbh4hQ';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  // Fallbacks work, but surface it loudly in dev so nobody ships on them blind.
  console.warn(
    '[Supabase] Using built-in fallback credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // FIX A — survive OAuth redirect boot
    autoRefreshToken: true,
    detectSessionInUrl: true,  // parses PKCE ?code= and implicit #access_token=
    flowType: 'pkce',          // FIX B — revert to 'implicit' only if legacy issues arise
  },
});

export type SupabaseClient = typeof supabase;