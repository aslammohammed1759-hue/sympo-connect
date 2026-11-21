import { Link } from 'react-router-dom'

const FEATURES = [
  ['01', 'College email checks', 'A confirmed inbox and an admin-managed domain allowlist identify trusted college accounts. They do not prove an event is genuine.'],
  ['02', 'Staff-reviewed events', 'The staff-approved badge appears only after a staff member reviews and approves the event.'],
  ['03', 'Direct registration', 'Open the organizer’s registration page and confirm the details before sharing personal information or paying.'],
  ['04', 'Event media', 'Posters and supported promo links help students understand what an organizer is offering.'],
]

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="about-kicker">A campus-first discovery platform</span>
          <h1>Find your next big idea<br />outside the classroom.</h1>
          <p>SympoConnect helps students across India discover symposia, hackathons, workshops and campus competitions.</p>
          <p className="about-owner">A college project by Mohammed Aslam S A.</p>
          <div className="row about-actions">
            <Link to="/events" className="btn primary">Explore events</Link>
            <Link to="/submit" className="btn about-secondary">Host an event</Link>
          </div>
          <p className="about-caveat">A verified college account is not an event endorsement. Always check event details before you register or pay.</p>
        </div>
      </section>

      <section className="container about-section">
        <div className="about-section-heading">
          <span className="about-kicker">Why we’re here</span>
          <h2>Make campus opportunities easier to find.</h2>
        </div>
        <div className="about-purpose-grid">
          <article className="about-purpose">
            <h3>Our mission</h3>
            <p>Connect students with learning and networking opportunities, and give college organizers a clear place to share event information.</p>
          </article>
          <article className="about-purpose">
            <h3>Our vision</h3>
            <p>A more connected campus community where useful events are easier to discover and students can make informed choices before they register.</p>
          </article>
        </div>
      </section>

      <section className="about-feature-band">
        <div className="container about-section">
          <div className="about-section-heading">
            <span className="about-kicker">Built for campus events</span>
            <h2>Useful details. Clear trust signals.</h2>
          </div>
          <div className="about-feature-grid">
            {FEATURES.map(([number, title, description]) => (
              <article className="about-feature" key={number}>
                <span className="about-feature-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container about-section">
        <div className="about-section-heading">
          <span className="about-kicker">How it works</span>
          <h2>One platform, two campus journeys.</h2>
        </div>
        <div className="about-journeys">
          <article className="about-journey">
            <h3>For students</h3>
            <ol>
              <li><b>Discover</b><span>Browse events by state, district, category and date.</span></li>
              <li><b>Review</b><span>Check the event details, organizer and staff-review status.</span></li>
              <li><b>Register</b><span>Continue to the organizer’s official registration link.</span></li>
            </ol>
          </article>
          <article className="about-journey">
            <h3>For organizers</h3>
            <ol>
              <li><b>Submit</b><span>Sign in with a verified email and share event details and a poster.</span></li>
              <li><b>Account check</b><span>An allowlisted college domain can label the account as a verified college account.</span></li>
              <li><b>Staff review</b><span>Every submission remains pending until staff approve, reject or request corrections.</span></li>
            </ol>
          </article>
        </div>
      </section>

      <section className="about-trust-band">
        <div className="container about-trust-inner">
          <div>
            <span className="about-kicker">Trust, with context</span>
            <h2>Verification should be clear about what it means.</h2>
          </div>
          <p>SympoConnect distinguishes a verified college email account from a staff-approved event. Account and submission access is governed by Supabase authentication and database policies. A badge is useful context, not a guarantee: confirm the organizer and registration details before paying.</p>
        </div>
      </section>
    </div>
  )
}
