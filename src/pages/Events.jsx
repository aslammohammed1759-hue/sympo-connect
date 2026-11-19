import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchEvents, PAGE_SIZE } from '../lib/events'
import { FILTER_KEYS } from '../lib/constants'
import Filters from '../components/Filters'
import EventCard from '../components/EventCard'
import StatePanel from '../components/StatePanel'

const MAX_PAGE = Math.floor(Number.MAX_SAFE_INTEGER / PAGE_SIZE)

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export default function Events() {
  const [sp, setSp] = useSearchParams()
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const pageParam = sp.get('page')
  const parsedPage = Number(pageParam)
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= MAX_PAGE ? parsedPage : 1
  const sortParam = sp.get('sort')
  const sort = ['date', 'newest', 'fee'].includes(sortParam) ? sortParam : 'date'
  const filters = Object.fromEntries(FILTER_KEYS.filter((k) => sp.get(k)).map((k) => [k, sp.get(k)]))
  if (filters.category && (!/^[1-9]\d*$/.test(filters.category) || !Number.isSafeInteger(Number(filters.category)))) delete filters.category
  if (filters.date && !isValidDate(filters.date)) delete filters.date
  if (filters.mode && !['online', 'offline', 'hybrid'].includes(filters.mode)) delete filters.mode
  if (filters.fee && !['free', 'paid'].includes(filters.fee)) delete filters.fee

  useEffect(() => {
    const next = new URLSearchParams(sp)
    let changed = false
    if (pageParam !== null && (!/^[1-9]\d*$/.test(pageParam) || !Number.isSafeInteger(parsedPage) || parsedPage > MAX_PAGE)) {
      next.delete('page')
      changed = true
    }
    if (sortParam !== null && !['date', 'newest', 'fee'].includes(sortParam)) {
      next.delete('sort')
      changed = true
    }
    const category = next.get('category')
    if (category !== null && (!/^[1-9]\d*$/.test(category) || !Number.isSafeInteger(Number(category)))) {
      next.delete('category')
      changed = true
    }
    const date = next.get('date')
    if (date !== null && !isValidDate(date)) {
      next.delete('date')
      changed = true
    }
    const mode = next.get('mode')
    if (mode !== null && !['online', 'offline', 'hybrid'].includes(mode)) {
      next.delete('mode')
      changed = true
    }
    const fee = next.get('fee')
    if (fee !== null && !['free', 'paid'].includes(fee)) {
      next.delete('fee')
      changed = true
    }
    if (changed) setSp(next, { replace: true })
  }, [pageParam, parsedPage, setSp, sortParam, sp])

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
