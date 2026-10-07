import { LegalPage } from '@/components/admin/legal-page'

// Placeholder copy — replace with the reviewed legal text before launch.
const SECTIONS = [
  { heading: 'About The Cut', body: 'The Cut is a marketplace that connects shoppers with independent wig vendors. The Cut is not the seller of record; each vendor is responsible for the products it lists and the orders it fulfils.' },
  { heading: 'Accounts', body: 'You must provide accurate information when creating an account and keep your credentials secure. You are responsible for all activity under your account.' },
  { heading: 'Orders and payments', body: 'Prices are set by vendors and shown in US dollars. Payment is taken when an order is placed. Delivery and pickup windows are estimates provided by the vendor.' },
  { heading: 'Returns and disputes', body: 'Return eligibility follows each vendor’s policy. If you and a vendor cannot resolve an issue, you may open a dispute and The Cut will review it and decide on a resolution.' },
  { heading: 'Vendor obligations', body: 'Vendors must describe products accurately, honour stated fulfilment times and comply with applicable laws. The Cut may suspend vendors who breach these terms.' },
  { heading: 'Acceptable use', body: 'You may not misuse the platform, including fraudulent orders, chargeback abuse, or attempts to interfere with other users. We may suspend accounts flagged for risk.' },
  { heading: 'Changes', body: 'We may update these terms from time to time. Continued use of The Cut after changes take effect means you accept the updated terms.' },
]

export default function TermsPage() {
  return <LegalPage title="Terms of service" updated="Aug 1, 2026" sections={SECTIONS} />
}
