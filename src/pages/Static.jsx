import { useParams } from 'react-router-dom'

const email = import.meta.env.VITE_CONTACT_EMAIL

const PAGES = {
  about: {
    title: 'About SympoConnect',
    sections: [
      ['Our purpose', 'SympoConnect helps students discover college symposiums, hackathons, workshops and competitions in one place.'],
      ['Event verification', 'Events submitted by users are pending until staff review them. A “Staff verified” label means a reviewer approved the listing; it is not a guarantee of the organizer, event, payment request or external website. Always confirm important details with the college or organizer.'],
      ['Demo listings', 'Any event labelled DEMO DATA is fictional and must not be treated as a real event.'],
    ],
  },
  contact: {
    title: 'Contact',
    sections: [
      ['Get in touch', email
        ? 'For questions, corrections or concerns about an event, email ' + email + '. Do not send passwords or verification codes.'
        : 'The project owner has not configured a contact email yet. The owner should set VITE_CONTACT_EMAIL in the local environment and Netlify site settings, then rebuild and redeploy.'],
      ['Report a listing', 'Signed-in users can use “Report event” on an event page to flag suspected false information, duplicate listings or suspicious links.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Status of this notice', 'This is a starter privacy notice for the current SympoConnect features, not legal advice. The project owner must review it, confirm the actual hosting and data-retention practices, and obtain qualified advice where needed before public launch. Update this notice whenever the app or its providers change.'],
      ['Information collected', 'When you create an account, the service processes your email address, account identifier, name, college and district. If you use the app, it may also process event submissions and contact details you enter, saved events, reports, in-app notifications, review history and administrative audit records. Event posters you upload are stored using the configured Supabase storage service.'],
      ['How information is used', 'Information is used to create and secure accounts, show event listings, review submissions, save events, handle reports, display notifications and operate moderation features.'],
      ['Service providers and public information', 'The app uses Supabase for authentication, database and file storage, and Netlify for hosting. These providers process information according to their own terms and policies. Approved event listings and their submitted public details may be visible to visitors. The current poster storage configuration may allow anyone with a poster URL to view that image, so do not upload sensitive images.'],
      ['Security and sharing', 'Access controls are implemented in the database, but no internet service can promise absolute security. Do not submit passwords, identity documents or other sensitive information in event descriptions or reports. The project owner should not share private credentials or service-role keys.'],
      ['Retention and your choices', 'This starter notice does not yet specify a verified deletion schedule or a self-service account-deletion process. The project owner must establish and publish a retention/deletion process and provide a working contact route for privacy requests before launch.'],
      ['Children and contact', 'The project owner must determine and publish an appropriate minimum-age and guardian-consent policy for the intended audience. For privacy questions, use the contact details on the Contact page once configured.'],
    ],
  },
  terms: {
    title: 'Terms of Use',
    sections: [
      ['Status of these terms', 'These are starter terms for project review, not legal advice. The project owner should review them with a qualified person and adapt them to the actual operator, applicable law, intended audience and service before public launch.'],
      ['Use of the service', 'Use SympoConnect lawfully and respectfully. Do not impersonate another person or college, upload unlawful or misleading material, misuse contact details, attempt to bypass access controls, or disrupt the service.'],
      ['Event listings and verification', 'Organizers and submitters are responsible for the accuracy and permission to publish the information they provide. Staff review is not a guarantee of authenticity, safety, availability, eligibility, fees or organizer conduct. Check event details directly with the college or organizer before travelling or paying.'],
      ['External links and payments', 'Registration links lead to third-party sites that SympoConnect does not control. Check the destination domain and the organizer independently. Do not send money based only on a listing or a “Staff verified” label. SympoConnect does not process event registration payments through this app.'],
      ['Moderation', 'Submissions may be reviewed, returned for correction, rejected or removed. Users may report listings they believe are inaccurate or suspicious. Access may be restricted for misuse, subject to the operator’s published process and applicable law.'],
      ['Availability and liability', 'The service is provided as available and may contain errors, stale listings or interruptions. To the extent permitted by applicable law, the project operator disclaims warranties and limits liability for third-party events and websites. This wording must be reviewed and adjusted by a qualified person before launch.'],
      ['Contact and updates', 'The project owner should publish a working contact address and an effective date for these terms before public launch. Continued use after a published update may be subject to the updated terms where legally permitted.'],
    ],
  },
}

export default function Static() {
  const page = PAGES[useParams().slug]
  if (!page) return <div className="container narrow"><h1>Page not found</h1></div>
  return (
    <div className="container narrow">
      <h1>{page.title}</h1>
      {page.sections.map(([heading, body]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p className="pre">{body}</p>
        </section>
      ))}
    </div>
  )
}
