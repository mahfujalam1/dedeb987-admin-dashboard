'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MessageSquareWarningIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { DisputeTag, SlaTag } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import type { Dispute } from '@/lib/data/admin-data'
import { cn, currency } from '@/lib/utils'

type Filter = 'all' | 'open' | 'resolved'
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
]

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">{label}</dt>
      <dd className="mt-1 truncate text-[13px] text-ink-soft">{children}</dd>
    </div>
  )
}

export default function DisputesPage() {
  const { disputes, allOrders, resolveDispute, escalateDispute } = useAdmin()
  const [filter, setFilter] = useState<Filter>('all')
  const confirm = useConfirm()

  async function resolve(d: Dispute, side: 'customer' | 'vendor') {
    const ok = await confirm(side === 'customer'
      ? { title: 'Resolve for customer?', body: `${d.customerName} will be refunded ${currency(d.amount)} and the dispute will be closed.`, confirmLabel: 'Refund & resolve' }
      : { title: 'Resolve for vendor?', body: `${currency(d.amount)} is released to ${d.vendorName} and the dispute will be closed.`, confirmLabel: 'Release & resolve' })
    if (!ok) return
    resolveDispute(d.id, side)
    toast.success(`Dispute resolved in favour of ${side}`)
  }

  const list = disputes.filter(d => {
    const resolved = d.status.startsWith('resolved')
    return filter === 'all' || (filter === 'resolved' ? resolved : !resolved)
  })

  return (
    <>
      <PageHeader eyebrow="Trust & safety" title="Disputes" description="Review and resolve customer and vendor disputes." />

      <div className="mt-7 flex flex-wrap gap-2">
        {FILTERS.map(f => {
          const count = f.key === 'all' ? disputes.length : disputes.filter(d => d.status.startsWith('resolved') === (f.key === 'resolved')).length
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-150',
                active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink',
              )}
            >
              {f.label}
              <span className={cn('text-[11.5px] tabular-nums', active ? 'text-white/60' : 'text-ink-faint')}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-7 space-y-4">
        {list.length === 0 && (
          <div className="rounded-2xl border border-line bg-white">
            <EmptyState icon={<MessageSquareWarningIcon className="h-5 w-5" />} title="No disputes here" body="Nothing matches this filter right now." />
          </div>
        )}
        {list.map(d => {
          const resolved = d.status.startsWith('resolved')
          const orderExists = allOrders.some(o => o.id === d.orderId)
          return (
            <div key={d.id} className="rounded-2xl border border-line bg-white p-5 transition-shadow duration-200 hover:shadow-lift sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <DisputeTag status={d.status} />
                    {!resolved && <SlaTag hoursLeft={d.slaHoursLeft} />}
                    {d.status === 'escalated' && <Tag tone="danger">Escalated</Tag>}
                  </div>
                  <h3 className="mt-3 text-[15.5px] font-medium leading-snug text-ink">{d.reason}</h3>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">Amount</p>
                  <p className="mt-0.5 font-display text-[22px] leading-none text-ink">{currency(d.amount)}</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-ivory/70 px-4 py-3 sm:grid-cols-4">
                <Meta label="Order">
                  {orderExists ? <Link href={`/admin/orders/${d.orderId}`} className="underline decoration-line-strong underline-offset-2 hover:text-ink hover:decoration-ink">{d.orderId}</Link> : d.orderId}
                </Meta>
                <Meta label="Customer">{d.customerName}</Meta>
                <Meta label="Vendor">{d.vendorName}</Meta>
                <Meta label="Opened">{d.openedAt}</Meta>
              </dl>
              {!resolved && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => resolve(d, 'customer')}>Resolve for customer</Button>
                  <Button size="sm" variant="outline" onClick={() => resolve(d, 'vendor')}>Resolve for vendor</Button>
                  {d.status !== 'escalated' && (
                    <Button size="sm" variant="outline" onClick={() => { escalateDispute(d.id); toast('Dispute escalated to senior review') }}>Escalate</Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
