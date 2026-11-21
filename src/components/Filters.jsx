import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { DISTRICTS_BY_STATE, STATES, FILTER_KEYS, clean } from '../lib/constants'

const EMPTY = Object.fromEntries(FILTER_KEYS.map((k) => [k, '']))

export default function Filters({ values = {}, onApply }) {
  const [v, setV] = useState({ ...EMPTY, ...values })
  const [cats, setCats] = useState([])
  const [catsError, setCatsError] = useState(false)
  const key = JSON.stringify(values)
  useEffect(() => {
    let active = true
    supabase.from('event_categories').select('id,name').order('name').then((r) => {
      if (!active) return
      setCats(r.data || [])
      setCatsError(Boolean(r.error))
    }).catch(() => { if (active) setCatsError(true) })
    return () => { active = false }
  }, [])
  useEffect(() => { setV({ ...EMPTY, ...values }) }, [key])
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })
  const districts = DISTRICTS_BY_STATE[v.state] || []
  const setState = (e) => setV({ ...v, state: e.target.value, district: '' })
  return (
    <form className="filters" onSubmit={(e) => { e.preventDefault(); onApply(clean(v)) }}>
      <label className="filter-field">Search events
        <input className="search" type="search" placeholder="College, event, district or state…" value={v.q} onChange={set('q')} />
      </label>
      <div className="filter-grid">
        {catsError && <p className="muted filter-help" role="status">Categories are temporarily unavailable; other filters still work.</p>}
        <label className="filter-field">State
          <select value={v.state} onChange={setState}><option value="">All states</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label className="filter-field">District
          <select value={v.district} onChange={set('district')} disabled={!v.state}><option value="">{v.state ? 'All districts' : 'Choose a state first'}</option>
          {v.district && !districts.includes(v.district) && <option>{v.district}</option>}
          {districts.map((district) => <option key={district}>{district}</option>)}</select>
        </label>
        <label className="filter-field">Category
          <select value={v.category} onChange={set('category')}><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </label>
        <label className="filter-field">From date
          <input type="date" title="Events on or after" value={v.date} onChange={set('date')} />
        </label>
        <label className="filter-field">Event format
          <select value={v.mode} onChange={set('mode')}><option value="">Online / offline</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option></select>
        </label>
        <label className="filter-field">Fee
          <select value={v.fee} onChange={set('fee')}><option value="">Free or paid</option><option value="free">Free</option><option value="paid">Paid</option></select>
        </label>
      </div>
      <div className="row"><button className="btn primary">Search</button><button type="button" className="btn ghost" onClick={() => onApply({})}>Reset</button></div>
    </form>
  )
}
