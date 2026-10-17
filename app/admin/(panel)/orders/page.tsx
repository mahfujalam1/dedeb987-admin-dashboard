'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SearchIcon, Store, Truck } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Panel, TableWrap, Td, Th, rowCls } from '@/components/admin/panel'
import { StatCard } from '@/components/admin/stat-card'
import { OrderStatusTag } from '@/components/admin/status-tag'
import { searchCls } from '@/components/ui/field'
import { EmptyState } from '@/components/ui/states'
import { useAdmin } from '@/context/admin-context'
import { vendorById } from '@/lib/data/vendors'
import type { OrderStatus } from '@/lib/types'
import { cn, currency } from '@/lib/utils'

const STATUSES: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready', 'shipped', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled']

export default function OrdersPage() {
  const router = useRouter()
  const { allOrders, users } = useAdmin()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [fulfillment, setFulfillment] = useState<'all' | 'delivery' | 'pickup'>('all')

  // Top metric calculations
  const deliveryOrders = allOrders.filter(o => o.fulfillment === 'delivery')
  const pickupOrders = allOrders.filter(o => o.fulfillment === 'pickup')
  const totalSales = allOrders.reduce((sum, o) => sum + o.total, 0)
  const deliverySales = deliveryOrders.reduce((sum, o) => sum + o.total, 0)
  const pickupSales = pickupOrders.reduce((sum, o) => sum + o.total, 0)
  const deliveryPct = allOrders.length ? Math.round((deliveryOrders.length / allOrders.length) * 100) : 0
  const pickupPct = allOrders.length ? 100 - deliveryPct : 0

  const q = query.trim().toLowerCase()
  const orders = allOrders.filter(o => {
    if (status !== 'all' && o.status !== status) return false
    if (fulfillment !== 'all' && o.fulfillment !== fulfillment) return false
    if (!q) return true
    const vendor = vendorById(o.vendorId)?.name ?? ''
    return [o.id, o.customerName, vendor, o.shippingMethod].some(v => v.toLowerCase().includes(q))
  })

  return (
    <>
      <PageHeader eyebrow="Operations" title="All orders" description="Platform-wide order ledger with fulfillment tracking." />

      {/* Top Fulfillment & Volume Metrics */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={String(allOrders.length)} hint={`${currency(totalSales)} gross revenue`} />
        <StatCard
          label="Shipping Orders"
          value={`${deliveryOrders.length} orders`}
          hint={`${currency(deliverySales)} (${deliveryPct}% of total)`}
        />
        <StatCard
          label="Local Pickup"
          value={`${pickupOrders.length} orders`}
          hint={`${currency(pickupSales)} (${pickupPct}% of total)`}
          tone="warn"
        />
        <StatCard
          label="Fulfillment Ratio"
          value={`${deliveryPct}% : ${pickupPct}%`}
          hint="Shipping vs. Pickup split"
          tone="neutral"
        />
      </div>

      {/* Search and Filters */}
      <div className="mt-7 flex flex-wrap gap-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders..." className={cn(searchCls, 'sm:w-[220px]')} />
        <select value={status} onChange={e => setStatus(e.target.value as OrderStatus | 'all')} className={cn(searchCls, 'sm:w-[150px]')}>
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={fulfillment} onChange={e => setFulfillment(e.target.value as any)} className={cn(searchCls, 'sm:w-[170px]')}>
          <option value="all">All fulfillment types</option>
          <option value="delivery">Shipping (Delivery)</option>
          <option value="pickup">Local Pickup</option>
        </select>
      </div>

      {/* Orders Table */}
      <Panel padded={false} className="mt-6">
        {orders.length === 0 ? (
          <EmptyState icon={<SearchIcon className="h-5 w-5" />} title="No orders found" body="Try a different search, status, or fulfillment filter." />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Vendor</Th>
                <Th>Fulfillment</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const customerUser = users.find(u =>
                  u.name.toLowerCase() === o.customerName.toLowerCase() ||
                  (o.customerEmail && u.email.toLowerCase() === o.customerEmail.toLowerCase())
                )
                return (
                <tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className={cn(rowCls, 'cursor-pointer')}>
                  <Td className="font-medium">{o.id}</Td>
                  <Td>
                    {customerUser ? (
                      <Link
                        href={`/admin/users/${customerUser.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-accent-600 hover:underline"
                        title="View customer profile"
                      >
                        {o.customerName}
                      </Link>
                    ) : (
                      <span>{o.customerName}</span>
                    )}
                  </Td>
                  <Td>{vendorById(o.vendorId)?.name}</Td>
                  <Td>
                    {o.fulfillment === 'pickup' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C4A887]/40 bg-[#C4A887]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#6B4F1C]">
                        <Store className="h-3 w-3" />
                        <span>Pickup</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft">
                        <Truck className="h-3 w-3 text-ink-muted" />
                        <span>{o.shippingMethod.split('·')[0].trim() || 'Shipping'}</span>
                      </span>
                    )}
                  </Td>
                  <Td>{currency(o.total)}</Td>
                  <Td><OrderStatusTag status={o.status} /></Td>
                  <Td className="text-ink-muted">{o.placedAt}</Td>
                  <Td className="text-right">
                    <Link href={`/admin/orders/${o.id}`} onClick={e => e.stopPropagation()} className="font-semibold text-ink hover:text-ink-muted">View</Link>
                  </Td>
                </tr>
                )
              })}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </>
  )
}
