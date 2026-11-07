import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, CalendarDays, CheckCircle2, Code2, Cpu, Menu, Search,
  Sparkles, Users, X, Camera, Puzzle, Globe2, BrainCircuit, LoaderCircle, Send
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './supabase.js'
import './contact.css'

const demoEvents = [
  { id: 'paper', title: 'Paper Presentation', category: 'Technical', description: 'Present your research, ideas, and innovations to a panel of reviewers.', event_time: '10:00 AM', venue: 'Seminar Hall', team_size: 'Individual / Team', fee: 0 },
  { id: 'code', title: 'Code Busters', category: 'Technical', description: 'Solve programming challenges with logic, speed, and clean code.', event_time: '11:00 AM', venue: 'Computer Lab', team_size: 'Individual / Team', fee: 0 },
  { id: 'web', title: 'Web Craft', category: 'Technical', description: 'Turn a creative prompt into a polished web experience.', event_time: '12:00 PM', venue: 'Computer Lab', team_size: 'Individual / Team', fee: 0 },
  { id: 'mime', title: 'MIME MANIA', category: 'Non-Technical', description: 'Tell a story through expression, movement, and imagination.', event_time: '01:00 PM', venue: 'Main Auditorium', team_size: 'Team', fee: 0 },
  { id: 'clue', title: 'Clue Quest', category: 'Non-Technical', description: 'Follow clues, solve puzzles, and race toward the final answer.', event_time: '02:00 PM', venue: 'Campus', team_size: 'Team', fee: 0 },
  { id: 'snap', title: 'Snap Sense', category: 'Creative', description: 'Capture a compelling moment around a surprise theme.', event_time: '02:30 PM', venue: 'Campus', team_size: 'Individual', fee: 0 },
  { id: 'connect', title: 'CONNECT CRAZE', category: 'Fun', description: 'Meet your team, think fast, and take on interactive rounds.', event_time: '03:00 PM', venue: 'Activity Hall', team_size: 'Team', fee: 0 },
  { id: 'ai', title: 'Human vs AI', category: 'AI & DS', description: 'Compare human reasoning with AI-powered answers in a fun challenge.', event_time: '03:30 PM', venue: 'Seminar Hall', team_size: 'Individual / Team', fee: 0 },
]
const categories = ['All Events', 'Technical', 'Non-Technical', 'Creative', 'AI & DS', 'Fun']
const icons = { Technical: Code2, 'Non-Technical': Puzzle, Creative: Camera, 'AI & DS': BrainCircuit, Fun: Sparkles }
const requestTimeoutMs = 12000
const assistantTimeoutMs = 18000

function isUpcoming(event) {
  if (!event.event_date) return true
  const eventDate = new Date(`${event.event_date}T23:59:59`)
  return Number.isNaN(eventDate.getTime()) || eventDate >= new Date()
}

function App() {
  const [events, setEvents] = useState(demoEvents)
  const [category, setCategory] = useState('All Events')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ participant_name: '', email: '', phone: '', college: '' })
  const [submitState, setSubmitState] = useState({ loading: false, message: '', error: false })
  const [dbStatus, setDbStatus] = useState(isSupabaseConfigured ? 'Connecting to Supabase…' : 'Preview mode')
  const [assistantQuery, setAssistantQuery] = useState('')
  const [assistantMessages, setAssistantMessages] = useState([])
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [assistantError, setAssistantError] = useState('')

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, requestTimeoutMs)

    async function loadEvents() {
      if (!isSupabaseConfigured) {
        clearTimeout(timeoutId)
        setDbStatus('Preview mode · add Supabase variables to connect')
        return
      }
      try {
        const { data, error } = await supabase.from('events')
          .select('id,title,category,description,event_date,event_time,venue,team_size,fee')
          .eq('status', 'published')
          .order('created_at', { ascending: true })
          .abortSignal(controller.signal)
        if (!active) return
        if (error) {
          setDbStatus(timedOut ? 'Supabase timed out · showing preview events' : 'Supabase needs attention')
          console.error('Supabase event load error:', error.message)
          return
        }
        setEvents(data || [])
        setDbStatus('Connected to Supabase')
      } catch (error) {
        if (!active) return
        setDbStatus(timedOut ? 'Supabase timed out · showing preview events' : 'Supabase needs attention')
        console.error('Supabase event load error:', error)
      } finally {
        clearTimeout(timeoutId)
      }
    }
    loadEvents()
    return () => {
      active = false
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

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
    if (!isSupabaseConfigured || String(selected.id).length < 20) {
      setSubmitState({
        loading: false,
        message: 'Preview only: connect Supabase and load the SQL schema before accepting real registrations.',
        error: true
      })
      return
    }
    const controller = new AbortController()
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, requestTimeoutMs)

    try {
      const { error } = await supabase.from('registrations').insert({
        event_id: selected.id,
        participant_name: form.participant_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        college: form.college.trim() || null
      }).abortSignal(controller.signal)
      if (error) {
        console.error('Registration error:', error.message)
        setSubmitState({
          loading: false,
          message: timedOut ? 'The request timed out. Please check your connection and try again.' : error.message,
          error: true
        })
      } else {
        setSubmitState({ loading: false, message: 'Registration submitted successfully!', error: false })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setSubmitState({
        loading: false,
        message: timedOut ? 'The request timed out. Please check your connection and try again.' : 'We could not submit your registration. Please try again.',
        error: true
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async function askAssistant(e) {
    e.preventDefault()
    const query = assistantQuery.trim()
    if (!query || assistantLoading) return

    setAssistantMessages(current => [...current, { role: 'user', text: query }].slice(-12))
    setAssistantQuery('')
    setAssistantError('')
    setAssistantLoading(true)
    const controller = new AbortController()
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, assistantTimeoutMs)

    try {
      const response = await fetch('/.netlify/functions/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          events: events.slice(0, 20).map(({ title, category, description, event_date, event_time, venue, team_size }) => ({
            title, category, description, event_date, event_time, venue, team_size
          }))
        }),
        signal: controller.signal
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.answer) {
        throw new Error(result?.error || 'The assistant response was unavailable. Please try again.')
      }
      setAssistantMessages(current => [...current, { role: 'assistant', text: result.answer }].slice(-12))
    } catch (error) {
      setAssistantQuery(query)
      setAssistantError(timedOut
        ? 'The assistant took too long to respond. Please try again.'
        : error instanceof Error && error.message !== 'Failed to fetch'
          ? error.message
          : 'We could not reach the assistant. Please try again in a moment.')
    } finally {
      clearTimeout(timeoutId)
      setAssistantLoading(false)
    }
  }

  const upcomingEvents = events.filter(isUpcoming)
  const codingAndHackathonEvents = upcomingEvents.filter(event =>
    /hack|code|coding|program/i.test(`${event.title} ${event.category}`)
  )

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
          <a href="#assistant" onClick={() => setMenuOpen(false)}>AI guide</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
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
                <div><strong>{upcomingEvents.length.toString().padStart(2, '0')}</strong><span>Upcoming events</span></div>
                <div className="stat-divider"></div>
                <div><strong>{codingAndHackathonEvents.length.toString().padStart(2, '0')}</strong><span>Hackathons & coding</span></div>
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

        <section className="assistant-section section-wrap" id="assistant">
          <div className="section-heading">
            <div><div className="section-kicker">YOUR EVENT SIDEKICK</div><h2>Find your <span>next challenge.</span></h2></div>
            <p>Ask about event formats, categories, or where to start. Answers use the events currently listed on this page.</p>
          </div>
          <div className="assistant-panel">
            <div className="assistant-title"><span className="assistant-icon"><BrainCircuit size={20}/></span><div><strong>SympoConnect AI guide</strong><span>Ask a question about the symposium</span></div></div>
            <div className="assistant-messages" role="log" aria-live="polite" aria-relevant="additions text">
              {assistantMessages.length === 0 && <p className="assistant-empty">Try asking “Which events are good for a beginner coder?”</p>}
              {assistantMessages.map((message, index) => <p className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'user' ? 'You' : 'AI guide'}</span>{message.text}</p>)}
              {assistantLoading && <p className="assistant-loading"><LoaderCircle className="loading-spinner" size={16}/> Looking through the event details…</p>}
            </div>
            {assistantError && <p className="assistant-error" role="alert">{assistantError}</p>}
            <form className="assistant-form" onSubmit={askAssistant}>
              <input value={assistantQuery} onChange={e => setAssistantQuery(e.target.value)} maxLength="1000" required disabled={assistantLoading} aria-label="Ask the AI event guide" placeholder="Ask a question about these events…"/>
              <button type="submit" className="assistant-send" aria-label="Send question" disabled={assistantLoading || !assistantQuery.trim()}>{assistantLoading ? <LoaderCircle className="loading-spinner" size={18}/> : <Send size={18}/>}</button>
            </form>
            <small className="assistant-note">Please avoid sharing personal or sensitive information.</small>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-inner section-wrap">
            <div className="about-symbol"><Cpu size={46}/><span className="symbol-ring"></span></div>
            <div className="about-copy"><div className="section-kicker">MORE THAN AN EVENT</div><h2>Bring your curiosity.<br/><span>Leave with a connection.</span></h2><p>SympoConnect brings technical talent and creative energy together in one easy-to-explore campus event portal. Find an event, learn what it involves, and register in a few steps.</p></div>
            <div className="about-points"><div><CheckCircle2/><span>Explore events in one place</span></div><div><CheckCircle2/><span>Clear event details</span></div><div><CheckCircle2/><span>Simple registration flow</span></div></div>
          </div>
        </section>

        <section className="contact-section section-wrap" id="contact">
          <div className="section-heading">
            <div><div className="section-kicker">GET IN TOUCH</div><h2>Questions? <span>We’re here.</span></h2></div>
            <p>Reach out to the SympoConnect organizers for help with events, registration, or the symposium.</p>
          </div>
          <div className="contact-card">
            <div><h3>Contact the organizers</h3><p>We’d be happy to help with your questions.</p></div>
            <a className="contact-email" href="mailto:aslammohammed1909@gmail.com">aslammohammed1909@gmail.com <ArrowRight size={17}/></a>
          </div>
        </section>
      </main>

      <footer id="footer">
        <div className="footer-main"><a className="brand" href="#home"><span className="brand-mark"><Sparkles size={21}/></span><span>Sympo<span className="brand-accent">Connect</span></span></a><p>Ideas meet. Possibilities happen.</p><a href="#contact" className="footer-link">Contact the organizers <ArrowRight size={16}/></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} SympoConnect. Built for campus connections.</span><span className="connection-status" role="status" aria-live="polite"><span className={dbStatus === 'Connected to Supabase' ? 'status-dot good' : 'status-dot'}></span>{dbStatus}</span></div>
      </footer>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}>
        <section className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close registration"><X/></button>
          <div className="modal-kicker">EVENT REGISTRATION</div><h2 id="modal-title">{selected.title}</h2><p className="modal-description">{selected.description}</p>
          {submitState.message && <div className={submitState.error ? 'form-message error' : 'form-message success'} role={submitState.error ? 'alert' : 'status'} aria-live="polite">{submitState.error ? <X size={18}/> : <CheckCircle2 size={18}/>}<span>{submitState.message}</span></div>}
          {(!submitState.message || submitState.error) && <form onSubmit={submitRegistration} className="registration-form" aria-busy={submitState.loading}>
              <label>Full name<input required minLength="2" maxLength="100" value={form.participant_name} onChange={e => setForm({...form, participant_name: e.target.value})} placeholder="Enter your name"/></label>
              <label>Email address<input required type="email" maxLength="254" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com"/></label>
              <label>Phone number <span>(optional)</span><input type="tel" maxLength="25" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Your contact number"/></label>
              <label>College <span>(optional)</span><input maxLength="150" value={form.college} onChange={e => setForm({...form, college: e.target.value})} placeholder="College name"/></label>
              <button className="primary-button form-submit" disabled={submitState.loading}>{submitState.loading ? <><LoaderCircle className="loading-spinner" size={17}/> Submitting…</> : <>Submit registration <ArrowRight size={17}/></>}</button>
              <small>Your information is submitted to the event database when Supabase is configured.</small>
            </form>}
        </section>
      </div>}
    </div>
  )
}

export default App