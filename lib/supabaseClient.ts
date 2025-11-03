import { createClient } from "@supabase/supabase-js";

// Shared Supabase client for browser-side usage.
// Uses NEXT_SUPABASE_URL and NEXT_SUPABASE_ANON_KEY from env.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);
