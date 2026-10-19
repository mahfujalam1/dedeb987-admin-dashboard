'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertTriangleIcon, PackageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { DetailRow, Panel } from '@/components/admin/panel'
import { RefundModal, type RefundData } from '@/components/admin/refund-modal'
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
  const { allOrders, adminActionOrder, users } = useAdmin()
  const confirm = useConfirm()
  const [refundModalOpen, setRefundModalOpen] = useState(false)
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
  const customerUser = users.find(
    u => u.name.toLowerCase() === order.customerName.toLowerCase() ||
         (order.customerEmail && u.email.toLowerCase() === order.customerEmail.toLowerCase())
  )
  const act = (action: string, message: string, payload?: any) => {
    adminActionOrder(order.id, action, payload)
    toast.success(message)
  }

  const forceCancel = async () => {
    const ok = await confirm({
      title: `Force cancel order ${order.id}?`,
      body: `This will immediately cancel order ${order.id} for ${order.customerName}. This action cannot be reversed.`,
      confirmLabel: 'Force cancel',
      tone: 'danger',
    })
    if (ok) act('force_cancel', `Order ${order.id} was force cancelled`)
  }

  const flagForReview = async () => {
    if (order.flaggedForReview) {
      toast.info(`Order ${order.id} is already flagged for review`)
      return
    }
    const ok = await confirm({
      title: `Flag order ${order.id} for review?`,
      body: `This will flag this order for administrative, compliance, and fraud review.`,
      confirmLabel: 'Flag for review',
      tone: 'primary',
    })
    if (ok) act('flag_for_review', `Order ${order.id} flagged for review`)
  }

  const handleRefundConfirm = (data: RefundData) => {
    act(
      'refund',
      `${data.type === 'full' ? 'Full refund' : 'Partial refund'} of ${currency(data.amount)} issued for ${order.id}`,
      data,
    )
    setRefundModalOpen(false)
  }

  return (
    <>
      <Link href="/admin/orders" className={backCls}>← Back to orders</Link>
      <div className="mt-3">
        <PageHeader eyebrow="Order" title={order.id} description={`Placed ${order.placedAt} · ${order.eta}`} actions={<OrderStatusTag status={order.status} />} />
      </div>

      {order.flaggedForReview && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-warn-500/30 bg-warn-50 px-4 py-3 text-[13px] text-warn-600 animate-fade">
          <div className="flex items-center gap-2.5">
            <AlertTriangleIcon className="h-4 w-4 shrink-0 text-warn-600" />
            <span><strong>Flagged for review:</strong> This order is under administrative audit review.</span>
          </div>
          <Tag tone="warn">Under review</Tag>
        </div>
      )}

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
            <DetailRow label="Total">
              <div className="flex flex-wrap items-center gap-2">
                <span className={order.refundedAmount && order.status === 'cancelled' ? 'line-through text-ink-muted' : ''}>
                  {currency(order.total)}
                </span>
                {order.refundedAmount && (
                  <Tag tone="danger">
                    {order.refundType === 'partial' ? `Partial refund: ${currency(order.refundedAmount)}` : `Refunded ${currency(order.refundedAmount)}`}
                  </Tag>
                )}
              </div>
            </DetailRow>
            {order.refundReason && (
              <DetailRow label="Refund reason">{order.refundReason}</DetailRow>
            )}
            <DetailRow label="Payment">Visa XXXX {order.paymentLast4}</DetailRow>
          </div>
        </Panel>

        <Panel title="Customer & fulfilment">
          <DetailRow label="Customer">
            {customerUser ? (
              <Link href={`/admin/users/${customerUser.id}`} className="font-semibold text-accent-600 hover:underline inline-flex items-center gap-1.5">
                <span>{order.customerName}</span>
                <span className="text-[11.5px] font-normal text-ink-muted">(View profile →)</span>
              </Link>
            ) : (
              <span>{order.customerName}</span>
            )}
          </DetailRow>
          {order.customerEmail && <DetailRow label="Email">{order.customerEmail}</DetailRow>}
          {order.customerPhone && <DetailRow label="Phone">{order.customerPhone}</DetailRow>}
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
          <Button
            variant="danger"
            disabled={order.status === 'cancelled'}
            onClick={forceCancel}
          >
            Force cancel
          </Button>
          <Button
            variant="outline"
            disabled={order.status === 'cancelled' && order.returnStatus === 'refunded' && (order.refundedAmount ?? 0) >= order.total}
            onClick={() => setRefundModalOpen(true)}
          >
            Issue refund
          </Button>
          <Button
            variant="outline"
            onClick={flagForReview}
            disabled={order.flaggedForReview}
          >
            {order.flaggedForReview ? 'Flagged for review' : 'Flag for review'}
          </Button>
          <Link href={`/admin/messages?userId=${customerUser?.id || order.customerName}&orderId=${order.id}`} className="shrink-0">
            <Button variant="outline">Contact customer</Button>
          </Link>
          <Link href={`/admin/messages?vendorId=${vendor?.id}&orderId=${order.id}`} className="shrink-0">
            <Button variant="outline">Contact vendor</Button>
          </Link>
        </div>
      </Panel>

      <RefundModal
        order={order}
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        onConfirm={handleRefundConfirm}
      />
    </>
  )
}
