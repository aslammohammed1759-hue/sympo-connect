import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { today } from '../lib/constants'
import Filters from '../components/Filters'
import EventCard from '../components/EventCard'

function Row({ title, items, empty }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {items === null ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="empty">{empty}</p> :
        <div className="grid">{items.map((e) => <EventCard key={e.id} e={e} />)}</div>}
    </section>
  )
}

export default function Home() {
  const nav = useNavigate()
  const [cats, setCats] = useState([])
  const [featured, setFeatured] = useState(null)
  const [upcoming, setUpcoming] = useState(null)
  const [recent, setRecent] = useState(null)

  useEffect(() => {
    const base = () => supabase.from('events').select('*, event_categories(name,icon)').eq('status', 'approved')
    supabase.from('event_categories').select('*').order('name').then((r) => setCats(r.data || []))
    base().eq('is_featured', true).gte('event_date', today()).order('event_date').limit(3).then((r) => setFeatured(r.data || []))
    base().gte('event_date', today()).order('event_date').limit(6).then((r) => setUpcoming(r.data || []))
    base().order('created_at', { ascending: false }).limit(6).then((r) => setRecent(r.data || []))
  }, [])

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
          <div className="cats">{cats.map((c) => <Link key={c.id} to={`/events?category=${c.id}`} className="cat"><span>{c.icon}</span>{c.name}</Link>)}</div>
        </section>
        {featured && featured.length > 0 && <Row title="⭐ Featured events" items={featured} />}
        <Row title="Upcoming events" items={upcoming} empty="No upcoming approved events yet. Organizers can post one; staff will review it before it appears." />
        <Row title="Recently added" items={recent} empty="Nothing here yet." />
      </div>
    </>
  )
}
