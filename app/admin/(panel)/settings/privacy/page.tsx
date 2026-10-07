import { LegalPage } from '@/components/admin/legal-page'

// Placeholder copy — replace with the reviewed legal text before launch.
const SECTIONS = [
  { heading: 'What we collect', body: 'We collect the details you give us — name, email, delivery address and order history — plus basic usage data such as the wigs you swipe on, save and try on.' },
  { heading: 'How we use it', body: 'We use your information to process orders, match you with wigs, prevent fraud, resolve disputes and, with your consent, send you notifications about restocks and offers.' },
  { heading: 'Sharing with vendors', body: 'When you place an order, we share the details a vendor needs to fulfil it, such as your name and delivery or pickup information. Vendors may not use it for any other purpose.' },
  { heading: 'Payments', body: 'Card payments are handled by our payment processor. The Cut stores only the last four digits of your card for your reference.' },
  { heading: 'Your choices', body: 'You can update your profile, turn off push notifications, or ask us to delete your account at any time from the app or by contacting support.' },
  { heading: 'Retention and security', body: 'We keep data only as long as needed for the purposes above or as required by law, and we protect it with industry-standard safeguards.' },
]

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" updated="Aug 1, 2026" sections={SECTIONS} />
}
