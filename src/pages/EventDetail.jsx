import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, posterUrl } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { fmtDate, fmtFee, REPORT_REASONS, STATUS_LABEL } from '../lib/constants'
import SafeLink from '../components/SafeLink'

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [e, setE] = useState(undefined)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState('')
  const [report, setReport] = useState(false)
  const [rep, setRep] = useState({ reason: 'fake', details: '' })

  useEffect(() => {
    supabase.from('events').select('*, event_categories(name,icon)').eq('id', id).maybeSingle().then((r) => setE(r.data || null))
    if (user) supabase.from('saved_events').select('event_id').eq('event_id', id).maybeSingle().then((r) => setSaved(!!r.data))
  }, [id, user])

  const needLogin = () => { setMsg('Please log in first.'); return !user }
  const toggleSave = async () => {
    if (needLogin()) return
    const { error } = saved
      ? await supabase.from('saved_events').delete().eq('event_id', id).eq('user_id', user.id)
      : await supabase.from('saved_events').insert({ event_id: id, user_id: user.id })
    if (error) return setMsg(error.message)
    setSaved(!saved); setMsg(saved ? 'Removed from saved events.' : 'Saved!')
  }
  const share = async () => {
    const url = window.location.href
    if (navigator.share) { try { await navigator.share({ title: e.title, url }) } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(url); setMsg('Link copied to clipboard.') }
  }
  const sendReport = async (ev) => {
    ev.preventDefault()
    const { error } = await supabase.from('event_reports').insert({ event_id: id, reporter_id: user.id, reason: rep.reason, details: rep.details.slice(0, 1000) || null })
    setReport(false)
    setMsg(error ? (error.code === '23505' ? 'You already reported this event.' : error.message) : 'Thanks, staff will review your report.')
  }

  if (e === undefined) return <p className="center">Loading…</p>
  if (e === null) return <div className="center"><h2>Event not found</h2><p className="muted">It may not exist or is not approved yet.</p><Link to="/events">Back to events</Link></div>
  const poster = posterUrl(e.poster_path)
  const verified = e.status === 'approved' && !e.is_demo

  return (
    <div className="container detail">
      {e.is_demo && <p className="alert">DEMO DATA: this is a fictional event for previewing the site. It is not real and has not been verified.</p>}
      {e.status !== 'approved' && <p className="alert">Status: {STATUS_LABEL[e.status]}. Only you and staff can see this page.</p>}
      <div className="detail-grid">
        <div>{poster ? <img className="big-poster" src={poster} alt={`${e.title} poster`} /> : <div className="poster big"><span className="poster-icon">{e.event_categories?.icon || '🎓'}</span></div>}</div>
        <div>
          <span className="chip">{e.event_categories?.name}</span>
          {verified ? <span className="badge ok inline">✓ Staff verified</span> : e.is_demo ? <span className="badge demo inline">DEMO DATA</span> : null}
          <h1>{e.title}</h1>
          <p className="lead">{e.college_name}</p>
          <ul className="facts">
            <li>📅 <b>Date:</b> {fmtDate(e.event_date)}</li>
            <li>⏳ <b>Register by:</b> {fmtDate(e.registration_deadline)}</li>
            <li>📍 <b>Where:</b> {e.mode === 'online' ? 'Online' : `${e.venue || 'Venue TBA'}, ${e.district}, ${e.state}`} ({e.mode})</li>
            <li>💳 <b>Fee:</b> {fmtFee(e.fee)}</li>
            <li>✉️ <b>Contact:</b> {e.contact}</li>
          </ul>
          <div className="row">
            <SafeLink href={e.registration_url}>Official registration ↗</SafeLink>
            {e.video_url && <SafeLink href={e.video_url} className="btn ghost">Promo video ↗</SafeLink>}
          </div>
          <div className="row">
            <button className="btn ghost" onClick={toggleSave}>{saved ? '★ Saved' : '☆ Save event'}</button>
            <button className="btn ghost" onClick={share}>Share</button>
            <button className="btn ghost danger" onClick={() => (needLogin() ? null : setReport(true))}>🚩 Report event</button>
          </div>
          {msg && <p className="notice">{msg}</p>}
        </div>
      </div>
      <h2>About this event</h2>
      <p className="pre">{e.description}</p>
      {report && (
        <div className="modal-bg" onClick={() => setReport(false)}>
          <form className="modal" onClick={(x) => x.stopPropagation()} onSubmit={sendReport}>
            <h3>Report this event</h3>
            <select value={rep.reason} onChange={(x) => setRep({ ...rep, reason: x.target.value })}>{Object.entries(REPORT_REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <textarea maxLength={1000} placeholder="Details (optional)" value={rep.details} onChange={(x) => setRep({ ...rep, details: x.target.value })} />
            <div className="row"><button type="button" className="btn ghost" onClick={() => setReport(false)}>Cancel</button><button className="btn primary">Send report</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
