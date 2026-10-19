'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { useAdmin } from '@/context/admin-context'
import { wigs } from '@/lib/data/wigs'
import { cn, currency } from '@/lib/utils'
import { SERIES, RANGE_METRICS, axis, type Range } from '@/components/admin/analytics/analytics-data'
import { GmvChart } from '@/components/admin/analytics/gmv-chart'
import { OrdersChart } from '@/components/admin/analytics/orders-chart'
import { FulfillmentBreakdown } from '@/components/admin/analytics/fulfillment-breakdown'
import { TopRankings, type TopSellerItem } from '@/components/admin/analytics/top-rankings'
import { TextureBreakdown } from '@/components/admin/analytics/texture-breakdown'

export default function AnalyticsPage() {
  const { allOrders, vendors } = useAdmin()
  const [range, setRange] = useState<Range>('Week')

  const data = SERIES[range]
  const metrics = RANGE_METRICS[range]

  const maxGmv = Math.max(...data.map(d => d.gmv))
  const maxOrders = Math.max(...data.map(d => d.orders))
  const gmvAxis = axis(maxGmv, range === 'Week' ? 500 : range === '30d' ? 10000 : 30000)
  const ordersAxis = axis(maxOrders, range === 'Week' ? 1 : range === '30d' ? 20 : 50)

  // Top Sellers per selected range (reconciled against platform orders)
  const topSellers: TopSellerItem[] = vendors
    .map(v => {
      if (range === 'Week') {
        const vendorOrders = allOrders.filter(o => o.vendorId === v.id && o.status !== 'cancelled')
        const orderSales = vendorOrders.reduce((s, o) => s + o.total, 0)
        return {
          id: v.id,
          name: v.name,
          logo: v.logo,
          plan: v.plan,
          computedGmv: orderSales,
          allTimeGmv: v.gmv,
          salesCount: vendorOrders.length,
          activeProducts: v.activeProducts,
        }
      }

      // Proportional period sales for multi-week/month ranges
      const sellerShare: Record<string, { share: number; ordersMultiplier: number }> = {
        'v-03': { share: 0.41, ordersMultiplier: 0.40 }, // Root & Reign
        'v-01': { share: 0.38, ordersMultiplier: 0.38 }, // Maison Noir
        'v-02': { share: 0.21, ordersMultiplier: 0.22 }, // Velvet Row
      }

      const conf = sellerShare[v.id] ?? { share: 0, ordersMultiplier: 0 }
      const periodSales = Math.round(metrics.netSales * conf.share * 100) / 100
      const periodOrders = Math.round(metrics.validOrdersCount * conf.ordersMultiplier)

      return {
        id: v.id,
        name: v.name,
        logo: v.logo,
        plan: v.plan,
        computedGmv: periodSales,
        allTimeGmv: v.gmv,
        salesCount: periodOrders,
        activeProducts: v.activeProducts,
      }
    })
    .sort((a, b) => b.computedGmv - a.computedGmv)
    .slice(0, 5)

  const totalTopSellersGmv = topSellers.reduce((sum, s) => sum + s.computedGmv, 0)

  // Top products list
  const topProducts = wigs.slice(0, 5).map((wig, idx) => {
    const ordersMultiplier = range === 'Week' ? 1 : range === '30d' ? 6 : range === '90d' ? 16 : 35
    const baseOrders = [4, 3, 3, 2, 1][idx]
    const ordersCount = baseOrders * ordersMultiplier
    return {
      id: wig.id,
      name: wig.name,
      brand: wig.brand,
      price: wig.price,
      salePrice: wig.salePrice,
      images: wig.images,
      unitsSold: ordersCount,
      gmv: ordersCount * (wig.salePrice ?? wig.price),
    }
  })

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">
      <PageHeader
        eyebrow="Insight"
        title="Platform Analytics"
        description="High-level metrics across the entire marketplace."
        actions={
          <div className="flex flex-wrap gap-2 sm:mt-10" role="group" aria-label="Time range">
            {(['Week', '30d', '60d', '90d', '1y'] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={cn(
                  'h-9 rounded-full border px-4 text-[13px] font-semibold transition-colors duration-150',
                  range === r ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {/* Top 4 Stat Cards — strictly synchronized with selected Range filter */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={currency(metrics.netSales)}
          hint={
            metrics.cancelledGmv > 0
              ? `Gross: ${currency(metrics.grossSales)} (-${currency(metrics.cancelledGmv)} cancelled)`
              : `Net sales across ${metrics.validOrdersCount} orders`
          }
        />
        <StatCard
          label="Avg order value"
          value={currency(metrics.avgOrderValue)}
          hint={`${metrics.validOrdersCount} valid orders (${metrics.totalOrders} total)`}
        />
        <StatCard
          label="Pickup vs Shipping ($)"
          value={`${currency(metrics.pickupSales)} / ${currency(metrics.shippingSales)}`}
          hint={`${metrics.pickupOrdersCount} pickup (${metrics.pickupSalesPct}%) · ${metrics.shippingOrdersCount} shipping (${metrics.shippingSalesPct}%)`}
        />
        <StatCard
          label="Top Seller (#1)"
          value={topSellers[0]?.name ? (topSellers[0].name.length > 14 ? `${topSellers[0].name.slice(0, 14)}...` : topSellers[0].name) : 'Root & Reign'}
          hint={`${currency(topSellers[0]?.computedGmv ?? 0)} in ${metrics.periodLabel} · ${currency(topSellers[0]?.allTimeGmv ?? 0)} all-time`}
          tone="violet"
        />
      </div>

      {/* Primary GMV Trend Chart */}
      <div className="w-full min-w-0 overflow-hidden">
        <GmvChart data={data} range={range} gmvAxis={gmvAxis} />
      </div>

      {/* Orders Volume Chart & Reconciled Fulfillment Breakdown */}
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <div className="w-full min-w-0 overflow-hidden">
          <OrdersChart data={data} range={range} ordersAxis={ordersAxis} />
        </div>
        <FulfillmentBreakdown
          pickupCount={metrics.pickupOrdersCount}
          shippingCount={metrics.shippingOrdersCount}
          pickupSales={metrics.pickupSales}
          shippingSales={metrics.shippingSales}
          pickupCountPct={metrics.pickupCountPct}
          shippingCountPct={metrics.shippingCountPct}
          pickupSalesPct={metrics.pickupSalesPct}
          shippingSalesPct={metrics.shippingSalesPct}
          pickupAov={metrics.pickupAov}
          shippingAov={metrics.shippingAov}
          grossSales={metrics.grossSales}
          netSales={metrics.netSales}
          cancelledGmv={metrics.cancelledGmv}
          periodLabel={metrics.periodLabel}
        />
      </div>

      {/* Top Rankings & Texture Distribution */}
      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 w-full min-w-0 overflow-hidden">
          <TopRankings
            topSellers={topSellers}
            totalTopSellersGmv={totalTopSellersGmv}
            topProducts={topProducts}
            rangeLabel={metrics.periodLabel}
          />
        </div>
        <div className="w-full min-w-0 overflow-hidden">
          <TextureBreakdown />
        </div>
      </div>
    </div>
  )
}
