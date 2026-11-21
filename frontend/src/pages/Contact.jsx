import { useState } from 'react'

const CONTACT_EMAIL = 'aslammohammed1909@gmail.com'
const SOCIALS = [
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/mohammed-aslam-s-a-976aa7400/' },
  { name: 'Instagram' },
  { name: 'GitHub', href: 'https://github.com/aslammohammed1759-hue' },
  { name: 'X' },
]
const FAQS = [
  { question: 'How does an event get a staff-approved badge?', answer: 'Submit the event with a verified email and required details. Staff review the event and its links; the staff-approved badge appears only after they approve it.' },
  { question: 'What domain emails are accepted for a verified college account?', answer: 'Only exact domains added to SympoConnect’s administrator-managed trusted-college list receive the verified college account label. A confirmed inbox or college domain does not automatically approve an event.' },
  { question: 'Can I register directly through SympoConnect?', answer: 'SympoConnect links to the organizer’s registration page. Check the organizer, fees and event details on that page before registering or paying.' },
  { question: 'How can I request a correction to an event listing?', answer: 'Use the contact form and include the event title, event page link and the information that needs correction.' },
]

export default function Contact() {
  const [form, setForm] = useState({ fullName: '', email: '', role: 'Student', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setToast(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setToast({ type: 'error', text: 'Enter a valid email address.' })
      return
    }
    if (form.message.trim().length < 10) {
      setToast({ type: 'error', text: 'Please include a little more detail in your message.' })
      return
    }

    setLoading(true)
    const body = [
      `Name: ${form.fullName.trim()}`,
      `Email: ${form.email.trim()}`,
      `Role: ${form.role}`,
      '',
      form.message.trim(),
    ].join('\n')
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[SympoConnect] ${form.subject.trim()}`)}&body=${encodeURIComponent(body)}`
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    window.location.href = mailto
    setLoading(false)
    setToast({ type: 'success', text: 'Your email app should open with this message. Review it there and press Send.' })
  }

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <span className="about-kicker">We’re listening</span>
          <h1>Get in Touch</h1>
          <p>Questions, event updates or campus ideas? Students, organizers and campus ambassadors are welcome to reach out.</p>
        </div>
      </section>

      <section className="container contact-content">
        <div className="contact-card-grid">
          <article className="contact-info-card">
            <span className="contact-card-index">01 / EMAIL</span>
            <h2>Project owner</h2>
            <p>For student and organizer support, email Mohammed Aslam S A.</p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href="tel:9566202285">Call 9566202285</a>
          </article>
          <article className="contact-info-card">
            <span className="contact-card-index">02 / HELPDESK</span>
            <h2>Student & organizer helpdesk</h2>
            <p><b>Hours:</b> No fixed hours. Email anytime; replies are handled as soon as possible.</p>
          </article>
          <article className="contact-info-card">
            <span className="contact-card-index">03 / LOCATION</span>
            <h2>Tirunelveli, Tamil Nadu</h2>
            <p>SympoConnect is an online college project based in Tirunelveli, India. No public campus or visitor address is listed.</p>
          </article>
          <article className="contact-info-card">
            <span className="contact-card-index">04 / SOCIAL</span>
            <h2>Find the project owner</h2>
            <div className="contact-socials">
              {SOCIALS.map((social) => social.href
                ? <a key={social.name} href={social.href} target="_blank" rel="noreferrer">{social.name}<span aria-hidden="true">↗</span></a>
                : <span className="contact-social-unavailable" key={social.name}>{social.name}<small>Not linked</small></span>)}
            </div>
          </article>
        </div>

        <div className="contact-main-grid">
          <section className="contact-form-section">
            <div className="about-section-heading">
              <span className="about-kicker">Send a message</span>
              <h2>How can we help?</h2>
              <p>We’ll prepare a message in your email app so you can review it before sending.</p>
            </div>
            <form className="card form contact-form" onSubmit={submit}>
              <div className="two">
                <label>Full name<input required autoComplete="name" maxLength={100} value={form.fullName} onChange={update('fullName')} /></label>
                <label>Email address<input required type="email" autoComplete="email" maxLength={254} value={form.email} onChange={update('email')} /></label>
              </div>
              <label>Your role<select value={form.role} onChange={update('role')}><option>Student</option><option>College Staff</option><option>Event Organizer</option></select></label>
              <label>Subject<input required maxLength={120} value={form.subject} onChange={update('subject')} /></label>
              <label>Message<textarea required minLength={10} maxLength={3000} rows={6} value={form.message} onChange={update('message')} /></label>
              <p className="muted contact-form-note">No message is stored on the site. Your email app will open with the details you entered.</p>
              <button className="btn primary" disabled={loading}>{loading ? 'Preparing message…' : 'Continue to email'}</button>
            </form>
            {toast && <div className={`contact-toast ${toast.type}`} role="status" aria-live="polite">{toast.text}<button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button></div>}
          </section>

          <section className="contact-faq-section">
            <div className="about-section-heading">
              <span className="about-kicker">Quick answers</span>
              <h2>Frequently asked</h2>
            </div>
            <div className="contact-faq-list">
              {FAQS.map((faq) => <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>)}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
