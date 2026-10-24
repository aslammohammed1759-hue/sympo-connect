import { useEffect, useState } from 'react'
import SafeLink from './SafeLink'

// Plays YouTube / Drive / Instagram promos inline; other links fall back to the safe external-link dialog.
export default function PromoModal({ title, promos, onClose }) {
  const [i, setI] = useState(0)
  const p = promos[i]
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal promo" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${title} promo`}>
        <div className="promo-head"><h3>{title}</h3><button className="x" onClick={onClose} aria-label="Close">✕</button></div>
        {promos.length > 1 && <div className="tabs">{promos.map((x, k) => <button key={x.url} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{x.label}</button>)}</div>}
        {p.embed ? (
          <div className={`player ${p.embed.tall ? 'tall' : ''}`}>
            <iframe src={p.embed.src} title={`${title} – ${p.label}`} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        ) : <p className="muted">This link can't be previewed here.</p>}
        <div className="row"><SafeLink href={p.url} className="btn ghost">Open {p.embed ? `on ${p.embed.kind}` : 'link'} ↗</SafeLink></div>
      </div>
    </div>
  )
}
