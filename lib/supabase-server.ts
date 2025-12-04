import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for API routes
// Uses service role key to bypass RLS for server-side operations
// Falls back to anon key if service role is not available
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseServer = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
