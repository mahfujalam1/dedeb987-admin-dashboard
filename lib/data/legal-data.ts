export interface LegalDocument {
  id: 'terms' | 'privacy'
  title: string
  lastUpdated: string
  htmlContent: string
}

export const initialTermsHtml = `<h1>Terms of Service</h1>
<p><em>Last updated: August 1, 2026</em></p>

<h2>1. About The Cut</h2>
<p>The Cut is a premier curated marketplace that connects discerning shoppers with independent bespoke wig vendors and atelier hair creators. The Cut is not the direct seller of record for vendor inventory; each vendor boutique is responsible for the products it lists, unit customizations, and orders it fulfills.</p>

<h2>2. Accounts and Security</h2>
<p>You must provide accurate, current, and complete information when creating an account on The Cut and keep your credentials confidential. You are solely responsible for all activities and transactions conducted under your authenticated account.</p>

<h2>3. Orders, Pricing, and Payments</h2>
<p>All prices are set independently by vendors and displayed in United States Dollars (USD). Payment is authorized and collected immediately when an order is placed through our secure checkout. Delivery timelines and local pickup windows are estimates provided by individual boutique vendors.</p>

<h2>4. Returns, Cancellations, and Disputes</h2>
<p>Return eligibility and inspection standards follow each boutique vendor's published policy. If a buyer and vendor cannot reach an amicable resolution regarding an order, either party may escalate to an official dispute. The Cut administrative mediation team will conduct a neutral review and issue a binding resolution.</p>

<h2>5. Vendor Obligations and Standards</h2>
<p>Vendors must accurately describe wig specifications (density, lace type, origin, texture), honor stated fulfillment schedules, and comply with all consumer protection standards. The Cut reserves the right to suspend or remove vendors violating platform quality standards.</p>

<h2>6. Acceptable Platform Use</h2>
<p>Users may not engage in fraudulent transactions, abusive chargeback claims, intellectual property infringement, or malicious automated scraping. Accounts exhibiting fraudulent behavior will be immediately restricted.</p>`

export const initialPrivacyHtml = `<h1>Privacy Policy</h1>
<p><em>Last updated: August 1, 2026</em></p>

<h2>1. Information We Collect</h2>
<p>We collect personal information necessary to deliver marketplace services, including your name, verified email address, phone number, physical delivery address, order records, and payment card details (tokenized via our PCI-compliant payment gateway). We also collect app interaction data such as saved wigs, filter preferences, and try-on credits.</p>

<h2>2. How We Use Your Information</h2>
<p>Your data is used to process and fulfill orders, match you with relevant wig textures and atelier collections, prevent fraudulent transactions, administer customer support, and, with your affirmative consent, send restock notifications and promotional updates.</p>

<h2>3. Information Sharing with Vendors</h2>
<p>When you purchase an item or book a try-on, we share required fulfillment details (such as customer name, shipping address, or pickup contact) with the fulfilling vendor. Vendors are contractually prohibited from using this information for unauthorized off-platform marketing.</p>

<h2>4. Payment Security</h2>
<p>All financial payment details are securely processed through end-to-end encrypted gateways. The Cut never stores your full credit card number or CVV on our servers; only a masked identifier (e.g. Visa last 4 digits) is retained for your order receipts.</p>

<h2>5. Your Privacy Rights and Data Choices</h2>
<p>You have the right to access, rectify, or request deletion of your personal data at any time. You may manage push notifications directly in the mobile app settings or request comprehensive data export by contacting our privacy compliance desk.</p>`
