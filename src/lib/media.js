import { normalizeUrl } from './url'

const ID = /^[A-Za-z0-9_-]{6,64}$/
const hostOf = (u) => u.hostname.toLowerCase().replace(/^(www|m)\./, '')

// Turns a YouTube / Google Drive / Instagram link into an embeddable player URL, or null.
export function embedFor(input) {
  const href = normalizeUrl(input)
  if (!href) return null
  const u = new URL(href)
  const host = hostOf(u)
  const parts = u.pathname.split('/').filter(Boolean)
  let id
  if (host === 'youtu.be') id = parts[0]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = u.searchParams.get('v') || (['shorts', 'embed', 'live'].includes(parts[0]) ? parts[1] : null)
  }
  if (id && ID.test(id)) return { kind: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${id}`, tall: parts[0] === 'shorts' }
  if (host === 'drive.google.com') {
    id = parts[0] === 'file' && parts[1] === 'd' ? parts[2] : u.searchParams.get('id')
    if (id && ID.test(id)) return { kind: 'Google Drive', src: `https://drive.google.com/file/d/${id}/preview` }
  }
  if (host === 'instagram.com') {
    const i = parts.findIndex((p) => ['p', 'reel', 'reels', 'tv'].includes(p))
    const code = i >= 0 ? parts[i + 1] : null
    if (code && /^[A-Za-z0-9_-]{5,40}$/.test(code)) return { kind: 'Instagram', src: `https://www.instagram.com/${parts[i] === 'p' ? 'p' : 'reel'}/${code}/embed`, tall: true }
  }
  return null
}

export const isVideoLink = (s) => ['YouTube', 'Google Drive'].includes(embedFor(s)?.kind)
const SOCIAL = ['instagram.com', 'facebook.com', 'fb.watch', 'linkedin.com', 'x.com', 'twitter.com', 'youtube.com', 'youtu.be']
export function isSocialLink(s) {
  const href = normalizeUrl(s)
  if (!href) return false
  const host = hostOf(new URL(href))
  return SOCIAL.some((d) => host === d || host.endsWith('.' + d))
}

// Promo links of an event, embeddable ones first.
export const promosOf = (e) => [['Video promo', e.video_url], ['Social post', e.social_url]]
  .filter(([, url]) => url).map(([label, url]) => ({ label, url, embed: embedFor(url) }))
  .sort((a, b) => !!b.embed - !!a.embed)
