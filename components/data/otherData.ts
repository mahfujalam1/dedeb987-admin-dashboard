import { ReturnRequest, Conversation, DayPickupSchedule } from '../types';

export const initialReturns: ReturnRequest[] = [
  {
    id: 'ret-1',
    orderId: 'TC-48180',
    customer: 'Jade Mensah',
    wig: 'Aurelia Body Wave',
    amount: 492.4,
    reason: 'Changed my mind',
    status: 'requested',
    date: 'Aug 13, 2026',
  },
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    customerName: 'Amara Ellis',
    productRe: 'Aurelia Body Wave',
    preview: 'We have 11 AM, 1 PM and 3 PM available th...',
    timestamp: '10 min ago',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Hi! Just checking if the Aurelia is still available in 24"?',
        time: '9:14 AM',
      },
      {
        id: 'm2',
        sender: 'vendor',
        text: 'Yes! We have 12 in stock. Would you like to book a try-on appointment?',
        time: '9:22 AM',
      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'That would be amazing. What times do you have on Saturday?',
        time: '9:25 AM',
      },
      {
        id: 'm4',
        sender: 'vendor',
        text: 'We have 11 AM, 1 PM and 3 PM available this Saturday. Which works for you?',
        time: '10:02 AM',
      },
      {
        id: 'm5',
        sender: 'vendor',
        text: 'Here is our Atelier Lookbook and fitting guide for reference.',
        time: '10:05 AM',
        attachment: {
          name: 'Maison_Noir_Fitting_Guide.pdf',
          type: 'pdf',
          size: '1.4 MB',
        },
      },
      {
        id: 'm6',
        sender: 'vendor',
        text: 'Here is a photo of the 24" Aurelia in natural lighting for you.',
        time: '10:08 AM',
        attachment: {
          name: 'aurelia-body-wave-24in.jpg',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
          size: '620 KB',
        },
      },
    ],
  },
  {
    id: 'conv-2',
    customerName: 'Jade Mensah',
    vendorName: 'Maison Noir Hair Atelier',
    orderId: 'TC-48180',
    orderRe: 'Order TC-48180 return request',
    preview: "We're really sorry to hear that. We'll review...",
    timestamp: '2 hrs ago',
    unreadCount: 1,
    messages: [
      {
        id: 'm21',
        sender: 'customer',
        text: 'Hello, I submitted a return request for the Aurelia unit.',
        time: '7:40 AM',
      },
      {
        id: 'm22',
        sender: 'vendor',
        text: "We're really sorry to hear that. We'll review your request within 24 hours.",
        time: '8:00 AM',
      },
      {
        id: 'm23',
        sender: 'customer',
        text: 'You rejected my return request stating it was final sale, but your policy allows 7-day returns on unworn items with tags intact. I have escalated this dispute to admin.',
        time: '8:45 AM',
      },
      {
        id: 'm24',
        sender: 'vendor',
        text: 'Understood. We are submitting photos of the security tag to the admin review team.',
        time: '9:10 AM',
      },
    ],
  },
  {
    id: 'conv-3',
    customerName: 'Amara Ellis',
    vendorName: 'Velvet Row',
    orderId: 'TC-47512',
    orderRe: 'Order TC-47512 dispute',
    productRe: 'Margaux Wine Silk',
    preview: 'The colour sent is dark auburn, not the vibrant wine shown...',
    timestamp: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm31',
        sender: 'customer',
        text: 'Hi Velvet Row, I received order TC-47512 today, but the wig color is completely different from the website photos.',
        time: 'Yesterday · 2:15 PM',
      },
      {
        id: 'm32',
        sender: 'vendor',
        text: 'Hello Amara, our Margaux Wine Silk is photographed in studio lighting. Natural lighting may show darker undertones.',
        time: 'Yesterday · 2:30 PM',
      },
      {
        id: 'm33',
        sender: 'customer',
        text: 'This is not just studio lighting — the item tag even says Deep Auburn #33 instead of Wine. I need a full refund or an immediate replacement.',
        time: 'Yesterday · 3:00 PM',
      },
      {
        id: 'm34',
        sender: 'vendor',
        text: 'Please allow our warehouse team to verify the batch SKU. We will update you shortly.',
        time: 'Yesterday · 3:45 PM',
      },
    ],
  },
  {
    id: 'conv-4',
    customerName: 'Renée Baptiste',
    vendorName: 'Root & Reign',
    orderId: 'TC-47903',
    orderRe: 'Order TC-47903 dispute',
    preview: 'Package was crushed upon arrival and lace was torn...',
    timestamp: '3 days ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm41',
        sender: 'customer',
        text: 'Hello, order TC-47903 arrived today with the courier box completely crushed, and the HD lace has a 2-inch tear along the hairline.',
        time: 'Jul 29 · 11:20 AM',
      },
      {
        id: 'm42',
        sender: 'vendor',
        text: 'We are very sorry to hear this, Renée. Courier damage is covered under our shipping insurance.',
        time: 'Jul 29 · 11:45 AM',
      },
      {
        id: 'm43',
        sender: 'customer',
        text: 'Thank you. I have opened a dispute so admin can release the refund or issue an insurance replacement claim.',
        time: 'Jul 29 · 12:00 PM',
      },
      {
        id: 'm44',
        sender: 'vendor',
        text: 'Refund has been approved on our end for administrative processing.',
        time: 'Jul 29 · 1:30 PM',
      },
    ],
  },
  {
    id: 'conv-5',
    customerName: 'Dara Okonkwo',
    vendorName: 'Atelier Blanc',
    orderId: 'TC-48210',
    orderRe: 'Order TC-48210 inquiry',
    productRe: 'Sable Kinky Straight',
    preview: 'Hi! Can I request local pickup this Monday at 10 AM?',
    timestamp: '5 hrs ago',
    unreadCount: 0,
    messages: [
      {
        id: 'm51',
        sender: 'customer',
        text: 'Hi! I placed order TC-48210 for the Sable Kinky Straight unit. Can I request local pickup this Monday at 10 AM?',
        time: '8:15 AM',
      },
      {
        id: 'm52',
        sender: 'vendor',
        text: 'Hello Dara! Yes, your order is scheduled and will be ready for pickup Monday at 10:00 AM.',
        time: '8:45 AM',
      },
    ],
  },
];

export const initialSchedule: DayPickupSchedule[] = [
  {
    id: 'day-1',
    dateLabel: 'Mon, Aug 17',
    isBlocked: false,
    slots: [
      { id: 's1', time: '10:00 AM', booked: 2, capacity: 4 },
      { id: 's2', time: '11:00 AM', booked: 4, capacity: 4 },
      { id: 's3', time: '12:00 PM', booked: 1, capacity: 4 },
      { id: 's4', time: '2:00 PM', booked: 0, capacity: 4 },
      { id: 's5', time: '4:00 PM', booked: 3, capacity: 4 },
    ],
  },
  {
    id: 'day-2',
    dateLabel: 'Tue, Aug 18',
    isBlocked: false,
    slots: [
      { id: 's6', time: '10:00 AM', booked: 0, capacity: 4 },
      { id: 's7', time: '11:00 AM', booked: 1, capacity: 4 },
      { id: 's8', time: '2:00 PM', booked: 2, capacity: 4 },
    ],
  },
];
