// Browser-side hints only. The database (trusted_submitter_domain) makes the real decision.
export const ACADEMIC_SUFFIXES = ['.edu.in', '.ac.in']
const PROOF = ['otp', 'magiclink', 'email/signup']

export const domainOf = (email) => (email || '').trim().toLowerCase().split('@')[1] || ''
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim())

export function isCollegeEmail(email, extraDomains = []) {
  const d = domainOf(email)
  if (!d) return false
  return ACADEMIC_SUFFIXES.some((s) => d.endsWith(s)) || extraDomains.some((x) => d === x || d.endsWith('.' + x))
}

// True when the current session was opened by proving inbox ownership (OTP / magic link), not by password.
export function sessionProvedEmail(session) {
  try {
    const b64 = session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')))
    return (claims.amr || []).some((a) => PROOF.includes(a.method))
  } catch { return false }
}
