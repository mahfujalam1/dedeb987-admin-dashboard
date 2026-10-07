import type { AppNotification, Order } from '@/lib/types'
const CDN = 'https://cdn.magicpatterns.com/patterns/generated-images'

export interface AdminVendor { id: string; name: string; logo: string; status: 'active' | 'suspended' | 'pending'; verification: 'approved' | 'pending' | 'rejected' | 'unsubmitted'; gmv: number; activeProducts: number; openOrders: number; joinedAt: string; plan: string }
export interface AdminUser { id: string; name: string; avatar: string; email: string; status: 'active' | 'suspended' | 'flagged'; joinedAt: string; orders: number; spent: number }
export interface Dispute { id: string; orderId: string; customerName: string; vendorName: string; amount: number; reason: string; status: string; slaHoursLeft: number; openedAt: string }
export interface RiskSignal { id: string; type: string; description: string; userId?: string; vendorId?: string; severity: 'low' | 'medium' | 'high'; status: 'open' | 'reviewing' | 'resolved'; flaggedAt: string }
export interface Campaign { id: string; title: string; segment: string; message: string; status: 'draft' | 'scheduled' | 'sent'; scheduledAt?: string; sentAt?: string; recipients?: number }
export interface Collection { id: string; title: string; eyebrow: string; description: string; wigIds: string[]; status: 'draft' | 'live' | 'archived'; position: number; slot?: 'hero'; startsOn?: string; endsOn?: string; createdAt: string; updatedAt: string }

export const adminVendors: AdminVendor[] = [
  { id: 'v-01', name: 'Maison Noir Hair Atelier', logo: `${CDN}/f64c0229-8696-41f2-b69b-92af86fcf59e.jpg`, status: 'active', verification: 'approved', gmv: 148400, activeProducts: 4, openOrders: 5, joinedAt: 'Jan 2025', plan: 'Pro' },
  { id: 'v-02', name: 'Velvet Row', logo: `${CDN}/f64c0229-8696-41f2-b69b-92af86fcf59e.jpg`, status: 'active', verification: 'approved', gmv: 86200, activeProducts: 3, openOrders: 2, joinedAt: 'Feb 2025', plan: 'Starter' },
  { id: 'v-03', name: 'Root & Reign', logo: `${CDN}/f64c0229-8696-41f2-b69b-92af86fcf59e.jpg`, status: 'active', verification: 'approved', gmv: 214600, activeProducts: 2, openOrders: 8, joinedAt: 'Dec 2024', plan: 'Pro' },
  { id: 'v-04', name: 'Atelier Blanc', logo: `${CDN}/f64c0229-8696-41f2-b69b-92af86fcf59e.jpg`, status: 'pending', verification: 'pending', gmv: 0, activeProducts: 0, openOrders: 0, joinedAt: 'Aug 2026', plan: 'None' },
]

export const adminUsers: AdminUser[] = [
  { id: 'u-01', name: 'Amara Ellis', avatar: `${CDN}/a68676e8-9a0a-417f-9db5-cd9afcda6919.jpg`, email: 'amara@thecut.app', status: 'active', joinedAt: 'Mar 2025', orders: 5, spent: 2052 },
  { id: 'u-02', name: 'Jade Mensah', avatar: `${CDN}/66438aba-aaee-45fb-bad0-8652acb7b1ea.jpg`, email: 'jade.m@gmail.com', status: 'active', joinedAt: 'Apr 2025', orders: 3, spent: 1240 },
  { id: 'u-03', name: 'Renée Baptiste', avatar: `${CDN}/7f62f2da-c446-4648-88cd-d5c849d44d51.jpg`, email: 'renee@Baptiste.co', status: 'flagged', joinedAt: 'May 2025', orders: 8, spent: 3490 },
  { id: 'u-04', name: 'Dara Okonkwo', avatar: `${CDN}/30a7d304-4dfb-4e78-be34-a51b283ccdd0.jpg`, email: 'dara.o@proton.me', status: 'active', joinedAt: 'Jun 2025', orders: 2, spent: 810 },
]

export const disputes: Dispute[] = [
  { id: 'd-01', orderId: 'TC-47512', customerName: 'Amara Ellis', vendorName: 'Velvet Row', amount: 389.75, reason: 'Item not as described — colour mismatch', status: 'open', slaHoursLeft: 6, openedAt: 'Aug 14, 2026' },
  { id: 'd-02', orderId: 'TC-48180', customerName: 'Jade Mensah', vendorName: 'Maison Noir', amount: 492.4, reason: 'Return request rejected unfairly', status: 'reviewing', slaHoursLeft: 22, openedAt: 'Aug 15, 2026' },
  { id: 'd-03', orderId: 'TC-47903', customerName: 'Renée Baptiste', vendorName: 'Root & Reign', amount: 285, reason: 'Item arrived damaged', status: 'resolved_refunded', slaHoursLeft: 48, openedAt: 'Jul 29, 2026' },
]

export const riskSignals: RiskSignal[] = [
  { id: 'rs-01', type: 'Chargeback pattern', description: 'Renée Baptiste has filed 3 chargebacks in 90 days.', userId: 'u-03', severity: 'high', status: 'open', flaggedAt: 'Aug 15, 2026' },
  { id: 'rs-02', type: 'Velocity — rapid orders', description: '4 orders placed in 2 hours from the same IP address.', severity: 'medium', status: 'reviewing', flaggedAt: 'Aug 14, 2026' },
  { id: 'rs-03', type: 'New vendor — suspicious listing', description: 'Atelier Blanc listed 0 products within 6 hrs of signup.', vendorId: 'v-04', severity: 'low', status: 'resolved', flaggedAt: 'Aug 10, 2026' },
]

export const campaigns: Campaign[] = [
  { id: 'cp-01', title: 'Back-to-school sale', segment: 'All users', message: 'Your match is waiting — 15% off this weekend only.', status: 'scheduled', scheduledAt: 'Aug 22, 2026 · 10:00 AM' },
  { id: 'cp-02', title: 'Restock alert — Margaux', segment: 'Wishlist users', message: 'Margaux Wine Silk is back in stock. Limited units.', status: 'sent', sentAt: 'Aug 8, 2026', recipients: 412 },
  { id: 'cp-03', title: 'Wig Date credit drop', segment: 'No try-ons in 30 days', message: "You've got a free Wig Date credit. Try before you buy.", status: 'draft' },
]

export const collections: Collection[] = [
  { id: 'col-01', title: 'Runway Ready', eyebrow: 'Curated by The Cut', description: 'Editorial picks for those who dress to be seen.', wigIds: ['w-04', 'w-08', 'w-07'], status: 'live', position: 1, slot: 'hero', startsOn: 'Sep 1, 2026', endsOn: 'Oct 31, 2026', createdAt: 'Aug 10, 2026', updatedAt: 'Aug 14, 2026' },
  { id: 'col-02', title: 'Beginner Favourites', eyebrow: 'Start here', description: 'Glueless, fuss-free, perfect for first-time wearers.', wigIds: ['w-05', 'w-01', 'w-02'], status: 'live', position: 2, startsOn: 'Aug 5, 2026', createdAt: 'Aug 5, 2026', updatedAt: 'Aug 5, 2026' },
  { id: 'col-03', title: 'Summer Colours', eyebrow: 'Seasonal edit', description: 'Sun-warmed tones for the season.', wigIds: ['w-03', 'w-07', 'w-06'], status: 'draft', position: 3, startsOn: 'Sep 15, 2026', endsOn: 'Oct 31, 2026', createdAt: 'Aug 12, 2026', updatedAt: 'Aug 12, 2026' },
]

export const platformOrders: Order[] = [
  { id: 'TC-48210', wigId: 'w-09', vendorId: 'v-01', quantity: 1, total: 560, fulfillment: 'pickup', shippingMethod: 'Local pickup', status: 'placed', placedAt: 'Aug 16, 2026', eta: 'Pickup Aug 17 · 10:00 AM', pickupDate: 'Mon, Aug 17', pickupTime: '10:00 AM', paymentLast4: '9021', customerName: 'Dara Okonkwo', reviewed: false },
  { id: 'TC-48205', wigId: 'w-02', vendorId: 'v-01', quantity: 2, total: 536, fulfillment: 'delivery', shippingMethod: 'Express · 2 days', status: 'placed', placedAt: 'Aug 16, 2026', eta: 'Ship by Aug 17', address: '221 Gates Ave, Brooklyn, NY 11216', paymentLast4: '3310', customerName: 'Renée Baptiste', reviewed: false },
  { id: 'TC-48192', wigId: 'w-01', vendorId: 'v-01', quantity: 1, total: 492.4, fulfillment: 'delivery', shippingMethod: 'Express · 2 days', status: 'shipped', placedAt: 'Aug 14, 2026', eta: 'In transit', address: '54 Ashland Pl, Apt 12B, Brooklyn, NY 11201', paymentLast4: '4242', customerName: 'Amara Ellis', reviewed: false },
  { id: 'TC-48180', wigId: 'w-01', vendorId: 'v-01', quantity: 1, total: 492.4, fulfillment: 'delivery', shippingMethod: 'Standard · 5 days', status: 'preparing', placedAt: 'Aug 13, 2026', eta: 'Ship by Aug 20', address: '88 Nostrand Ave, Brooklyn, NY 11216', paymentLast4: '7711', customerName: 'Jade Mensah', reviewed: false, returnRequested: true, returnStatus: 'requested', returnReason: 'Changed my mind' },
  { id: 'TC-47903', wigId: 'w-02', vendorId: 'v-01', quantity: 1, total: 274.6, fulfillment: 'delivery', shippingMethod: 'Standard · 5 days', status: 'delivered', placedAt: 'Jul 28, 2026', eta: 'Delivered Aug 2', address: '54 Ashland Pl, Apt 12B, Brooklyn, NY 11201', paymentLast4: '4242', customerName: 'Amara Ellis', reviewed: true },
  { id: 'TC-48188', wigId: 'w-04', vendorId: 'v-02', quantity: 1, total: 645, fulfillment: 'delivery', shippingMethod: 'Express · 2 days', status: 'confirmed', placedAt: 'Aug 14, 2026', eta: 'Aug 18', address: '412 Lewis Ave, Brooklyn, NY 11233', paymentLast4: '5522', customerName: 'Jade Mensah', reviewed: false },
  { id: 'TC-48141', wigId: 'w-07', vendorId: 'v-02', quantity: 1, total: 389.75, fulfillment: 'pickup', shippingMethod: 'Local pickup', status: 'ready', placedAt: 'Aug 12, 2026', eta: 'Ready for pickup', pickupDate: 'Mon, Aug 17', pickupTime: '1:00 PM', paymentLast4: '8830', customerName: 'Dara Okonkwo', reviewed: false },
  { id: 'TC-47820', wigId: 'w-10', vendorId: 'v-02', quantity: 1, total: 312, fulfillment: 'delivery', shippingMethod: 'Standard · 5 days', status: 'delivered', placedAt: 'Jul 19, 2026', eta: 'Delivered Jul 25', address: '88 Nostrand Ave, Brooklyn, NY 11216', paymentLast4: '1199', customerName: 'Renée Baptiste', reviewed: true },
  { id: 'TC-47512', wigId: 'w-10', vendorId: 'v-02', quantity: 1, total: 389.75, fulfillment: 'delivery', shippingMethod: 'Standard · 5 days', status: 'cancelled', placedAt: 'Jun 21, 2026', eta: 'Refunded Jun 24', address: '54 Ashland Pl, Apt 12B, Brooklyn, NY 11201', paymentLast4: '4242', customerName: 'Amara Ellis', reviewed: false, returnRequested: true, returnStatus: 'approved', returnReason: 'Colour did not match listing photos' },
  { id: 'TC-48219', wigId: 'w-05', vendorId: 'v-03', quantity: 1, total: 285, fulfillment: 'pickup', shippingMethod: 'Local pickup', status: 'placed', placedAt: 'Aug 16, 2026', eta: 'Pickup Aug 18 · 11:00 AM', pickupDate: 'Tue, Aug 18', pickupTime: '11:00 AM', paymentLast4: '6644', customerName: 'Amara Ellis', reviewed: false },
  { id: 'TC-48167', wigId: 'w-06', vendorId: 'v-03', quantity: 1, total: 478, fulfillment: 'delivery', shippingMethod: 'Express · 2 days', status: 'out_for_delivery', placedAt: 'Aug 13, 2026', eta: 'Arriving today', address: '77 Halsey St, Brooklyn, NY 11216', paymentLast4: '2277', customerName: 'Jade Mensah', reviewed: false },
  { id: 'TC-48090', wigId: 'w-03', vendorId: 'v-03', quantity: 1, total: 356, fulfillment: 'delivery', shippingMethod: 'Standard · 5 days', status: 'delivered', placedAt: 'Aug 4, 2026', eta: 'Delivered Aug 9', address: '221 Gates Ave, Brooklyn, NY 11216', paymentLast4: '3310', customerName: 'Renée Baptiste', reviewed: false },
  { id: 'TC-47740', wigId: 'w-09', vendorId: 'v-03', quantity: 1, total: 560, fulfillment: 'pickup', shippingMethod: 'Local pickup', status: 'picked_up', placedAt: 'Jul 9, 2026', eta: 'Picked up Jul 11', pickupDate: 'Sat, Jul 11', pickupTime: '2:00 PM', paymentLast4: '1881', customerName: 'Dara Okonkwo', reviewed: true },
  { id: 'TC-47611', wigId: 'w-08', vendorId: 'v-03', quantity: 2, total: 890, fulfillment: 'delivery', shippingMethod: 'Standard · 5 days', status: 'delivered', placedAt: 'Jun 29, 2026', eta: 'Delivered Jul 5', address: '55 Park Pl, Brooklyn, NY 11201', paymentLast4: '9900', customerName: 'Jade Mensah', reviewed: true },
]

export const adminNotifications: AppNotification[] = [
  { id: 'an-01', kind: 'dispute', title: 'SLA breach imminent', body: 'Dispute d-01 has 6 hours left on its SLA.', at: '1 hr ago', read: false, href: '/admin/disputes' },
  { id: 'an-02', kind: 'vendor', title: 'New vendor application', body: 'Atelier Blanc has submitted their verification documents.', at: '3 hrs ago', read: false, href: '/admin/vendors/v-04' },
  { id: 'an-03', kind: 'system', title: 'Weekly GMV report', body: 'Platform GMV this week: $42,800 (+18% vs. last week).', at: 'Yesterday', read: true },
]
