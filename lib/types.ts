export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'out_for_delivery' | 'delivered' | 'picked_up' | 'cancelled'
export type ReturnStatus = 'requested' | 'approved' | 'declined' | 'received' | 'refunded'
export interface Order {
  id: string; wigId: string; vendorId: string; quantity: number; total: number
  fulfillment: 'delivery' | 'pickup'; shippingMethod: string; status: OrderStatus
  placedAt: string; eta: string; address?: string; pickupDate?: string; pickupTime?: string
  paymentLast4: string; customerName: string; reviewed: boolean
  returnRequested?: boolean; returnStatus?: ReturnStatus; returnReason?: string
}
export interface AppNotification { id: string; kind: string; title: string; body: string; at: string; read: boolean; href?: string }
export interface AdminAccount { id: string; name: string; email: string; role: string; avatar: string }
export interface Wig { id: string; name: string; brand: string; vendorId: string; price: number; salePrice?: number; images: string[] }
