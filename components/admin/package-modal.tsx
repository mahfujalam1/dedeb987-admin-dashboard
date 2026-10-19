'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SparklesIcon, XIcon, CheckIcon, StarIcon, SmartphoneIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inputCls } from '@/components/ui/field'
import type { AiCreditPackage } from '@/lib/data/admin-data'
import { cn, currency } from '@/lib/utils'

export interface PackageDraft {
  id?: string
  title: string
  credits: number
  price: number
  perCreditLabel: string
  badge: string
  isPopular: boolean
  description: string
  status: 'active' | 'archived'
}

const emptyDraft: PackageDraft = {
  title: '',
  credits: 10,
  price: 7.99,
  perCreditLabel: '',
  badge: '',
  isPopular: false,
  description: '',
  status: 'active',
}

function toDraft(pkg: AiCreditPackage): PackageDraft {
  return {
    id: pkg.id,
    title: pkg.title,
    credits: pkg.credits,
    price: pkg.price,
    perCreditLabel: pkg.perCreditLabel,
    badge: pkg.badge ?? '',
    isPopular: pkg.isPopular ?? false,
    description: pkg.description ?? '',
    status: pkg.status,
  }
}

const labelCls = 'mb-1.5 block text-[12px] font-medium text-ink-soft'
const hintCls = 'mt-1 text-[11px] text-ink-faint'

export function PackageModal({
  editing,
  onClose,
  onSave,
}: {
  editing: AiCreditPackage | null
  onClose: () => void
  onSave: (d: PackageDraft) => void
}) {
  const [draft, setDraft] = useState<PackageDraft>(editing ? toDraft(editing) : emptyDraft)
  const [autoPerCredit, setAutoPerCredit] = useState(!editing || !editing.perCreditLabel)

  const calculatedPerCredit =
    draft.credits > 0 ? `$${(draft.price / draft.credits).toFixed(2)} / try` : '$0.00 / try'

  const effectivePerCredit = autoPerCredit ? calculatedPerCredit : draft.perCreditLabel

  const canSave = draft.title.trim() !== '' && draft.credits > 0 && draft.price > 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave({
      ...draft,
      perCreditLabel: effectivePerCredit,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-modal-title"
        className="relative z-10 flex max-h-[86dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-white shadow-card animate-rise sm:max-h-[min(840px,calc(100dvh-3rem))] sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="package-modal-title" className="font-display text-[20px] leading-tight text-ink">
                {editing ? 'Edit AI Package' : 'Create AI Credit Package'}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                Configure credit tiers for the mobile app&apos;s AI Virtual Try-On
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1.5 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-ivory-deep hover:text-ink"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="package-form"
          onSubmit={handleSubmit}
          className="scroll-thin flex-1 space-y-6 overflow-y-auto px-6 py-5 sm:px-7"
        >
          {/* Main Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="pkg-title" className={labelCls}>
                Package Title <span className="text-red-500">*</span>
              </label>
              <input
                id="pkg-title"
                required
                autoFocus
                value={draft.title}
                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Popular Pack, Studio Deluxe"
                className={inputCls}
              />
              <p className={hintCls}>Display name shown to shoppers in the mobile app.</p>
            </div>

            <div>
              <label htmlFor="pkg-credits" className={labelCls}>
                Credits Included <span className="text-red-500">*</span>
              </label>
              <input
                id="pkg-credits"
                type="number"
                min="1"
                max="1000"
                required
                value={draft.credits}
                onChange={e => setDraft(d => ({ ...d, credits: parseInt(e.target.value) || 0 }))}
                className={inputCls}
              />
              <p className={hintCls}>Each credit allows 1 full AI photo match.</p>
            </div>

            <div>
              <label htmlFor="pkg-price" className={labelCls}>
                Price (USD $) <span className="text-red-500">*</span>
              </label>
              <input
                id="pkg-price"
                type="number"
                step="0.01"
                min="0.99"
                max="999.99"
                required
                value={draft.price}
                onChange={e => setDraft(d => ({ ...d, price: parseFloat(e.target.value) || 0 }))}
                className={inputCls}
              />
              <p className={hintCls}>Billed via in-app Stripe card checkout.</p>
            </div>
          </div>

          {/* Pricing Tagline & Badge */}
          <div className="grid gap-4 sm:grid-cols-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="pkg-tagline" className="text-[12px] font-medium text-ink-soft">
                  Per-Credit Label
                </label>
                <button
                  type="button"
                  onClick={() => setAutoPerCredit(!autoPerCredit)}
                  className="text-[11px] font-semibold text-amber-600 hover:underline"
                >
                  {autoPerCredit ? 'Custom label' : 'Auto calculate'}
                </button>
              </div>
              <input
                id="pkg-tagline"
                disabled={autoPerCredit}
                value={effectivePerCredit}
                onChange={e => setDraft(d => ({ ...d, perCreditLabel: e.target.value }))}
                placeholder="$0.67 / try"
                className={cn(inputCls, autoPerCredit && 'bg-ivory text-ink-muted cursor-not-allowed')}
              />
              <p className={hintCls}>e.g. &ldquo;$0.67 / try&rdquo; or &ldquo;Best rate&rdquo;.</p>
            </div>

            {/* <div>
              <label htmlFor="pkg-badge" className={labelCls}>
                Promo Badge (Optional)
              </label>
              <input
                id="pkg-badge"
                value={draft.badge}
                onChange={e => setDraft(d => ({ ...d, badge: e.target.value }))}
                placeholder="e.g. Save 33%, Best Value, Quick Top Up"
                className={inputCls}
              />
              <p className={hintCls}>Tag highlighted above the card.</p>
            </div> */}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="pkg-desc" className={labelCls}>
              Marketing Description (Optional)
            </label>
            <textarea
              id="pkg-desc"
              rows={2}
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              placeholder="e.g. Most popular option for testing multiple hair textures and virtual wig cuts."
              className={cn(inputCls, 'resize-none')}
            />
          </div>

          {/* Featured / Popular Toggle & Status */}
          <div className="rounded-2xl border border-line bg-ivory/50 p-4 space-y-3.5">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="min-w-0 pr-4">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                  <StarIcon className="h-4 w-4 text-amber-500 fill-amber-500" />
                  Mark as Most Popular
                </span>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  Adds a glowing gold highlight ring and ribbon in the mobile app bottom sheet.
                </p>
              </div>
              <input
                type="checkbox"
                checked={draft.isPopular}
                onChange={e => setDraft(d => ({ ...d, isPopular: e.target.checked }))}
                className="h-5 w-5 rounded border-line text-ink accent-ink focus:ring-ink"
              />
            </label>

            <div className="border-t border-line/60 pt-3 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-semibold text-ink">Package Status</span>
                <p className="text-[11.5px] text-ink-muted">Active packages are instantly available for purchase.</p>
              </div>
              <select
                value={draft.status}
                onChange={e => setDraft(d => ({ ...d, status: e.target.value as 'active' | 'archived' }))}
                className={cn(inputCls, 'w-auto py-1.5 px-3 text-[12.5px]')}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Real-time In-App Preview */}
          <div className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center gap-2 mb-3 text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
              <SmartphoneIcon className="h-4 w-4 text-ink-soft" />
              In-App Preview (How it renders on customer device)
            </div>

            <div
              className={cn(
                'relative flex items-center justify-between rounded-2xl border p-4 transition-all',
                draft.isPopular
                  ? 'border-[#C4A887] bg-white ring-2 ring-[#C4A887]/30 shadow-md'
                  : 'border-line bg-ivory/30',
              )}
            >
              {draft.badge && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-[#0C090E] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {draft.badge}
                </span>
              )}

              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[16px] font-semibold text-ink">
                    {draft.title || 'Untitled Package'}
                  </span>
                  {draft.isPopular && (
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                      ★ POPULAR
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  +{draft.credits} AI Try-On Credits · <span className="font-medium text-ink-soft">{effectivePerCredit}</span>
                </p>
                {draft.description && (
                  <p className="mt-1 text-[11px] text-ink-faint line-clamp-1">{draft.description}</p>
                )}
              </div>

              <div className="shrink-0 text-right">
                <span className="font-display text-[18px] font-bold text-ink">
                  {currency(draft.price)}
                </span>
                <span className="block text-[10.5px] text-ink-muted">one-time</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions with Safe-Area clearance */}
        <div className="sticky bottom-0 z-30 flex shrink-0 items-center justify-between gap-3 border-t border-line bg-white/95 backdrop-blur-md px-6 pt-3.5 pb-[max(2.25rem,calc(env(safe-area-inset-bottom)+1.5rem))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:py-4 sm:px-7">
          <p className="hidden text-[12px] text-ink-muted sm:block">
            {canSave ? `${draft.credits} credits · ${currency(draft.price)}` : 'Enter title, credits, and price to save.'}
          </p>
          <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 text-[13.5px] font-medium touch-manipulation sm:h-10 sm:flex-none"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="package-form"
              className="h-11 flex-1 text-[13.5px] font-medium touch-manipulation sm:h-10 sm:flex-none"
              disabled={!canSave}
            >
              {editing ? 'Save Package' : 'Create Package'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
