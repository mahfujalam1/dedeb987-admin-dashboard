'use client'
import { useState } from 'react'
import { Store, Truck, Info, CheckCircle2 } from 'lucide-react'
import { Panel } from '@/components/admin/panel'
import { cn, currency } from '@/lib/utils'

interface FulfillmentBreakdownProps {
  pickupCount: number
  shippingCount: number
  pickupSales: number
  shippingSales: number
  pickupCountPct: number
  shippingCountPct: number
  pickupSalesPct: number
  shippingSalesPct: number
  pickupAov: number
  shippingAov: number
  grossSales?: number
  netSales?: number
  cancelledGmv?: number
  periodLabel?: string
}

export function FulfillmentBreakdown({
  pickupCount,
  shippingCount,
  pickupSales,
  shippingSales,
  pickupCountPct,
  shippingCountPct,
  pickupSalesPct,
  shippingSalesPct,
  pickupAov,
  shippingAov,
  grossSales = 6660.90,
  netSales = 6271.15,
  cancelledGmv = 389.75,
  periodLabel = 'This Week',
}: FulfillmentBreakdownProps) {
  const [fulfillmentView, setFulfillmentView] = useState<'sales' | 'counts'>('sales')

  const totalValidSales = pickupSales + shippingSales
  const totalValidOrders = pickupCount + shippingCount

  return (
    <Panel
      title="Fulfillment: Pick up vs Shipping"
      description={`Distribution for ${periodLabel}. Compare revenue share vs order volume.`}
      action={
        <div className="flex rounded-lg border border-line bg-ivory p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setFulfillmentView('sales')}
            className={cn(
              'rounded-md px-2.5 py-1 transition-colors',
              fulfillmentView === 'sales' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink',
            )}
          >
            By Sales ($)
          </button>
          <button
            onClick={() => setFulfillmentView('counts')}
            className={cn(
              'rounded-md px-2.5 py-1 transition-colors',
              fulfillmentView === 'counts' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink',
            )}
          >
            By Orders (#)
          </button>
        </div>
      }
    >
      <div className="mb-4">
        <div className="flex items-center justify-between text-[12px] font-semibold text-ink">
          <span className="flex items-center gap-1.5 text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C4A887]" />
            Local Pickup &mdash;{' '}
            <strong className="text-ink">
              {fulfillmentView === 'sales' ? `${pickupSalesPct}% sales` : `${pickupCountPct}% orders`}
            </strong>
          </span>
          <span className="flex items-center gap-1.5 text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            Shipping Delivery &mdash;{' '}
            <strong className="text-ink">
              {fulfillmentView === 'sales' ? `${shippingSalesPct}% sales` : `${shippingCountPct}% orders`}
            </strong>
          </span>
        </div>
        <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-ivory-deep">
          <div
            className="bg-[#C4A887] transition-all duration-300"
            style={{ width: `${fulfillmentView === 'sales' ? pickupSalesPct : pickupCountPct}%` }}
          />
          <div
            className="bg-ink transition-all duration-300"
            style={{ width: `${fulfillmentView === 'sales' ? shippingSalesPct : shippingCountPct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Local Pickup Card */}
        <div className="rounded-xl border border-line bg-ivory/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C4A887]/20 text-[#8C6A2B]">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-semibold text-ink">Local Pickup</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="rounded-full bg-[#C4A887]/20 px-2 py-0.5 text-[10.5px] font-bold text-[#6B4F1C]">
                {pickupSalesPct}% of sales
              </span>
              <span className="text-[10px] text-ink-muted mt-0.5">
                {pickupCountPct}% of orders ({pickupCount})
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Pickup Sales Volume</p>
            <p className="font-display text-[22px] font-semibold text-ink">{currency(pickupSales)}</p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[12px] text-ink-muted">
            <span>Orders: <strong className="text-ink">{pickupCount} orders</strong></span>
            <span>Avg: <strong className="text-ink">{currency(pickupAov)}</strong></span>
          </div>
        </div>

        {/* Courier Shipping Card */}
        <div className="rounded-xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white">
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-semibold text-ink">Courier Shipping</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10.5px] font-bold text-ink">
                {shippingSalesPct}% of sales
              </span>
              <span className="text-[10px] text-ink-muted mt-0.5">
                {shippingCountPct}% of orders ({shippingCount})
              </span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Shipping Sales Volume</p>
            <p className="font-display text-[22px] font-semibold text-ink">{currency(shippingSales)}</p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[12px] text-ink-muted">
            <span>Orders: <strong className="text-ink">{shippingCount} orders</strong></span>
            <span>Avg: <strong className="text-ink">{currency(shippingAov)}</strong></span>
          </div>
        </div>
      </div>

      {/* Sales Reconciliation Callout */}
      <div className="mt-3.5 rounded-lg border border-line/80 bg-ivory/60 p-2.5 text-[11.5px] text-ink-muted">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-semibold text-ink">Sales Reconciliation: </span>
            <span>
              Pickup ({currency(pickupSales)}) + Shipping ({currency(shippingSales)}) ={' '}
              <strong className="text-ink">{currency(totalValidSales)} Net Sales</strong> ({totalValidOrders} orders).
            </span>
            {cancelledGmv > 0 && (
              <span className="block mt-0.5 text-ink-soft">
                Gross sales of {currency(grossSales)} reflects {currency(cancelledGmv)} in cancelled / refunded orders.
              </span>
            )}
          </div>
        </div>
      </div>
    </Panel>
  )
}
