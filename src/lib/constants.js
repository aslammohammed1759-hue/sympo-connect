export const STATES = ['Tamil Nadu','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry','Jammu and Kashmir','Ladakh','Chandigarh']
export const REPORT_REASONS = { fake: 'Fake or fraudulent event', wrong_info: 'Wrong information', suspicious_link: 'Suspicious registration link', duplicate: 'Duplicate event', other: 'Other' }
export const STATUS_LABEL = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected', needs_correction: 'Needs corrections', removed: 'Removed' }
export const FILTER_KEYS = ['q', 'state', 'district', 'category', 'date', 'mode', 'fee']
export const clean = (v) => Object.fromEntries(FILTER_KEYS.filter((k) => v[k]).map((k) => [k, v[k]]))
export const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
export const fmtFee = (f) => Number(f) === 0 ? 'Free' : `₹${Number(f)}`
export const today = () => new Date().toISOString().slice(0, 10)
