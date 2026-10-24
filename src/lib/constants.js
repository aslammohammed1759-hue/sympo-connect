export const STATES = ['Tamil Nadu','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry','Jammu and Kashmir','Ladakh','Chandigarh']
export const REPORT_REASONS = { fake: 'Fake or fraudulent event', wrong_info: 'Wrong information', suspicious_link: 'Suspicious registration link', duplicate: 'Duplicate event', other: 'Other' }
export const STATUS_LABEL = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected', needs_correction: 'Needs corrections', removed: 'Removed' }
export const FILTER_KEYS = ['q', 'category', 'college', 'date', 'until', 'state', 'district', 'mode', 'fee']
export const EVENT_TYPES = ['Symposium', 'Hackathon', 'Workshop', 'Competition']
export const clean = (v) => Object.fromEntries(FILTER_KEYS.filter((k) => v[k]).map((k) => [k, v[k]]))
export const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
export const fmtFee = (f) => Number(f) === 0 ? 'Free' : `₹${Number(f)}`
export const today = () => new Date().toLocaleDateString('en-CA') // local YYYY-MM-DD
export const fmtTime = (t) => t ? new Date(`2000-01-01T${t.slice(0, 5)}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : ''
// Event times are entered in Indian Standard Time; date-only events count down to 9 AM.
export const startsAt = (e) => new Date(`${e.event_date}T${(e.event_time || '09:00').slice(0, 5)}:00+05:30`)
