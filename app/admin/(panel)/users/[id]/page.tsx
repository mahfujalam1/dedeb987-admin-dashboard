'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  CreditCardIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  ShoppingBagIcon,
  UserCheckIcon,
  UserXIcon,
  UsersIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { DetailRow, Panel } from '@/components/admin/panel'
import { OrderStatusTag } from '@/components/admin/status-tag'
import { userStatusTone } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import { wigById } from '@/lib/data/wigs'
import { currency } from '@/lib/utils'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { users, allOrders, banUser, unbanUser, riskSignals } = useAdmin()
  const confirm = useConfirm()
  const [activeTab, setActiveTab] = useState<'purchases' | 'activity'>('purchases')

  const user = users.find(u => u.id === id)

  if (!user) {
    return (
      <EmptyState
        icon={<UsersIcon className="h-5 w-5" />}
        title="User not found"
        body="This user account doesn't exist or has been removed."
        action={<Link href="/admin/users" className="text-[13px] font-semibold text-ink hover:text-ink-muted">← Back to users</Link>}
      />
    )
  }

  // Purchases for this client
  const userOrders = allOrders.filter(
    o =>
      o.customerEmail?.toLowerCase() === user.email.toLowerCase() ||
      o.customerName?.toLowerCase() === user.name.toLowerCase()
  )

  // Risk signals for this client if any
  const userRisk = riskSignals.filter(r => r.userId === user.id)

  // Extract contact info from their orders
  const phone = userOrders.find(o => o.customerPhone)?.customerPhone || '+1 (555) 456-7890'
  const latestAddress = userOrders.find(o => o.address)?.address || 'No physical delivery address on file'
  const latestCard = userOrders.find(o => o.paymentLast4)?.paymentLast4 || '4242'

  async function handleSuspend() {
    if (!user) return
    const ok = await confirm({
      title: `Suspend ${user.name}?`,
      body: 'They will be prevented from signing into the customer app and placing new orders.',
      confirmLabel: 'Suspend user',
      tone: 'danger',
    })
    if (!ok) return
    banUser(user.id)
    toast.success(`${user.name} has been suspended`)
  }

  async function handleReinstate() {
    if (!user) return
    unbanUser(user.id)
    toast.success(`${user.name} has been reinstated`)
  }

  return (
    <>
      <Link href="/admin/users" className="text-[12.5px] text-ink-muted hover:text-ink">← Back to users</Link>

      <div className="mt-3">
        <PageHeader
          eyebrow="Customer Profile"
          title={user.name}
          description={`Customer ID: ${user.id} · Member since ${user.joinedAt}`}
          actions={
            <div className="flex items-center gap-2.5">
              <Tag tone={userStatusTone[user.status]}>{user.status}</Tag>
              {user.status === 'suspended' ? (
                <Button size="sm" variant="outline" icon={<UserCheckIcon className="h-4 w-4" />} onClick={handleReinstate}>
                  Reinstate
                </Button>
              ) : (
                <Button size="sm" variant="danger" icon={<UserXIcon className="h-4 w-4" />} onClick={handleSuspend}>
                  Suspend
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Flagged user warning */}
      {user.status === 'flagged' && (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-warn-500/30 bg-warn-50 px-4 py-3 text-[13px] text-warn-600">
          <div className="flex items-center gap-2.5">
            <AlertTriangleIcon className="h-4 w-4 shrink-0 text-warn-600" />
            <span><strong>Risk Flag:</strong> {userRisk[0]?.description || 'This account has triggered automated security flags.'}</span>
          </div>
          <Tag tone="warn">Flagged for review</Tag>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
          <p className="text-[11.5px] font-medium uppercase tracking-wider text-ink-faint">Lifetime Spent</p>
          <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink">{currency(user.spent)}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Gross platform spend</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
          <p className="text-[11.5px] font-medium uppercase tracking-wider text-ink-faint">Total Orders</p>
          <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink">{userOrders.length || user.orders}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Purchases placed</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
          <p className="text-[11.5px] font-medium uppercase tracking-wider text-ink-faint">Avg Order Value</p>
          <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink">
            {currency(user.spent / Math.max(1, user.orders))}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Per transaction</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-2xs">
          <p className="text-[11.5px] font-medium uppercase tracking-wider text-ink-faint">Account Status</p>
          <p className="mt-1 capitalize text-[22px] font-semibold tracking-tight text-ink">{user.status}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">Customer standing</p>
        </div>
      </div>

      {/* Profile Details & Contact */}
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <Panel title="Customer overview">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="h-16 w-16 shrink-0 rounded-full object-cover shadow-inset" />
            <div className="min-w-0">
              <p className="text-[16px] font-semibold text-ink">{user.name}</p>
              <p className="mt-0.5 text-[13px] text-ink-muted">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-line pt-3 space-y-0.5">
            <DetailRow label="Customer ID">{user.id}</DetailRow>
            <DetailRow label="Registered">{user.joinedAt}</DetailRow>
            <DetailRow label="Role">Shopper / Client</DetailRow>
            <DetailRow label="Email status">Verified</DetailRow>
          </div>
        </Panel>

        <Panel title="Contact & Delivery info">
          <div className="space-y-0.5">
            <DetailRow label="Email">
              <span className="flex items-center gap-1.5 text-ink">
                <MailIcon className="h-3.5 w-3.5 text-ink-muted" />
                {user.email}
              </span>
            </DetailRow>
            <DetailRow label="Phone number">
              <span className="flex items-center gap-1.5 text-ink">
                <PhoneIcon className="h-3.5 w-3.5 text-ink-muted" />
                {phone}
              </span>
            </DetailRow>
            <DetailRow label="Saved address">
              <span className="flex items-start gap-1.5 text-ink">
                <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
                <span>{latestAddress}</span>
              </span>
            </DetailRow>
            <DetailRow label="Payment method">
              <span className="flex items-center gap-1.5 text-ink">
                <CreditCardIcon className="h-3.5 w-3.5 text-ink-muted" />
                Visa ending in {latestCard}
              </span>
            </DetailRow>
          </div>
        </Panel>
      </div>

      {/* PURCHASES SECTION */}
      <div id="purchases" className="mt-8">
        <Panel
          title={`Purchases from Client (${userOrders.length})`}
          action={
            <span className="text-[12.5px] text-ink-muted">
              Click any purchase to inspect full order and tracking
            </span>
          }
        >
          {userOrders.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingBagIcon className="mx-auto h-10 w-10 text-ink-faint" />
              <p className="mt-2 text-[14px] font-medium text-ink">No purchases found</p>
              <p className="mt-1 text-[12.5px] text-ink-muted">This client has not placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {userOrders.map(order => {
                const wig = wigById(order.wigId)
                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 transition-all duration-150 hover:border-ink hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Item Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      {wig ? (
                        <img
                          src={wig.images[0]}
                          alt={wig.name}
                          className="h-14 w-12 shrink-0 rounded-xl object-cover shadow-2xs"
                        />
                      ) : (
                        <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-xl bg-ivory text-ink-faint">
                          <PackageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[13px] font-semibold text-ink group-hover:text-accent-600">
                            {order.id}
                          </span>
                          <OrderStatusTag status={order.status} />
                          {order.returnRequested && (
                            <Tag tone="warn">Return {order.returnStatus}</Tag>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[14px] font-medium text-ink">
                          {wig?.name || 'Custom Wig Unit'}
                        </p>
                        <p className="text-[12px] text-ink-muted">
                          {wig?.brand} · Qty: {order.quantity} · Placed {order.placedAt}
                        </p>
                      </div>
                    </div>

                    {/* Order Metrics & Link */}
                    <div className="flex items-center justify-between gap-6 border-t border-line/60 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-[15px] font-semibold text-ink">{currency(order.total)}</p>
                        <p className="text-[11.5px] text-ink-muted capitalize">{order.fulfillment} ({order.shippingMethod})</p>
                      </div>
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-ivory/60 text-ink-muted transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Admin Actions */}
      <Panel title="Admin actions" className="mt-7">
        <div className="flex flex-wrap gap-3">
          {user.status === 'suspended' ? (
            <Button onClick={handleReinstate}>Reinstate customer account</Button>
          ) : (
            <Button variant="danger" onClick={handleSuspend}>Suspend customer account</Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/admin/messages?userId=${user.id}`)}>
            Send message
          </Button>
        </div>
      </Panel>
    </>
  )
}
