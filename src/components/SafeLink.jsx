import { useState } from 'react'
import { assessUrl, normalizeUrl } from '../lib/url'

// Every external link goes through a confirmation dialog showing the real domain and any red flags.
export default function SafeLink({ href, children, className = 'btn primary' }) {
  const [open, setOpen] = useState(false)
  const clean = normalizeUrl(href)
  if (!clean) return <span className="muted">Invalid link</span>
  const info = assessUrl(clean)
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{children}</button>
      {open && (
        <div className="modal-bg" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>You are leaving SympoConnect</h3>
            <p>This link goes to <b>{info.host}</b>.</p>
            {info.warnings.length > 0 && <ul className="warn">{info.warnings.map((w) => <li key={w}>⚠️ {w}</li>)}</ul>}
            <p className="muted">
              {info.academic ? 'The domain looks academic, but still check it matches the college.' : 'We cannot confirm this site belongs to the college. Never pay or share passwords unless you are sure it is genuine.'}
            </p>
            <div className="row">
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn primary" onClick={() => { window.open(clean, '_blank', 'noopener,noreferrer'); setOpen(false) }}>Open link</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
