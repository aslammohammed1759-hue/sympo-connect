import { useParams } from 'react-router-dom'

const email = import.meta.env.VITE_CONTACT_EMAIL
const PAGES = {
  about: ['About SympoConnect', 'SympoConnect helps students discover college symposiums, hackathons, workshops and competitions. Every public listing is reviewed by staff, and events labelled DEMO DATA are fictional samples.'],
  contact: ['Contact', email ? `Reach us at ${email}.` : 'No contact email is configured yet. The site owner should set VITE_CONTACT_EMAIL.'],
  privacy: ['Privacy Policy', 'TEMPLATE: replace this with your real policy. We store your account email, profile details, saved events and submissions in Supabase to run the service. Review with a qualified person before launch.'],
  terms: ['Terms', 'TEMPLATE: replace this with your real terms. Event listings are provided by organizers; always verify an event and its registration link before paying. Review with a qualified person before launch.'],
}
export default function Static() {
  const [title, body] = PAGES[useParams().slug] || ['Not found', '']
  return <div className="container narrow"><h1>{title}</h1><p className="pre">{body}</p></div>
}
