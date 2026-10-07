'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PackageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { DetailRow, Panel } from '@/components/admin/panel'
import { OrderStatusTag } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import { vendorById } from '@/lib/data/vendors'
import { wigById } from '@/lib/data/wigs'
import { currency } from '@/lib/utils'

const backCls = 'text-[12.5px] text-ink-muted hover:text-ink'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { allOrders, adminActionOrder } = useAdmin()
  const confirm = useConfirm()
  const order = allOrders.find(o => o.id === id)

  if (!order) {
    return (
      <EmptyState
        icon={<PackageIcon className="h-5 w-5" />}
        title="Order not found"
        body="This order doesn't exist or has been removed."
        action={<Link href="/admin/orders" className="text-[13px] font-semibold text-ink hover:text-ink-muted">← Back to orders</Link>}
      />
    )
  }

  const wig = wigById(order.wigId)
  const vendor = vendorById(order.vendorId)
  const act = (action: string, message: string) => {
    adminActionOrder(order.id, action)
    toast.success(message)
  }
  const refund = async () => {
    const ok = await confirm({
      title: `Refund ${currency(order.total)}?`,
      body: `${order.customerName} will be refunded to the card ending ${order.paymentLast4}. This can’t be reversed.`,
      confirmLabel: 'Issue refund',
      tone: 'danger',
    })
    if (ok) act('refund', `Refund issued for ${order.id}`)
  }

  return (
    <>
      <Link href="/admin/orders" className={backCls}>← Back to orders</Link>
      <div className="mt-3">
        <PageHeader eyebrow="Order" title={order.id} description={`Placed ${order.placedAt} · ${order.eta}`} actions={<OrderStatusTag status={order.status} />} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Panel title="Item">
          <div className="flex items-center gap-4">
            {wig && <img src={wig.images[0]} alt="" className="h-20 w-16 shrink-0 rounded-xl object-cover" />}
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{wig?.name}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">{wig?.brand} · {vendor?.name}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-line pt-3">
            <DetailRow label="Quantity">{order.quantity}</DetailRow>
            <DetailRow label="Total">{currency(order.total)}</DetailRow>
            <DetailRow label="Payment">•••• {order.paymentLast4}</DetailRow>
          </div>
        </Panel>

        <Panel title="Customer & fulfilment">
          <DetailRow label="Customer">{order.customerName}</DetailRow>
          <DetailRow label="Vendor">{vendor ? <Link href={`/admin/vendors/${vendor.id}`} className="hover:text-ink-muted">{vendor.name}</Link> : '—'}</DetailRow>
          <DetailRow label="Method">{order.shippingMethod}</DetailRow>
          {order.fulfillment === 'delivery'
            ? <DetailRow label="Address">{order.address}</DetailRow>
            : <DetailRow label="Pickup">{order.pickupDate} · {order.pickupTime}</DetailRow>}
          <DetailRow label="Status">{order.eta}</DetailRow>
          <DetailRow label="Reviewed">{order.reviewed ? 'Yes' : 'No'}</DetailRow>
        </Panel>
      </div>

      {order.returnRequested && (
        <Panel title="Return request" className="mt-6" action={<Tag tone={order.returnStatus === 'approved' || order.returnStatus === 'refunded' ? 'success' : 'warn'}>{order.returnStatus}</Tag>}>
          <DetailRow label="Reason">{order.returnReason}</DetailRow>
        </Panel>
      )}

      <Panel title="Admin actions" className="mt-6">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => act('contact_customer', `Message sent to ${order.customerName}`)}>Contact customer</Button>
          <Button variant="outline" onClick={() => act('contact_vendor', `Message sent to ${vendor?.name ?? 'vendor'}`)}>Contact vendor</Button>
          <Button variant="danger" disabled={order.status === 'cancelled'} onClick={refund}>Issue refund</Button>
        </div>
      </Panel>
    </>
  )
}
