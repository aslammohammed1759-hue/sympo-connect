import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { STATUS_LABEL } from '../lib/constants'
import EventCard from '../components/EventCard'
import StatePanel from '../components/StatePanel'

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') || 'saved'
  const [saved, setSaved] = useState([])
  const [mine, setMine] = useState([])
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const load = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const [savedResult, mineResult, notesResult] = await Promise.all([
        supabase.from('saved_events').select('events(*, event_categories(name,icon))').order('created_at', { ascending: false }),
        supabase.from('events').select('*, event_categories(name,icon)').eq('submitted_by', user.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      if (savedResult.error || mineResult.error || notesResult.error) throw new Error('Dashboard data could not be loaded.')
      setSaved((savedResult.data || []).map((x) => x.events).filter(Boolean))
      setMine(mineResult.data || [])
      setNotes(notesResult.data || [])
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])
  useEffect(() => { if (profile) setForm({ full_name: profile.full_name, college_name: profile.college_name, district: profile.district, reminders: profile.notify_prefs?.reminders !== false }) }, [profile])

  const markAll = async () => { await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false); load() }
  const saveProfile = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({ full_name: form.full_name.trim(), college_name: form.college_name.trim(), district: form.district.trim(), notify_prefs: { in_app: true, reminders: form.reminders } }).eq('id', user.id)
    setMsg(error ? error.message : 'Profile saved.'); refreshProfile()
  }
  const requestStaff = async () => {
    const { error } = await supabase.from('profiles').update({ staff_requested: true }).eq('id', user.id)
    setMsg(error ? error.message : 'Request sent. An administrator will review it.'); refreshProfile()
  }
  const tabs = [['saved', 'Saved'], ['submissions', 'My submissions'], ['notifications', 'Notifications'], ['profile', 'Profile']]

  return (
    <div className="container">
      <h1>Hi{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋</h1>
      <div className="tabs" role="group" aria-label="Dashboard sections">{tabs.map(([k, l]) => <button type="button" key={k} className={tab === k ? 'on' : ''} aria-pressed={tab === k} onClick={() => setSp({ tab: k })}>{l}</button>)}</div>

      {loading
        ? <StatePanel variant="loading" title="Loading your dashboard" />
        : loadError
          ? <StatePanel variant="error" title="Dashboard data couldn’t load" message="Your account is unchanged. Check your connection and try again." actionLabel="Retry" onAction={load} />
          : <>
      {tab === 'saved' && (saved.length === 0
        ? <StatePanel title="No saved events yet" message="Save an event to keep it handy here." />
        : <div className="grid">{saved.map((e) => <EventCard key={e.id} e={e} />)}</div>)}

      {tab === 'submissions' && (mine.length === 0 ? <StatePanel title="No submissions yet" message="Your event submissions and their review status will appear here."><Link className="btn primary state-action" to="/submit">Post an event</Link></StatePanel> :
        <div className="list">{mine.map((e) => (
          <div key={e.id} className="card row-item">
            <div><b>{e.title}</b><br /><span className={`badge inline st-${e.status}`}>{STATUS_LABEL[e.status]}</span>
              {e.trusted_college_domain && <span className="badge inline trusted" title="Email domain is allowlisted; this does not mean the event was staff-approved">Verified college account</span>}
              {e.review_note && <p className="muted">Staff note: {e.review_note}</p>}</div>
            <div className="row">
              <Link className="btn ghost" to={`/events/${e.id}`}>View</Link>
              {['pending', 'needs_correction'].includes(e.status) && <Link className="btn primary" to={`/submit?edit=${e.id}`}>{e.status === 'needs_correction' ? 'Fix & resubmit' : 'Edit'}</Link>}
            </div>
          </div>))}</div>)}

      {tab === 'notifications' && (<>
        <button className="btn ghost" onClick={markAll}>Mark all as read</button>
        {notes.length === 0 ? <StatePanel title="You’re all caught up" message="New updates about your events will appear here." /> :
          <div className="list">{notes.map((n) => (
            <Link key={n.id} to={n.event_id ? `/events/${n.event_id}` : '#'} className={`card note ${n.is_read ? '' : 'unread'}`}>
              <b>{n.title}</b><p>{n.body}</p><small className="muted">{new Date(n.created_at).toLocaleString()}</small>
            </Link>))}</div>}
      </>)}

      {tab === 'profile' && form && (
        <form className="card form" onSubmit={saveProfile}>
          <label>Full name<input value={form.full_name} maxLength={100} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
          <label>College<input value={form.college_name} maxLength={150} onChange={(e) => setForm({ ...form, college_name: e.target.value })} /></label>
          <label>District<input value={form.district} maxLength={80} onChange={(e) => setForm({ ...form, district: e.target.value })} /></label>
          <label className="check"><input type="checkbox" checked={form.reminders} onChange={(e) => setForm({ ...form, reminders: e.target.checked })} /> Send me reminders for saved events</label>
          <p className="muted">Role: <b>{profile.role}</b></p>
          {msg && <p className="notice">{msg}</p>}
          <div className="row"><button className="btn primary">Save profile</button>
            {profile.role === 'student' && !profile.staff_requested && <button type="button" className="btn ghost" onClick={requestStaff}>Request staff access</button>}
            {profile.staff_requested && <span className="muted">Staff access requested</span>}</div>
        </form>)}
          </>}
    </div>
  )
}
