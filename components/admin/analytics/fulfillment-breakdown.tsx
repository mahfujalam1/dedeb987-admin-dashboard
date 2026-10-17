'use client'
import { useState } from 'react'
import { Store, Truck } from 'lucide-react'
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
}: FulfillmentBreakdownProps) {
  const [fulfillmentView, setFulfillmentView] = useState<'sales' | 'counts'>('sales')

  return (
    <Panel
      title="Fulfillment: Pick up vs Shipping"
      description="Sales volume and order counts comparing local pickup to courier shipping."
      action={
        <div className="flex rounded-lg border border-line bg-ivory p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setFulfillmentView('sales')}
            className={cn(
              'rounded-md px-2.5 py-1 transition-colors',
              fulfillmentView === 'sales' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink',
            )}
          >
            Sales ($)
          </button>
          <button
            onClick={() => setFulfillmentView('counts')}
            className={cn(
              'rounded-md px-2.5 py-1 transition-colors',
              fulfillmentView === 'counts' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink',
            )}
          >
            Counts (#)
          </button>
        </div>
      }
    >
      <div className="mb-4">
        <div className="flex items-center justify-between text-[12px] font-semibold text-ink">
          <span className="flex items-center gap-1.5 text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C4A887]" />
            Local Pickup ({fulfillmentView === 'sales' ? `${pickupSalesPct}%` : `${pickupCountPct}%`})
          </span>
          <span className="flex items-center gap-1.5 text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            Shipping ({fulfillmentView === 'sales' ? `${shippingSalesPct}%` : `${shippingCountPct}%`})
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
        <div className="rounded-xl border border-line bg-ivory/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C4A887]/20 text-[#8C6A2B]">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-semibold text-ink">Local Pickup</span>
            </div>
            <span className="rounded-full bg-[#C4A887]/20 px-2 py-0.5 text-[10.5px] font-bold text-[#6B4F1C]">
              {pickupCountPct}% of orders
            </span>
          </div>

          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Total Pickup Sales</p>
            <p className="font-display text-[22px] font-semibold text-ink">{currency(pickupSales)}</p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[12px] text-ink-muted">
            <span>Orders: <strong className="text-ink">{pickupCount} orders</strong></span>
            <span>Avg: <strong className="text-ink">{currency(pickupAov)}</strong></span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white">
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-[13px] font-semibold text-ink">Shipping Delivery</span>
            </div>
            <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10.5px] font-bold text-ink">
              {shippingCountPct}% of orders
            </span>
          </div>

          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Total Shipping Sales</p>
            <p className="font-display text-[22px] font-semibold text-ink">{currency(shippingSales)}</p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[12px] text-ink-muted">
            <span>Orders: <strong className="text-ink">{shippingCount} orders</strong></span>
            <span>Avg: <strong className="text-ink">{currency(shippingAov)}</strong></span>
          </div>
        </div>
      </div>
    </Panel>
  )
}
