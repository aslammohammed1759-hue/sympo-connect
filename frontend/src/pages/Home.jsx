import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { today } from '../lib/constants'
import Filters from '../components/Filters'
import EventCard from '../components/EventCard'
import StatePanel from '../components/StatePanel'

function Row({ title, state, empty, onRetry }) {
  const { items, loading, error } = state
  return (
    <section className="section">
      <h2>{title}</h2>
      {loading
        ? <StatePanel variant="loading" title="Finding events" message="This should only take a moment." />
        : error
          ? <StatePanel variant="error" title="Events couldn’t load" message="Check your connection and try again." actionLabel="Retry" onAction={onRetry} />
          : items.length === 0
            ? <StatePanel title="Nothing to show yet" message={empty} />
            : <div className="grid">{items.map((e) => <EventCard key={e.id} e={e} />)}</div>}
    </section>
  )
}

export default function Home() {
  const nav = useNavigate()
  const [cats, setCats] = useState({ items: [], loading: true, error: false })
  const [featured, setFeatured] = useState({ items: [], loading: true, error: false })
  const [upcoming, setUpcoming] = useState({ items: [], loading: true, error: false })
  const [recent, setRecent] = useState({ items: [], loading: true, error: false })
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    let active = true
    const loading = { items: [], loading: true, error: false }
    setCats(loading)
    setFeatured(loading)
    setUpcoming(loading)
    setRecent(loading)
    const base = () => supabase.from('events').select('*, event_categories(name,icon)').eq('status', 'approved')
    Promise.all([
      supabase.from('event_categories').select('*').order('name'),
      base().eq('is_featured', true).gte('event_date', today()).order('event_date').limit(3),
      base().gte('event_date', today()).order('event_date').limit(6),
      base().order('created_at', { ascending: false }).limit(6),
    ]).then(([categoryResult, featuredResult, upcomingResult, recentResult]) => {
      if (!active) return
      setCats({ items: categoryResult.data || [], loading: false, error: Boolean(categoryResult.error) })
      setFeatured({ items: featuredResult.data || [], loading: false, error: Boolean(featuredResult.error) })
      setUpcoming({ items: upcomingResult.data || [], loading: false, error: Boolean(upcomingResult.error) })
      setRecent({ items: recentResult.data || [], loading: false, error: Boolean(recentResult.error) })
    }).catch(() => {
      if (!active) return
      setCats({ items: [], loading: false, error: true })
      setFeatured({ items: [], loading: false, error: true })
      setUpcoming({ items: [], loading: false, error: true })
      setRecent({ items: [], loading: false, error: true })
    })
    return () => { active = false }
  }, [refresh])

  const retry = () => setRefresh((value) => value + 1)

  return (
    <>
      <section className="hero">
        <h1>Discover Your Next College Opportunity</h1>
        <p>Find symposiums, hackathons, workshops, and competitions near you.</p>
        <Filters onApply={(v) => nav(`/events?${new URLSearchParams(v)}`)} />
      </section>
      <div className="container">
        <section className="section">
          <h2>Browse by category</h2>
          {cats.loading
            ? <StatePanel variant="loading" title="Loading categories" />
            : cats.error
              ? <StatePanel variant="error" title="Categories couldn’t load" message="Try again to browse event types." actionLabel="Retry" onAction={retry} />
              : cats.items.length === 0
                ? <StatePanel title="No categories available" message="Event categories will appear here when available." />
                : <div className="cats">{cats.items.map((c) => <Link key={c.id} to={`/events?category=${c.id}`} className="cat"><span aria-hidden="true">{c.icon}</span>{c.name}</Link>)}</div>}
        </section>
        {(featured.loading || featured.error || featured.items.length > 0) && <Row title="Featured events" state={featured} onRetry={retry} />}
        <Row title="Upcoming events" state={upcoming} onRetry={retry} empty="No upcoming approved events yet. Organizers can post one; staff will review it before it appears." />
        <Row title="Recently added" state={recent} onRetry={retry} empty="New event listings will appear here." />
      </div>
    </>
  )
}
