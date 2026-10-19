'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircleIcon, CheckIcon, DollarSignIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inputCls } from '@/components/ui/field'
import type { Order } from '@/lib/types'
import { cn, currency } from '@/lib/utils'

export interface RefundData {
  type: 'full' | 'partial'
  amount: number
  reason: string
  note?: string
}

interface RefundModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: RefundData) => void
}

const REFUND_REASONS = [
  'Customer request / cancellation',
  'Defective or damaged wig',
  'Item does not match listing description',
  'Shipping delay / fulfillment failure',
  'Customer satisfaction / goodwill',
  'Duplicate or fraudulent charge',
  'Other',
]

export function RefundModal({ order, isOpen, onClose, onConfirm }: RefundModalProps) {
  const [mounted, setMounted] = useState(false)
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
  const [amountStr, setAmountStr] = useState(order.total.toFixed(2))
  const [reason, setReason] = useState(REFUND_REASONS[0])
  const [note, setNote] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset values when order changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setRefundType('full')
      setAmountStr(order.total.toFixed(2))
      setReason(REFUND_REASONS[0])
      setNote('')
    }
  }, [isOpen, order])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const parsedAmount = parseFloat(amountStr) || 0
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= order.total
  const isOverMax = parsedAmount > order.total
  const isZeroOrNegative = parsedAmount <= 0 && amountStr.trim() !== ''
  const remainingAmount = Math.max(0, order.total - parsedAmount)

  const handleTypeSelect = (type: 'full' | 'partial') => {
    setRefundType(type)
    if (type === 'full') {
      setAmountStr(order.total.toFixed(2))
    }
  }

  const handlePresetPercentage = (pct: number) => {
    setRefundType('partial')
    const calculated = ((order.total * pct) / 100).toFixed(2)
    setAmountStr(calculated)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Allow empty string or valid decimal numbers
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmountStr(val)
      const num = parseFloat(val)
      if (num < order.total && refundType === 'full') {
        setRefundType('partial')
      } else if (num >= order.total && refundType === 'partial') {
        setRefundType('full')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAmountValid) return

    onConfirm({
      type: refundType,
      amount: parsedAmount,
      reason,
      note: note.trim() || undefined,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-modal-title"
        className="relative z-10 flex max-h-[86dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-white shadow-card animate-rise sm:max-h-[min(780px,calc(100dvh-2rem))] sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
              <RotateCcwIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="refund-modal-title" className="font-display text-[20px] leading-tight text-ink">
                Issue refund
              </h2>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                Order <span className="font-semibold text-ink">{order.id}</span> · {order.customerName}
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="scroll-thin flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-7">
          {/* Refund Type Selection */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Refund type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleTypeSelect('full')}
                className={cn(
                  'flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all',
                  refundType === 'full'
                    ? 'border-ink bg-ivory-deep/80 shadow-xs ring-1 ring-ink'
                    : 'border-line bg-white hover:border-line-strong hover:bg-ivory/50',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[13.5px] font-semibold text-ink">Full refund</span>
                  {refundType === 'full' && <CheckIcon className="h-4 w-4 text-ink" />}
                </div>
                <span className="mt-1 text-[12px] text-ink-muted">
                  {currency(order.total)} (100%)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('partial')}
                className={cn(
                  'flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all',
                  refundType === 'partial'
                    ? 'border-ink bg-ivory-deep/80 shadow-xs ring-1 ring-ink'
                    : 'border-line bg-white hover:border-line-strong hover:bg-ivory/50',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-[13.5px] font-semibold text-ink">Partial refund</span>
                  {refundType === 'partial' && <CheckIcon className="h-4 w-4 text-ink" />}
                </div>
                <span className="mt-1 text-[12px] text-ink-muted">
                  Custom amount
                </span>
              </button>
            </div>
          </div>

          {/* Refund Amount Input Field */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="refund-amount-input" className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Refund amount
              </label>
              <span className="text-[12px] text-ink-muted">
                Order total: <strong className="font-semibold text-ink">{currency(order.total)}</strong>
              </span>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-muted">
                $
              </span>
              <input
                id="refund-amount-input"
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0.00"
                className={cn(
                  inputCls,
                  'pl-8 pr-4 text-[16px] font-semibold tracking-tight text-ink',
                  (isOverMax || isZeroOrNegative) && 'border-danger-500 focus:border-danger-500',
                )}
              />
            </div>

            {/* Error hints */}
            {isOverMax && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-danger-500">
                <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                Amount cannot exceed the total order value of {currency(order.total)}.
              </p>
            )}
            {isZeroOrNegative && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-danger-500">
                <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
                Refund amount must be greater than $0.00.
              </p>
            )}

            {/* Quick partial presets */}
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-[11.5px] font-medium text-ink-faint">Quick presets:</span>
              {[
                { label: '25%', pct: 25 },
                { label: '50%', pct: 50 },
                { label: '75%', pct: 75 },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetPercentage(preset.pct)}
                  className="rounded-lg border border-line bg-white px-2 py-0.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
                >
                  {preset.label} ({currency((order.total * preset.pct) / 100)})
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleTypeSelect('full')}
                className="rounded-lg border border-line bg-white px-2 py-0.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                100%
              </button>
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="rounded-2xl border border-line bg-ivory/60 p-3.5 text-[12.5px]">
            <div className="flex items-center justify-between text-ink-muted">
              <span>Original order total</span>
              <span className="font-medium text-ink">{currency(order.total)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-danger-600">
              <span className="font-medium">Refund to customer</span>
              <span className="font-semibold">-{currency(isAmountValid ? parsedAmount : 0)}</span>
            </div>
            <div className="mt-2 border-t border-line pt-2 flex items-center justify-between font-medium text-ink">
              <span>Retained by platform</span>
              <span>{currency(remainingAmount)}</span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label htmlFor="refund-reason" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Reason for refund
            </label>
            <select
              id="refund-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className={cn(inputCls, 'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B625F%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-[length:16px_16px] bg-[right_14px_center] bg-no-repeat pr-10')}
            >
              {REFUND_REASONS.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Note Field */}
          <div>
            <label htmlFor="refund-note" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Internal note <span className="font-normal text-ink-faint">(optional)</span>
            </label>
            <input
              id="refund-note"
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Approved via customer support chat ticket #4102"
              className={inputCls}
            />
          </div>

          {/* Card payout note */}
          <div className="rounded-xl bg-ivory-deep/50 px-3 py-2 text-[11.5px] leading-relaxed text-ink-muted">
            The refund will be credited back to the customer’s card ending in{' '}
            <strong className="text-ink">{order.paymentLast4}</strong>. This transaction cannot be reversed.
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 z-30 -mx-6 -mb-5 mt-6 flex shrink-0 flex-row items-center justify-end gap-2.5 border-t border-line bg-white/95 backdrop-blur-md px-6 pt-3.5 pb-[max(2.25rem,calc(env(safe-area-inset-bottom)+1.5rem))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:-mx-7 sm:-mb-5 sm:px-7 sm:py-4">
            <Button type="button" variant="outline" className="h-11 flex-1 text-[13.5px] font-medium touch-manipulation sm:h-10 sm:flex-none" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="h-11 flex-1 text-[13.5px] font-medium touch-manipulation sm:h-10 sm:flex-none"
              disabled={!isAmountValid}
            >
              {isAmountValid ? `Refund ${currency(parsedAmount)}` : 'Enter valid amount'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
