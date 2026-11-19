import { useEffect, useState } from 'react'
import { supabase, posterUrl } from '../supabaseClient'
import { fmtDate, fmtFee, STATUS_LABEL } from '../lib/constants'
import SafeLink from '../components/SafeLink'
import StatePanel from '../components/StatePanel'

const SEL = '*, event_categories(name), submitter:profiles!events_submitted_by_fkey(full_name,college_name), reviewer:profiles!events_reviewed_by_fkey(full_name)'
const CHECKS = [['college', 'College is genuine'], ['organizer', 'Organizer/contact verified'], ['link', 'Registration link checked'], ['poster', 'Poster reviewed']]

function ReviewCard({ e, onDone }) {
  const [checks, setChecks] = useState({})
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const poster = posterUrl(e.poster_path)

  const act = async (action) => {
    setErr('')
    if (action === 'approve' && !CHECKS.every(([k]) => checks[k])) return setErr('Tick every verification check before approving.')
    if (action !== 'approve' && !note.trim()) return setErr('Write a reason/note first.')
    setBusy(true)
    const { error } = await supabase.rpc('review_event', { p_event_id: e.id, p_action: action, p_note: note.trim() || null })
    setBusy(false)
    error ? setErr(error.message) : onDone()
  }
  return (
    <div className="card review">
      {poster && <img src={poster} alt="poster" className="thumb" />}
      <div>
        <h3>{e.title}</h3>
        <p className="muted">{e.college_name} · {e.district}, {e.state} · {e.event_categories?.name}</p>
        <p>📅 {fmtDate(e.event_date)} · deadline {fmtDate(e.registration_deadline)} · {fmtFee(e.fee)} · {e.mode}</p>
        <p>✉️ {e.contact}</p>
        <p className="muted">Submitted by {e.submitter?.full_name || 'unknown'} ({e.submitter?.college_name || '-'})</p>
        <p className="muted">{e.trusted_college_domain ? `Verified college account (${e.submitter_email_domain})` : e.submitter_email_verified ? 'Verified email; domain is not allowlisted' : 'Email not verified (legacy or manual submission)'}. This signal does not verify the event itself.</p>
        <p className="pre clip">{e.description}</p>
        <div className="row"><SafeLink href={e.registration_url} className="btn ghost">Check registration link ↗</SafeLink></div>
        <div className="checks">{CHECKS.map(([k, l]) => <label key={k} className="check"><input type="checkbox" checked={!!checks[k]} onChange={(x) => setChecks({ ...checks, [k]: x.target.checked })} /> {l}</label>)}</div>
        <textarea placeholder="Reason or note (required for reject / corrections)" value={note} onChange={(x) => setNote(x.target.value)} />
        {err && <p className="alert">{err}</p>}
        <div className="row">
          <button className="btn primary" disabled={busy} onClick={() => act('approve')}>Approve</button>
          <button className="btn ghost" disabled={busy} onClick={() => act('needs_correction')}>Request corrections</button>
          <button className="btn ghost danger" disabled={busy} onClick={() => act('reject')}>Reject</button>
        </div>
      </div>
    </div>
  )
}

export default function Staff() {
  const [tab, setTab] = useState('pending')
  const [items, setItems] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const load = () => {
    setItems(null)
    setLoadError(false)
    const q = supabase.from('events').select(SEL)
    ;(tab === 'pending' ? q.eq('status', 'pending').order('created_at') : q.not('reviewed_by', 'is', null).order('reviewed_at', { ascending: false }).limit(50)).then((r) => {
      if (r.error) setLoadError(true)
      else setItems(r.data || [])
    }).catch(() => setLoadError(true))
  }
  useEffect(load, [tab])
  return (
    <div className="container">
      <h1>Staff verification</h1>
      <div className="tabs" role="group" aria-label="Submission queue">{['pending', 'reviewed'].map((key) => <button type="button" key={key} className={tab === key ? 'on' : ''} aria-pressed={tab === key} onClick={() => setTab(key)}>{key === 'pending' ? 'Pending' : 'Reviewed'}</button>)}</div>
      {loadError
        ? <StatePanel variant="error" title="Review queue couldn’t load" message="No review actions were changed. Try again." actionLabel="Retry" onAction={load} />
        : items === null
          ? <StatePanel variant="loading" title="Loading review queue" />
          : items.length === 0
            ? <StatePanel title={tab === 'pending' ? 'No pending submissions' : 'No reviewed events'} message="There are no items in this view right now." />
            : tab === 'pending' ? items.map((e) => <ReviewCard key={e.id} e={e} onDone={load} />) :
          <div className="list">{items.map((e) => (
            <div key={e.id} className="card row-item"><div><b>{e.title}</b><br /><span className={`badge inline st-${e.status}`}>{STATUS_LABEL[e.status]}</span>
              <p className="muted">By {e.reviewer?.full_name || 'staff'} on {new Date(e.reviewed_at).toLocaleString()}{e.review_note ? ` · ${e.review_note}` : ''}</p></div></div>))}</div>}
    </div>
  )
}
