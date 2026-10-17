'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MessageSquareIcon, MessageSquareWarningIcon, ShieldAlertIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { DisputeChatModal } from '@/components/admin/dispute-chat-modal'
import { DisputeTag, SlaTag } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import type { Dispute } from '@/lib/data/admin-data'
import { cn, currency } from '@/lib/utils'

type Filter = 'all' | 'open' | 'escalated' | 'resolved'
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'escalated', label: 'Escalated' },
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
  const { disputes, allOrders, resolveDispute, escalateDispute, deescalateDispute } = useAdmin()
  const [filter, setFilter] = useState<Filter>('all')
  const [activeChatDispute, setActiveChatDispute] = useState<Dispute | null>(null)
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
    if (filter === 'all') return true
    if (filter === 'escalated') return d.status === 'escalated'
    if (filter === 'resolved') return d.status.startsWith('resolved')
    if (filter === 'open') return d.status === 'open' || d.status === 'reviewing'
    return true
  })

  return (
    <>
      <PageHeader
        eyebrow="Trust & safety"
        title="Disputes & Escalations"
        description="Review, inspect customer-vendor chat messages, and resolve escalated disputes."
      />

      <div className="mt-7 flex flex-wrap gap-2">
        {FILTERS.map(f => {
          const count =
            f.key === 'all'
              ? disputes.length
              : f.key === 'escalated'
              ? disputes.filter(d => d.status === 'escalated').length
              : f.key === 'resolved'
              ? disputes.filter(d => d.status.startsWith('resolved')).length
              : disputes.filter(d => d.status === 'open' || d.status === 'reviewing').length

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
              <span
                className={cn(
                  'text-[11.5px] tabular-nums',
                  active
                    ? 'text-white/70'
                    : f.key === 'escalated' && count > 0
                    ? 'font-bold text-danger-500'
                    : 'text-ink-faint',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-7 space-y-4">
        {list.length === 0 && (
          <div className="rounded-2xl border border-line bg-white">
            <EmptyState
              icon={<MessageSquareWarningIcon className="h-5 w-5" />}
              title={filter === 'escalated' ? 'No escalated disputes' : 'No disputes here'}
              body={filter === 'escalated' ? 'No cases are currently escalated to senior review.' : 'Nothing matches this filter right now.'}
            />
          </div>
        )}
        {list.map(d => {
          const resolved = d.status.startsWith('resolved')
          const isEscalated = d.status === 'escalated'
          const orderExists = allOrders.some(o => o.id === d.orderId)
          return (
            <div
              key={d.id}
              className={cn(
                'rounded-2xl border bg-white p-5 transition-shadow duration-200 hover:shadow-lift sm:p-6',
                isEscalated ? 'border-danger-500/40 ring-1 ring-danger-500/10' : 'border-line',
              )}
            >
              {isEscalated && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-danger-500/30 bg-danger-50/70 px-3.5 py-2 text-[12px] font-medium text-danger-700 animate-fade">
                  <div className="flex items-center gap-2">
                    <ShieldAlertIcon className="h-4 w-4 shrink-0 text-danger-600" />
                    <span><strong>Escalated Dispute:</strong> High-priority case assigned to Senior Administration.</span>
                  </div>
                  <Tag tone="danger">Escalated Priority</Tag>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <DisputeTag status={d.status} />
                    {!resolved && <SlaTag hoursLeft={d.slaHoursLeft} />}
                    {isEscalated && <Tag tone="danger">Senior Review</Tag>}
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
                  {orderExists ? (
                    <Link
                      href={`/admin/orders/${d.orderId}`}
                      className="underline decoration-line-strong underline-offset-2 hover:text-ink hover:decoration-ink"
                    >
                      {d.orderId}
                    </Link>
                  ) : (
                    d.orderId
                  )}
                </Meta>
                <Meta label="Customer">{d.customerName}</Meta>
                <Meta label="Vendor">{d.vendorName}</Meta>
                <Meta label="Opened">{d.openedAt}</Meta>
              </dl>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveChatDispute(d)}
                    className="gap-1.5"
                  >
                    <MessageSquareIcon className="h-3.5 w-3.5 text-ink-muted" />
                    <span>View dispute chat</span>
                  </Button>
                </div>

                {!resolved && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => resolve(d, 'customer')}>
                      Resolve for customer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => resolve(d, 'vendor')}>
                      Resolve for vendor
                    </Button>
                    {!isEscalated ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Escalate dispute #${d.id}?`,
                            body: `This will escalate the dispute for Order ${d.orderId} to Senior Admin Review and flag it for priority determination.`,
                            confirmLabel: 'Escalate dispute',
                            tone: 'danger',
                          })
                          if (ok) {
                            escalateDispute(d.id)
                            toast.success(`Dispute #${d.id} escalated to Senior Review`)
                          }
                        }}
                      >
                        Escalate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          deescalateDispute(d.id)
                          toast.info(`Dispute #${d.id} returned to standard review`)
                        }}
                      >
                        De-escalate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Slide-over / Modal for customer-vendor dispute chat */}
      <DisputeChatModal
        dispute={activeChatDispute}
        isOpen={!!activeChatDispute}
        onClose={() => setActiveChatDispute(null)}
        onResolveCustomer={() => activeChatDispute && resolve(activeChatDispute, 'customer')}
        onResolveVendor={() => activeChatDispute && resolve(activeChatDispute, 'vendor')}
        onEscalate={() => {
          if (activeChatDispute) {
            escalateDispute(activeChatDispute.id)
            toast.success(`Dispute #${activeChatDispute.id} escalated to Senior Review`)
          }
        }}
        onDeescalate={() => {
          if (activeChatDispute) {
            deescalateDispute(activeChatDispute.id)
            toast.info(`Dispute #${activeChatDispute.id} returned to standard queue`)
          }
        }}
      />
    </>
  )
}

