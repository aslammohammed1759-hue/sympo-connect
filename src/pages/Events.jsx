import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchEvents, PAGE_SIZE } from '../lib/events'
import { FILTER_KEYS } from '../lib/constants'
import Filters from '../components/Filters'
import EventCard from '../components/EventCard'

export default function Events() {
  const [sp, setSp] = useSearchParams()
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const page = Number(sp.get('page') || 1)
  const sort = sp.get('sort') || 'date'
  const filters = Object.fromEntries(FILTER_KEYS.filter((k) => sp.get(k)).map((k) => [k, sp.get(k)]))

  useEffect(() => {
    let on = true
    setLoading(true); setError('')
    fetchEvents(filters, page, sort).then(({ data, count, error }) => {
      if (!on) return
      if (error) setError(error.message)
      setItems(data || []); setCount(count || 0); setLoading(false)
    })
    return () => { on = false }
  }, [sp.toString()])

  const update = (patch) => { const n = Object.fromEntries(sp.entries()); Object.assign(n, patch); Object.keys(n).forEach((k) => !n[k] && delete n[k]); setSp(n) }
  const apply = (v) => setSp({ ...v, ...(sort !== 'date' ? { sort } : {}) })
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="container">
      <h1>Discover events</h1>
      <Filters values={filters} onApply={apply} />
      <div className="bar">
        <span className="muted">{loading ? 'Searching…' : `${count} event${count === 1 ? '' : 's'} found`}</span>
        <select value={sort} onChange={(e) => update({ sort: e.target.value, page: '' })}>
          <option value="date">Soonest first</option><option value="newest">Recently added</option><option value="fee">Lowest fee</option>
        </select>
      </div>
      {error && <p className="alert">Could not load events: {error}</p>}
      {!loading && !error && items.length === 0 ? (
        <div className="empty"><h3>No events match your search</h3><p>Try removing a filter, or <Link to="/submit">post an event</Link> you know about.</p></div>
      ) : <div className="grid">{items.map((e) => <EventCard key={e.id} e={e} />)}</div>}
      {pages > 1 && (
        <div className="pager">
          <button className="btn ghost" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>← Prev</button>
          <span>Page {page} of {pages}</span>
          <button className="btn ghost" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })}>Next →</button>
        </div>
      )}
    </div>
  )
}
