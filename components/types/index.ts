export type OrderStatus =
  | 'Order placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customer: string;
  productName: string;
  productVariant?: string;
  productImage: string;
  fulfillmentType: 'Pickup' | 'Delivery';
  fulfillmentDetail: string;
  total: number;
  placedTime: string;
  status: OrderStatus;
  items: OrderItem[];
  customerDetails: {
    name: string;
    method: string;
    eta?: string;
    pickupSlot?: string;
    address?: string;
  };
  cancelReason?: string;
}

export interface ProductSpecs {
  texture: string;
  length: number;
  density: string;
  color: string;
  laceType: string;
  hairType: string;
  beginnerFriendly: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  specs: ProductSpecs;
  price: number;
  salePrice?: number;
  stock: number;
  rating: number;
  ratingCount: number;
  views: number;
  orders: number;
  image: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  wig: string;
  amount: number;
  reason: string;
  status: 'requested' | 'approved' | 'declined';
  date: string;
}

export interface ChatAttachment {
  name: string;
  type: 'image' | 'pdf' | 'file';
  url?: string;
  size?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'vendor';
  text: string;
  time: string;
  attachment?: ChatAttachment;
}

export interface Conversation {
  id: string;
  customerName: string;
  vendorName?: string;
  vendorId?: string;
  userId?: string;
  orderId?: string;
  productRe?: string;
  orderRe?: string;
  preview: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface TimeSlot {
  id: string;
  time: string;
  booked: number;
  capacity: number;
}

export interface DayPickupSchedule {
  id: string;
  dateLabel: string;
  isBlocked: boolean;
  slots: TimeSlot[];
}

export interface Review {
  id: string;
  customer: string;
  date: string;
  rating: number;
  matchTag: string;
  product: string;
  vendorRating: number;
  comment: string;
  vendorResponse?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  initial: string;
  tag?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface PayoutRecord {
  id: string;
  period: string;
  amount: number;
  datePaid: string;
  method: string;
  status: 'Paid' | 'Processing';
}
