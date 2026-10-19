'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CalendarIcon, ShieldCheckIcon, StoreIcon, UserIcon, CheckCircleIcon, XIcon, FileTextIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { SeverityTag, severityStyles } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { inputCls } from '@/components/ui/field'
import { useAdmin } from '@/context/admin-context'
import type { RiskSignal } from '@/lib/data/admin-data'
import { cn } from '@/lib/utils'

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 }

const QUICK_RESOLVE_NOTES = [
  'Customer confirmed charge & identity verified',
  'False positive — legitimate repeat order velocity',
  'Reviewed with vendor atelier and approved',
  'Address and CVV verified successfully',
]

export default function FraudPage() {
  const { riskSignals, users, vendors, resolveRiskSignal, dismissRiskSignal } = useAdmin()
  const [tab, setTab] = useState<'active' | 'resolved'>('active')
  const [resolvingSignal, setResolvingSignal] = useState<RiskSignal | null>(null)
  const [note, setNote] = useState('')

  const active = riskSignals
    .filter(r => r.status !== 'resolved')
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])

  const resolved = riskSignals
    .filter(r => r.status === 'resolved')

  const handleOpenResolve = (signal: RiskSignal) => {
    setResolvingSignal(signal)
    setNote('')
  }

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvingSignal) return
    resolveRiskSignal(resolvingSignal.id, note.trim() || 'Verified and resolved by administrator')
    toast.success(`Risk signal "${resolvingSignal.type}" resolved with audit note`)
    setResolvingSignal(null)
    setNote('')
  }

  const displayed = tab === 'active' ? active : resolved

  return (
    <>
      <PageHeader
        eyebrow="Trust & safety"
        title="Fraud & risk"
        description="Automated risk signals flagged by the platform."
        actions={
          <div className="flex rounded-full border border-line bg-white p-1 text-[12.5px] font-semibold">
            <button
              onClick={() => setTab('active')}
              className={cn(
                'rounded-full px-4 py-1.5 transition-colors',
                tab === 'active' ? 'bg-ink text-white shadow-xs' : 'text-ink-muted hover:text-ink',
              )}
            >
              Active ({active.length})
            </button>
            <button
              onClick={() => setTab('resolved')}
              className={cn(
                'rounded-full px-4 py-1.5 transition-colors',
                tab === 'resolved' ? 'bg-ink text-white shadow-xs' : 'text-ink-muted hover:text-ink',
              )}
            >
              Resolved ({resolved.length})
            </button>
          </div>
        }
      />

      <div className="mt-7 space-y-4">
        {displayed.length === 0 && (
          <div className="rounded-2xl border border-line bg-white">
            <EmptyState
              icon={<ShieldCheckIcon className="h-5 w-5" />}
              title={tab === 'active' ? 'All clear' : 'No resolved signals'}
              body={tab === 'active' ? 'There are no open risk signals right now.' : 'Resolved signals with audit notes will appear here.'}
            />
          </div>
        )}
        {displayed.map(r => {
          const user = r.userId ? users.find(u => u.id === r.userId) : undefined
          const vendor = r.vendorId ? vendors.find(v => v.id === r.vendorId) : undefined
          const isResolved = r.status === 'resolved'

          return (
            <div
              key={r.id}
              className={cn(
                'relative overflow-hidden rounded-2xl border bg-white p-5 pl-6 transition-shadow duration-200 hover:shadow-lift sm:p-6 sm:pl-7',
                isResolved ? 'border-line/70 bg-ivory/30' : 'border-line',
              )}
            >
              <span
                className={cn('absolute inset-y-0 left-0 w-1', isResolved ? 'bg-emerald-500' : severityStyles[r.severity].bar)}
                aria-hidden
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <SeverityTag severity={r.severity} />
                  <Tag tone={isResolved ? 'success' : r.status === 'open' ? 'blush' : 'default'} className="capitalize">
                    {r.status}
                  </Tag>
                </div>
                {isResolved && (
                  <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-700">
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    Resolved {r.resolvedAt || 'recently'}
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-[15.5px] font-medium leading-snug text-ink">{r.type}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">{r.description}</p>

              {/* Resolution Note if resolved */}
              {isResolved && r.resolutionNote && (
                <div className="mt-3.5 rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3 text-[12.5px] text-emerald-900">
                  <div className="flex items-start gap-2">
                    <FileTextIcon className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <span className="font-semibold text-emerald-950">Resolution Note: </span>
                      <span>{r.resolutionNote}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-muted">
                {user && (
                  <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-1.5 hover:text-ink">
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

              {!isResolved && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleOpenResolve(r)}>
                    Resolve with Note
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { dismissRiskSignal(r.id); toast('Risk signal dismissed') }}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Resolve Note Modal */}
      {resolvingSignal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade" onClick={() => setResolvingSignal(null)} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 flex max-h-[86dvh] w-full max-w-[500px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-white shadow-card animate-rise sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <h3 className="font-display text-[19px] font-semibold text-ink">Resolve Risk Signal</h3>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">
                  Document your review findings and reasons for clearing this flag.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResolvingSignal(null)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmResolve} className="scroll-thin flex-1 overflow-y-auto p-6 space-y-4">
              <div className="rounded-xl border border-line bg-ivory/40 p-3 text-[12.5px]">
                <p className="font-semibold text-ink">{resolvingSignal.type}</p>
                <p className="mt-0.5 text-ink-muted">{resolvingSignal.description}</p>
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Resolution Note / Audit Trail <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  autoFocus
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Explain why this risk signal is considered resolved..."
                  className={cn(inputCls, 'resize-none text-[13px]')}
                />
              </div>

              <div>
                <span className="block text-[11.5px] font-medium text-ink-faint mb-1.5">Quick reason presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_RESOLVE_NOTES.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNote(preset)}
                      className="rounded-lg border border-line bg-ivory/50 px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:border-ink hover:text-ink transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safe area footer */}
              <div className="sticky bottom-0 z-20 -mx-6 -mb-6 flex shrink-0 items-center justify-end gap-2.5 border-t border-line bg-white/95 backdrop-blur-md px-6 pt-3 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] shadow-[0_-8px_20px_rgba(0,0,0,0.06)] sm:py-3.5">
                <Button type="button" variant="outline" className="h-11 flex-1 sm:h-10 sm:flex-none" onClick={() => setResolvingSignal(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-11 flex-1 sm:h-10 sm:flex-none">
                  Confirm & Resolve
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
