import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchEvents, PAGE_SIZE } from '../lib/events'
import { FILTER_KEYS } from '../lib/constants'
import Filters from '../components/Filters'
import EventCard from '../components/EventCard'
import StatePanel from '../components/StatePanel'

export default function Events() {
  const [sp, setSp] = useSearchParams()
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const page = Number(sp.get('page') || 1)
  const sort = sp.get('sort') || 'date'
  const filters = Object.fromEntries(FILTER_KEYS.filter((k) => sp.get(k)).map((k) => [k, sp.get(k)]))

  useEffect(() => {
    let on = true
    setLoading(true); setError(false)
    fetchEvents(filters, page, sort).then(({ data, count, error: resultError }) => {
      if (!on) return
      if (resultError) setError(true)
      setItems(data || []); setCount(count || 0); setLoading(false)
    }).catch(() => {
      if (!on) return
      setError(true)
      setItems([])
      setCount(0)
      setLoading(false)
    })
    return () => { on = false }
  }, [sp.toString(), refresh])

  const update = (patch) => { const n = Object.fromEntries(sp.entries()); Object.assign(n, patch); Object.keys(n).forEach((k) => !n[k] && delete n[k]); setSp(n) }
  const apply = (v) => setSp({ ...v, ...(sort !== 'date' ? { sort } : {}) })
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div className="container">
      <h1>Discover events</h1>
      <Filters values={filters} onApply={apply} />
      <div className="bar">
        <span className="muted" aria-live="polite">{loading ? 'Searching…' : `${count} event${count === 1 ? '' : 's'} found`}</span>
        <label className="filter-field sort-field">Sort by
          <select aria-label="Sort events" value={sort} onChange={(e) => update({ sort: e.target.value, page: '' })}>
          <option value="date">Soonest first</option><option value="newest">Recently added</option><option value="fee">Lowest fee</option>
          </select>
        </label>
      </div>
      {loading
        ? <StatePanel variant="loading" title="Searching events" message="Updating results for your filters." />
        : error
          ? <StatePanel variant="error" title="Couldn’t load events" message="Please check your connection and try again." actionLabel="Retry" onAction={() => setRefresh((value) => value + 1)} />
          : items.length === 0
            ? <>
                <StatePanel title="No events match your search" message="Try removing a filter or clearing your search." actionLabel="Reset filters" onAction={() => apply({})} />
                <p className="center">Know about an event? <Link to="/submit">Post it for review.</Link></p>
              </>
            : <div className="grid">{items.map((e) => <EventCard key={e.id} e={e} />)}</div>}
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
