import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

// Safe client — returns no-op proxy if Supabase not configured yet
const createSafeClient = () => {
  if (!url || !key) {
    const noop = () => ({ data: null, error: null, select: () => noop(), insert: () => noop(), update: () => noop(), eq: () => noop(), order: () => noop(), limit: () => noop(), single: () => noop() })
    return { from: () => noop(), configured: false }
  }
  const client = createClient(url, key)
  client.configured = true
  return client
}

export const supabaseAdmin = createSafeClient()
