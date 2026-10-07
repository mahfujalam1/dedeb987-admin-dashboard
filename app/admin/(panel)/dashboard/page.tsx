'use client'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'
import { Panel } from '@/components/admin/panel'
import { StatCard } from '@/components/admin/stat-card'
import { DisputeTag, SeverityTag, SlaTag } from '@/components/admin/status-tag'
import { useAdmin } from '@/context/admin-context'
import { vendorById } from '@/lib/data/vendors'
import { currency } from '@/lib/utils'

const viewAllCls = 'text-[12.5px] font-semibold text-ink hover:text-ink-muted'

export default function DashboardPage() {
  const { account, allOrders, vendors, users, disputes, riskSignals } = useAdmin()

  const gmv = allOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = allOrders.filter(o => o.status === 'placed').length
  const openDisputes = disputes.filter(d => !d.status.startsWith('resolved'))
  const openSignals = riskSignals.filter(r => r.status === 'open').length
  const activeSignals = riskSignals.filter(r => r.status !== 'resolved')
  const vendorReviews = vendors.filter(v => v.verification === 'pending' || v.verification === 'unsubmitted').length
  const activeVendors = vendors.filter(v => v.status === 'active').length
  const firstName = account.name.split(' ')[0]

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Good morning, ${firstName}.`}
        description={`${allOrders.length} orders · ${activeVendors} active vendors · ${users.length} users`}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Platform GMV" value={currency(gmv)} hint="Completed orders" to="/admin/analytics" />
        <StatCard label="Pending orders" value={String(pendingOrders)} hint="Awaiting vendor action" to="/admin/orders" />
        <StatCard label="Open disputes" value={String(openDisputes.length)} hint={`${openSignals} risk signals`} tone={openDisputes.length > 0 ? 'warn' : 'neutral'} to="/admin/disputes" />
        <StatCard label="Vendor reviews" value={String(vendorReviews)} hint="Pending verification" tone={vendorReviews > 0 ? 'warn' : 'neutral'} to="/admin/vendors" />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Panel title="Recent orders" action={<Link href="/admin/orders" className={viewAllCls}>View all</Link>}>
          <ul className="space-y-3">
            {allOrders.slice(0, 5).map(o => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-line px-3 py-3 transition-colors duration-150 hover:bg-ivory">
                  <div className="min-w-0">
                    <p className="text-[13px] text-ink">{o.id}</p>
                    <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">{o.customerName} · {vendorById(o.vendorId)?.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[13.5px] font-medium text-ink">{currency(o.total)}</p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">{o.status.replace(/_/g, ' ')}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Open disputes" action={<Link href="/admin/disputes" className={viewAllCls}>View all</Link>}>
          {openDisputes.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-muted">No open disputes.</p>
          ) : (
            <ul className="space-y-3">
              {openDisputes.map(d => (
                <li key={d.id}>
                  <Link href="/admin/disputes" className="flex items-center justify-between gap-4 rounded-xl border border-line px-3 py-3 transition-colors duration-150 hover:bg-ivory">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink">{d.reason}</p>
                      <p className="mt-0.5 text-[12.5px] text-ink-muted">{d.customerName}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <DisputeTag status={d.status} />
                      <SlaTag hoursLeft={d.slaHoursLeft} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Risk signals" action={<Link href="/admin/fraud" className={viewAllCls}>View all</Link>} className="mt-6">
        {activeSignals.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-muted">No active risk signals.</p>
        ) : (
          <ul className="space-y-3">
            {activeSignals.map(r => (
              <li key={r.id}>
                <Link href="/admin/fraud" className="flex items-center justify-between gap-4 rounded-xl border border-warn-500/30 bg-warn-50 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-ink">{r.type}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-muted">{r.description}</p>
                  </div>
                  <SeverityTag severity={r.severity} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
