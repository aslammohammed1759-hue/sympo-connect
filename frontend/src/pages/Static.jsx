import { useParams } from 'react-router-dom'

const PAGES = {
  privacy: ['Privacy Policy', 'TEMPLATE: replace this with your real policy. We store your account email, profile details, saved events and submissions in Supabase to run the service. Review with a qualified person before launch.'],
  terms: ['Terms', 'TEMPLATE: replace this with your real terms. Event listings are provided by organizers; always verify an event and its registration link before paying. Review with a qualified person before launch.'],
}
export default function Static() {
  const slug = useParams().slug
  const [title, body] = PAGES[slug] || ['Not found', '']
  return <div className="container narrow"><h1>{title}</h1><p className="pre">{body}</p></div>
}
