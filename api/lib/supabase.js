import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

// If Supabase not configured, return a no-op client so agents don't crash
const makeNoop = () => {
  const noop = {
    data: null,
    error: null,
    then: (fn) => Promise.resolve(fn({ data: null, error: null })),
  }
  const chain = {
    select: () => chain,
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (fn) => Promise.resolve(fn({ data: [], error: null })),
  }
  return { from: () => chain, configured: false }
}

export const supabaseAdmin = (url && key)
  ? (() => { const c = createClient(url, key); c.configured = true; return c })()
  : makeNoop()
