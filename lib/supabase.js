import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.warn('[Supabase] Not configured — SUPABASE_URL or SUPABASE_SERVICE_KEY missing. Agent logs will NOT be saved.')
}

const makeNoop = () => {
  const chain = {
    select:  () => chain,
    insert:  () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    update:  () => chain,
    upsert:  () => chain,
    delete:  () => chain,
    eq:      () => chain,
    neq:     () => chain,
    gte:     () => chain,
    lte:     () => chain,
    ilike:   () => chain,
    in:      () => chain,
    order:   () => chain,
    limit:   () => chain,
    single:  () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    then:    (fn) => Promise.resolve(fn({ data: [], error: null })),
  }
  const storageMock = {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      createSignedUploadUrl: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: () => Promise.resolve({ error: null }),
    })
  }
  return { from: () => chain, storage: storageMock, configured: false }
}

export const supabaseAdmin = (url && key)
  ? (() => {
      const c = createClient(url, key, { auth: { persistSession: false } })
      c.configured = true
      return c
    })()
  : makeNoop()
