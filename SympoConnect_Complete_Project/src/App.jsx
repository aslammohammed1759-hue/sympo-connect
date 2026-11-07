import { useMemo, useState } from 'react'
import {
  ArrowRight, CalendarDays, CheckCircle2, Code2, Cpu, Menu, Search,
  Sparkles, Users, X, Camera, Puzzle, Mic2, Globe2, BrainCircuit
} from 'lucide-react'
import { events as eventList } from './events.js'

const categories = ['All Events', 'Technical', 'Non-Technical', 'Creative', 'AI & DS', 'Fun']
const icons = { Technical: Code2, 'Non-Technical': Puzzle, Creative: Camera, 'AI & DS': BrainCircuit, Fun: Sparkles }

function App() {
  const events = eventList
  const [category, setCategory] = useState('All Events')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ participant_name: '', email: '', phone: '', college: '' })
  const [submitState, setSubmitState] = useState({ loading: false, message: '', error: false })

  const filteredEvents = useMemo(() => events.filter(event => {
    const matchesCategory = category === 'All Events' || event.category === category
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || [event.title, event.category, event.description, event.venue]
      .some(value => String(value || '').toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  }), [events, category, search])

  function openRegistration(event) {
    setSelected(event)
    setForm({ participant_name: '', email: '', phone: '', college: '' })
    setSubmitState({ loading: false, message: '', error: false })
  }

  async function submitRegistration(e) {
    e.preventDefault()
    if (!selected) return
    setSubmitState({ loading: true, message: '', error: false })
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selected.id, ...form })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not submit your registration. Please try again.')
      setSubmitState({ loading: false, message: `You're registered for ${selected.title}!`, error: false })
    } catch (err) {
      setSubmitState({ loading: false, message: err.message, error: true })
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="SympoConnect home">
          <span className="brand-mark"><Sparkles size={21} /></span>
          <span>Sympo<span className="brand-accent">Connect</span></span>
        </a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#events" onClick={() => setMenuOpen(false)}>Explore Events</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#footer" onClick={() => setMenuOpen(false)}>Contact</a>
          <a className="nav-cta" href="#events" onClick={() => setMenuOpen(false)}>Register now <ArrowRight size={16}/></a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="live-dot"></span> CAMPUS • CREATIVITY • CONNECTION</div>
              <h1>Ideas meet.<br/><span>Possibilities</span> happen.</h1>
              <p className="hero-subtitle">One campus. Many talents. A day full of ideas, challenges, and unforgettable connections.</p>
              <div className="hero-actions">
                <a className="primary-button" href="#events">Explore events <ArrowRight size={18}/></a>
                <a className="secondary-button" href="#about">Discover SympoConnect</a>
              </div>
              <div className="hero-stats">
                <div><strong>{events.length.toString().padStart(2, '0')}</strong><span>Featured events</span></div>
                <div className="stat-divider"></div>
                <div><strong>02</strong><span>Event tracks</span></div>
                <div className="stat-divider"></div>
                <div><strong>∞</strong><span>Ideas to share</span></div>
              </div>
            </div>
            <div className="hero-art" aria-label="Abstract event artwork">
              <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
              <div className="art-core"><Sparkles size={54}/><span>SC</span></div>
              <div className="float-card card-code"><Code2 size={18}/><span>Build something</span></div>
              <div className="float-card card-brain"><BrainCircuit size={18}/><span>Think differently</span></div>
              <div className="float-card card-people"><Users size={18}/><span>Meet your people</span></div>
              <div className="art-small-dot dot-one"></div><div className="art-small-dot dot-two"></div><div className="art-small-dot dot-three"></div>
            </div>
          </div>
          <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><span className="scroll-line"></span><span>01 / EVENTS</span></div>
        </section>

        <section className="events-section section-wrap" id="events">
          <div className="section-heading">
            <div><div className="section-kicker">FIND YOUR CHALLENGE</div><h2>Choose your <span>moment.</span></h2></div>
            <p>Show what you know, try something new, and make this symposium yours.</p>
          </div>
          <div className="event-toolbar">
            <div className="category-tabs" role="group" aria-label="Filter events">
              {categories.map(item => <button key={item} className={category === item ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <label className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." aria-label="Search events"/></label>
          </div>
          <div className="event-grid">
            {filteredEvents.map((event, index) => {
              const Icon = icons[event.category] || Globe2
              return <article className="event-card" key={event.id}>
                <div className={`event-visual visual-${index % 4}`}>
                  <span className="event-index">{String(index + 1).padStart(2, '0')}</span>
                  <Icon size={38} strokeWidth={1.4}/>
                  <span className="visual-orb"></span>
                  <span className="event-category">{event.category}</span>
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-meta"><span><CalendarDays size={15}/>{event.event_time || 'Time to be announced'}</span><span><Users size={15}/>{event.team_size || 'Individual / Team'}</span></div>
                  <button className="event-register" onClick={() => openRegistration(event)}>View & register <ArrowRight size={16}/></button>
                </div>
              </article>
            })}
          </div>
          {filteredEvents.length === 0 && <div className="empty-state">No events match that search. Try another keyword or category.</div>}
        </section>

        <section className="about-section" id="about">
          <div className="about-inner section-wrap">
            <div className="about-symbol"><Cpu size={46}/><span className="symbol-ring"></span></div>
            <div className="about-copy"><div className="section-kicker">MORE THAN AN EVENT</div><h2>Bring your curiosity.<br/><span>Leave with a connection.</span></h2><p>SympoConnect brings technical talent and creative energy together in one easy-to-explore campus event portal. Find an event, learn what it involves, and register in a few steps.</p></div>
            <div className="about-points"><div><CheckCircle2/><span>Explore events in one place</span></div><div><CheckCircle2/><span>Clear event details</span></div><div><CheckCircle2/><span>Simple registration flow</span></div></div>
          </div>
        </section>
      </main>

      <footer id="footer">
        <div className="footer-main"><a className="brand" href="#home"><span className="brand-mark"><Sparkles size={21}/></span><span>Sympo<span className="brand-accent">Connect</span></span></a><p>Ideas meet. Possibilities happen.</p><a href="#events" className="footer-link">Find your event <ArrowRight size={16}/></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} SympoConnect. Built for campus connections.</span><span className="connection-status"><span className="status-dot good"></span>Registrations open</span></div>
      </footer>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}>
        <section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close registration"><X/></button>
          <div className="modal-kicker">EVENT REGISTRATION</div><h2 id="modal-title">{selected.title}</h2><p className="modal-description">{selected.description}</p>
          {submitState.message ? <div className={submitState.error ? 'form-message error' : 'form-message success'}>{submitState.error ? <X size={18}/> : <CheckCircle2 size={18}/>}<span>{submitState.message}</span></div> :
            <form onSubmit={submitRegistration} className="registration-form">
              <label>Full name<input required minLength="2" maxLength="100" value={form.participant_name} onChange={e => setForm({...form, participant_name: e.target.value})} placeholder="Enter your name"/></label>
              <label>Email address<input required type="email" maxLength="254" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com"/></label>
              <label>Phone number <span>(optional)</span><input type="tel" maxLength="25" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Your contact number"/></label>
              <label>College <span>(optional)</span><input maxLength="150" value={form.college} onChange={e => setForm({...form, college: e.target.value})} placeholder="College name"/></label>
              <button className="primary-button form-submit" disabled={submitState.loading}>{submitState.loading ? 'Submitting…' : 'Submit registration'} <ArrowRight size={17}/></button>
              <small>Your details are saved securely and shared only with the event organisers.</small>
            </form>}
        </section>
      </div>}
    </div>
  )
}

export default App