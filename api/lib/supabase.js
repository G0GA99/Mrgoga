import { createClient } from '@supabase/supabase-js'

// Server-side client (Service Role — full access, never expose to browser)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)
