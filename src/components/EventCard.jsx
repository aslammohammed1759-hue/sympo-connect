import { useState } from 'react'
import { Link } from 'react-router-dom'
import { posterUrl } from '../supabaseClient'
import { fmtDate, fmtFee, fmtTime, STATUS_LABEL } from '../lib/constants'
import { promosOf } from '../lib/media'
import Countdown from './Countdown'
import PromoModal from './PromoModal'
import SafeLink from './SafeLink'

export const VerifiedBadge = ({ e, inline }) => {
  if (e.status !== 'approved' || e.is_demo) return null
  return e.verified_via === 'college_email'
    ? <span className={`badge ok ${inline ? 'inline' : ''}`} title={`Organizer verified an @${e.verified_domain} email`}>✓ College verified</span>
    : <span className={`badge ok ${inline ? 'inline' : ''}`}>✓ Staff verified</span>
}

export default function EventCard({ e, showStatus }) {
  const [promo, setPromo] = useState(false)
  const poster = posterUrl(e.poster_path)
  const promos = promosOf(e)
  const to = `/events/${e.id}`
  return (
    <div className="card event">
      <Link to={to} className="poster" style={poster ? { backgroundImage: `url(${poster})` } : undefined} aria-label={e.title}>
        {!poster && <span className="poster-icon">{e.event_categories?.icon || '🎓'}</span>}
        {e.is_demo && <span className="badge demo">DEMO DATA</span>}
        {!showStatus && <VerifiedBadge e={e} />}
        {showStatus && <span className={`badge st-${e.status}`}>{STATUS_LABEL[e.status]}</span>}
        <span className="chip on-poster">{e.event_categories?.name || 'Event'}</span>
      </Link>
      <div className="body">
        <Link to={to}><h3>{e.title}</h3></Link>
        <p className="muted">{e.college_name}</p>
        <p className="meta">📍 {e.mode === 'online' ? 'Online' : `${e.venue ? e.venue + ', ' : ''}${e.district}`}</p>
        <div className="foot"><span>📅 {fmtDate(e.event_date)}{e.event_time ? ` · ${fmtTime(e.event_time)}` : ''}</span><b>{fmtFee(e.fee)}</b></div>
        <Countdown e={e} />
        <div className="actions">
          <SafeLink href={e.registration_url} className="btn primary sm">Register Now</SafeLink>
          {promos.length > 0 && <button type="button" className="btn ghost sm" onClick={() => setPromo(true)}>▶ Watch Video Promo</button>}
        </div>
      </div>
      {promo && <PromoModal title={e.title} promos={promos} onClose={() => setPromo(false)} />}
    </div>
  )
}
