const SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','rb.gy','cutt.ly','is.gd','shorturl.at','ow.ly']
const ACADEMIC = ['.ac.in', '.edu.in', '.edu', '.gov.in', '.nic.in']

// Returns a cleaned http(s) URL string, or null if invalid.
export function normalizeUrl(input) {
  if (!input) return null
  let s = input.trim()
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s
  try {
    const u = new URL(s)
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return null
    if (!u.hostname.includes('.')) return null
    return u.toString()
  } catch { return null }
}

export function assessUrl(href) {
  const u = new URL(href)
  const host = u.hostname.toLowerCase()
  const warnings = []
  if (u.protocol !== 'https:') warnings.push('This link is not encrypted (http).')
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) warnings.push('This link uses a raw IP address.')
  if (host.includes('xn--')) warnings.push('The domain uses look-alike (punycode) characters.')
  if (SHORTENERS.includes(host)) warnings.push('A link shortener hides the real destination.')
  if ((host.match(/-/g) || []).length >= 3) warnings.push('The domain has many hyphens, which is common in scam sites.')
  return { host, warnings, academic: ACADEMIC.some((s) => host.endsWith(s)) }
}
