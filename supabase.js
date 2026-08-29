import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://cnspysuwmossjfspkqkc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuc3B5c3V3bW9zc2pmc3BrcWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM2OTYsImV4cCI6MjEwMjk3OTY5Nn0.5hTNuB_jl2Mt8WnQlp9TvXF-71MUFWMyGJqFKaITjMA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
