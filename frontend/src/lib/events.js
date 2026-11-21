import { supabase } from '../supabaseClient'
import { today } from './constants'

export const PAGE_SIZE = 9
const safe = (s) => (s || '').replace(/[,()%*\\]/g, ' ').trim()

// Public discovery query. RLS already limits anonymous users to approved events.
export function fetchEvents(f, page = 1, sort = 'date') {
  let q = supabase.from('events').select('*, event_categories(name,icon)', { count: 'exact' }).eq('status', 'approved')
  q = q.gte('event_date', f.date || today())
  const s = safe(f.q)
  if (s) q = q.or(`title.ilike.%${s}%,college_name.ilike.%${s}%,district.ilike.%${s}%,state.ilike.%${s}%`)
  if (f.state) q = q.eq('state', f.state)
  if (safe(f.district)) q = q.ilike('district', `%${safe(f.district)}%`)
  if (f.category) q = q.eq('category_id', Number(f.category))
  if (f.mode) q = q.eq('mode', f.mode)
  if (f.fee === 'free') q = q.eq('fee', 0)
  if (f.fee === 'paid') q = q.gt('fee', 0)
  if (sort === 'newest') q = q.order('created_at', { ascending: false })
  else if (sort === 'fee') q = q.order('fee', { ascending: true })
  else q = q.order('event_date', { ascending: true })
  const from = (page - 1) * PAGE_SIZE
  return q.range(from, from + PAGE_SIZE - 1)
}
