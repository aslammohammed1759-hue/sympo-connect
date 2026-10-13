import { Link } from 'react-router-dom'
import { posterUrl } from '../supabaseClient'
import { fmtDate, fmtFee, STATUS_LABEL } from '../lib/constants'

export default function EventCard({ e, showStatus }) {
  const poster = posterUrl(e.poster_path)
  const verified = e.status === 'approved' && !e.is_demo
  return (
    <Link to={`/events/${e.id}`} className="card event">
      <div className="poster" style={poster ? { backgroundImage: `url(${poster})` } : undefined}>
        {!poster && <span className="poster-icon">{e.event_categories?.icon || '🎓'}</span>}
        {e.is_demo && <span className="badge demo">DEMO DATA</span>}
        {verified && !showStatus && <span className="badge ok">✓ Staff verified</span>}
        {showStatus && <span className={`badge st-${e.status}`}>{STATUS_LABEL[e.status]}</span>}
      </div>
      <div className="body">
        <span className="chip">{e.event_categories?.name || 'Event'}</span>
        <h3>{e.title}</h3>
        <p className="muted">{e.college_name}</p>
        <p className="meta">📍 {e.district}, {e.state}</p>
        <div className="foot"><span>📅 {fmtDate(e.event_date)}</span><b>{fmtFee(e.fee)}</b></div>
      </div>
    </Link>
  )
}
