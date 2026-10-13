import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { STATES, today } from '../lib/constants'
import { normalizeUrl } from '../lib/url'

const MAX = 2 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BLANK = { title: '', college_name: '', district: '', state: 'Tamil Nadu', description: '', category_id: '', event_date: '', registration_deadline: '', fee: '0', mode: 'offline', venue: '', contact: '', registration_url: '', video_url: '' }

export default function Submit() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const editId = useSearchParams()[0].get('edit')
  const [f, setF] = useState({ ...BLANK, college_name: profile?.college_name || '', district: profile?.district || '' })
  const [cats, setCats] = useState([])
  const [file, setFile] = useState(null)
  const [existing, setExisting] = useState(null)
  const [errs, setErrs] = useState([])
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    supabase.from('event_categories').select('id,name').order('name').then((r) => setCats(r.data || []))
    if (editId) supabase.from('events').select('*').eq('id', editId).eq('submitted_by', user.id).maybeSingle().then(({ data }) => {
      if (!data) return
      setExisting(data)
      setF(Object.fromEntries(Object.keys(BLANK).map((k) => [k, data[k] ?? ''])))
    })
  }, [editId])

  const validate = () => {
    const e = []
    if (f.title.trim().length < 3) e.push('Event title is required (min 3 characters).')
    if (f.college_name.trim().length < 3) e.push('Organizing college is required.')
    if (f.district.trim().length < 2) e.push('District is required.')
    if (f.description.trim().length < 20) e.push('Description must be at least 20 characters.')
    if (!f.category_id) e.push('Choose a category.')
    if (!f.event_date) e.push('Event date is required.')
    else if (!existing && f.event_date < today()) e.push('Event date cannot be in the past.')
    if (f.registration_deadline && f.event_date && f.registration_deadline > f.event_date) e.push('Registration deadline must be on or before the event date.')
    if (!(Number(f.fee) >= 0)) e.push('Fee must be 0 or more.')
    if (f.mode !== 'online' && !f.venue.trim()) e.push('Venue is required for offline/hybrid events.')
    const c = f.contact.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) && !/^[+\d][\d\s-]{7,15}$/.test(c)) e.push('Contact must be a valid email or phone number.')
    if (!normalizeUrl(f.registration_url)) e.push('Enter a valid official registration URL (http/https).')
    if (f.video_url && !normalizeUrl(f.video_url)) e.push('Promotional video URL is invalid.')
    if (!existing && !file) e.push('Upload an event poster.')
    if (file && !TYPES.includes(file.type)) e.push('Poster must be a JPG, PNG or WebP image.')
    if (file && file.size > MAX) e.push('Poster must be 2 MB or smaller.')
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const e = validate(); setErrs(e)
    if (e.length) return window.scrollTo({ top: 0, behavior: 'smooth' })
    setBusy(true)
    try {
      let poster_path = existing?.poster_path || null
      if (file) {
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const up = await supabase.storage.from('posters').upload(path, file, { contentType: file.type })
        if (up.error) throw up.error
        poster_path = path
      }
      const row = {
        title: f.title.trim(), college_name: f.college_name.trim(), district: f.district.trim(), state: f.state,
        description: f.description.trim(), category_id: Number(f.category_id), event_date: f.event_date,
        registration_deadline: f.registration_deadline || null, fee: Number(f.fee), mode: f.mode,
        venue: f.venue.trim() || null, contact: f.contact.trim(), registration_url: normalizeUrl(f.registration_url),
        video_url: f.video_url ? normalizeUrl(f.video_url) : null, poster_path,
      }
      const { error } = existing
        ? await supabase.from('events').update(row).eq('id', existing.id)
        : await supabase.from('events').insert({ ...row, submitted_by: user.id }) // status defaults to 'pending'
      if (error) throw error
      nav('/dashboard?tab=submissions')
    } catch (x) { setErrs([x.message || 'Something went wrong.']); window.scrollTo({ top: 0 }) }
    setBusy(false)
  }

  return (
    <div className="container narrow">
      <h1>{existing ? 'Edit & resubmit event' : 'Post an event'}</h1>
      <p className="muted">Submissions are reviewed by staff before they appear publicly.</p>
      {errs.length > 0 && <div className="alert"><ul>{errs.map((x) => <li key={x}>{x}</li>)}</ul></div>}
      <form className="card form" onSubmit={submit}>
        <label>Event title<input value={f.title} maxLength={150} onChange={set('title')} /></label>
        <label>Organizing college<input value={f.college_name} maxLength={150} onChange={set('college_name')} /></label>
        <div className="two"><label>District<input value={f.district} maxLength={80} onChange={set('district')} /></label>
          <label>State<select value={f.state} onChange={set('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select></label></div>
        <label>Description<textarea rows={5} maxLength={5000} value={f.description} onChange={set('description')} /></label>
        <div className="two"><label>Category<select value={f.category_id} onChange={set('category_id')}><option value="">Select…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Mode<select value={f.mode} onChange={set('mode')}><option value="offline">Offline</option><option value="online">Online</option><option value="hybrid">Hybrid</option></select></label></div>
        <div className="two"><label>Event date<input type="date" value={f.event_date} onChange={set('event_date')} /></label>
          <label>Registration deadline<input type="date" value={f.registration_deadline} onChange={set('registration_deadline')} /></label></div>
        <div className="two"><label>Registration fee (₹, 0 = free)<input type="number" min="0" step="1" value={f.fee} onChange={set('fee')} /></label>
          <label>Venue<input value={f.venue} maxLength={300} onChange={set('venue')} /></label></div>
        <label>Contact email or phone<input value={f.contact} maxLength={150} onChange={set('contact')} /></label>
        <label>Official registration URL<input value={f.registration_url} onChange={set('registration_url')} placeholder="https://…" /></label>
        <label>Promotional video URL (optional)<input value={f.video_url} onChange={set('video_url')} placeholder="https://…" /></label>
        <label>Event poster (JPG/PNG/WebP, max 2 MB){existing && ' - leave empty to keep the current poster'}<input type="file" accept={TYPES.join(',')} onChange={(e) => setFile(e.target.files[0] || null)} /></label>
        <button className="btn primary wide" disabled={busy}>{busy ? 'Submitting…' : existing ? 'Resubmit for review' : 'Submit for review'}</button>
      </form>
    </div>
  )
}
