import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { STATES, FILTER_KEYS, clean } from '../lib/constants'

const EMPTY = Object.fromEntries(FILTER_KEYS.map((k) => [k, '']))

export default function Filters({ values = {}, onApply }) {
  const [v, setV] = useState({ ...EMPTY, ...values })
  const [cats, setCats] = useState([])
  const key = JSON.stringify(values)
  useEffect(() => { supabase.from('event_categories').select('id,name').order('name').then((r) => setCats(r.data || [])) }, [])
  useEffect(() => { setV({ ...EMPTY, ...values }) }, [key])
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  return (
    <form className="filters" onSubmit={(e) => { e.preventDefault(); onApply(clean(v)) }}>
      <input className="search" placeholder="🔍 Search college, event, district or state…" value={v.q} onChange={set('q')} />
      <div className="filter-grid">
        <select value={v.state} onChange={set('state')}><option value="">All states</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
        <input placeholder="District" value={v.district} onChange={set('district')} />
        <select value={v.category} onChange={set('category')}><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input type="date" title="Events on or after" value={v.date} onChange={set('date')} />
        <select value={v.mode} onChange={set('mode')}><option value="">Online / offline</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></select>
        <select value={v.fee} onChange={set('fee')}><option value="">Free or paid</option><option value="free">Free</option><option value="paid">Paid</option></select>
      </div>
      <div className="row"><button className="btn primary">Search</button><button type="button" className="btn ghost" onClick={() => onApply({})}>Reset</button></div>
    </form>
  )
}
