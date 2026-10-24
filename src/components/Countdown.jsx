import { useEffect, useState } from 'react'
import { startsAt } from '../lib/constants'

const pad = (n) => String(n).padStart(2, '0')

export default function Countdown({ e, big }) {
  const target = startsAt(e).getTime()
  const [now, setNow] = useState(Date.now())
  const left = target - now
  const soon = left > 0 && left < 864e5
  useEffect(() => {
    if (left <= 0) return
    const t = setInterval(() => setNow(Date.now()), soon || big ? 1000 : 60000)
    return () => clearInterval(t)
  }, [soon, big, left <= 0])

  if (Number.isNaN(target)) return null
  if (left <= 0) return <span className={`countdown ${big ? 'big' : ''} live`}>{left > -864e5 ? '● Happening today' : 'Event ended'}</span>
  const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60
  if (big) return (
    <div className="countdown big" aria-label="Time until the event">
      {[[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']].map(([v, l]) => <span key={l}><b>{pad(v)}</b>{l}</span>)}
    </div>
  )
  return <span className={`countdown ${soon ? 'soon' : ''}`}>⏱ {d > 0 ? `${d}d ${h}h left` : `${pad(h)}:${pad(m)}:${pad(s)} left`}</span>
}
