'use client'
import Link from 'next/link'
import { CalendarIcon, ShieldCheckIcon, StoreIcon, UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { SeverityTag, severityStyles } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { cn } from '@/lib/utils'

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 }

export default function FraudPage() {
  const { riskSignals, users, vendors, resolveRiskSignal, dismissRiskSignal } = useAdmin()
  const active = riskSignals
    .filter(r => r.status !== 'resolved')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  return (
    <>
      <PageHeader eyebrow="Trust & safety" title="Fraud & risk" description="Automated risk signals flagged by the platform." />

      <div className="mt-7 space-y-4">
        {active.length === 0 && (
          <div className="rounded-2xl border border-line bg-white">
            <EmptyState icon={<ShieldCheckIcon className="h-5 w-5" />} title="All clear" body="There are no open risk signals right now." />
          </div>
        )}
        {active.map(r => {
          const user = r.userId ? users.find(u => u.id === r.userId) : undefined
          const vendor = r.vendorId ? vendors.find(v => v.id === r.vendorId) : undefined
          return (
            <div key={r.id} className="relative overflow-hidden rounded-2xl border border-line bg-white p-5 pl-6 transition-shadow duration-200 hover:shadow-lift sm:p-6 sm:pl-7">
              <span className={cn('absolute inset-y-0 left-0 w-1', severityStyles[r.severity].bar)} aria-hidden />
              <div className="flex flex-wrap items-center gap-3">
                <SeverityTag severity={r.severity} />
                <Tag tone={r.status === 'open' ? 'blush' : 'default'} className="capitalize">{r.status}</Tag>
              </div>
              <h3 className="mt-3 text-[15.5px] font-medium leading-snug text-ink">{r.type}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{r.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-muted">
                {user && (
                  <Link href="/admin/users" className="inline-flex items-center gap-1.5 hover:text-ink">
                    <UserIcon className="h-3.5 w-3.5 text-ink-faint" aria-hidden />{user.name}
                  </Link>
                )}
                {vendor && (
                  <Link href={`/admin/vendors/${vendor.id}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                    <StoreIcon className="h-3.5 w-3.5 text-ink-faint" aria-hidden />{vendor.name}
                  </Link>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-ink-faint" aria-hidden />Flagged {r.flaggedAt}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {r.status === 'open' && (
                  <Button size="sm" onClick={() => { resolveRiskSignal(r.id); toast.success('Risk signal resolved') }}>Resolve</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => { dismissRiskSignal(r.id); toast('Risk signal dismissed') }}>Dismiss</Button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
