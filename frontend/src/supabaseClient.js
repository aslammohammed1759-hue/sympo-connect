import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''
const placeholder = /your-(?:actual-)?(?:project-id|project-url|anon-key|actual-anon-key)|replace-me|placeholder/i

const validUrl = (() => {
  try {
    const parsed = new URL(url)
    return ['https:', 'http:'].includes(parsed.protocol) && Boolean(parsed.hostname)
  } catch {
    return false
  }
})()

export const isConfigured = validUrl && Boolean(key) && !placeholder.test(url) && !placeholder.test(key)
export const configError = !url || !key
  ? 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the dev server.'
  : !isConfigured
    ? 'Supabase configuration is invalid. Check the project URL and anon key in .env.local, then restart the dev server.'
    : ''
export const supabase = isConfigured ? createClient(url, key) : null
export const posterUrl = (path) =>
  path ? supabase.storage.from('posters').getPublicUrl(path).data.publicUrl : null
