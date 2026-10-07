'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Panel, TableWrap, Td, Th, rowCls } from '@/components/admin/panel'
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
  const { allOrders } = useAdmin()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')

  const q = query.trim().toLowerCase()
  const orders = allOrders.filter(o => {
    if (status !== 'all' && o.status !== status) return false
    if (!q) return true
    const vendor = vendorById(o.vendorId)?.name ?? ''
    return [o.id, o.customerName, vendor].some(v => v.toLowerCase().includes(q))
  })

  return (
    <>
      <PageHeader eyebrow="Operations" title="All orders" description="Platform-wide order ledger." />

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders..." className={cn(searchCls, 'sm:w-[212px]')} />
        <select value={status} onChange={e => setStatus(e.target.value as OrderStatus | 'all')} className={cn(searchCls, 'sm:w-[150px]')}>
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <Panel padded={false} className="mt-7">
        {orders.length === 0 ? (
          <EmptyState icon={<SearchIcon className="h-5 w-5" />} title="No orders found" body="Try a different search or status filter." />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Vendor</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} onClick={() => router.push(`/admin/orders/${o.id}`)} className={cn(rowCls, 'cursor-pointer')}>
                  <Td className="font-medium">{o.id}</Td>
                  <Td>{o.customerName}</Td>
                  <Td>{vendorById(o.vendorId)?.name}</Td>
                  <Td>{currency(o.total)}</Td>
                  <Td><OrderStatusTag status={o.status} /></Td>
                  <Td className="text-ink-muted">{o.placedAt}</Td>
                  <Td className="text-right">
                    <Link href={`/admin/orders/${o.id}`} onClick={e => e.stopPropagation()} className="font-semibold text-ink hover:text-ink-muted">View</Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </>
  )
}
