import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const isConfigured = Boolean(url && key)
export const supabase = isConfigured ? createClient(url, key) : null
export const posterUrl = (path) =>
  path ? supabase.storage.from('posters').getPublicUrl(path).data.publicUrl : null
