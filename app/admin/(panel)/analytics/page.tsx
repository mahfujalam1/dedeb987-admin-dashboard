'use client'
import { useState } from 'react'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { useAdmin } from '@/context/admin-context'
import { wigs } from '@/lib/data/wigs'
import { cn, currency } from '@/lib/utils'
import { SERIES, axis, type Range } from '@/components/admin/analytics/analytics-data'
import { GmvChart } from '@/components/admin/analytics/gmv-chart'
import { OrdersChart } from '@/components/admin/analytics/orders-chart'
import { FulfillmentBreakdown } from '@/components/admin/analytics/fulfillment-breakdown'
import { TopRankings } from '@/components/admin/analytics/top-rankings'
import { TextureBreakdown } from '@/components/admin/analytics/texture-breakdown'

export default function AnalyticsPage() {
  const { allOrders, vendors } = useAdmin()
  const [range, setRange] = useState<Range>('30d')

  const data = SERIES[range]
  const gmvAxis = axis(Math.max(...data.map(d => d.gmv)), 30000)
  const ordersAxis = axis(Math.max(...data.map(d => d.orders)), 200)

  const totalGmv = allOrders.reduce((sum, o) => sum + o.total, 0)
  const avgOrder = allOrders.length ? totalGmv / allOrders.length : 0

  // 1. Pickup vs. Shipping calculations
  const validOrders = allOrders.filter(o => o.status !== 'cancelled')
  const pickupOrders = validOrders.filter(o => o.fulfillment === 'pickup')
  const shippingOrders = validOrders.filter(o => o.fulfillment === 'delivery')

  const pickupCount = pickupOrders.length
  const shippingCount = shippingOrders.length
  const totalCount = pickupCount + shippingCount

  const pickupSales = pickupOrders.reduce((sum, o) => sum + o.total, 0)
  const shippingSales = shippingOrders.reduce((sum, o) => sum + o.total, 0)
  const totalSales = pickupSales + shippingSales

  const pickupCountPct = totalCount ? Math.round((pickupCount / totalCount) * 100) : 0
  const shippingCountPct = totalCount ? 100 - pickupCountPct : 0
  const pickupSalesPct = totalSales ? Math.round((pickupSales / totalSales) * 100) : 0
  const shippingSalesPct = totalSales ? 100 - pickupSalesPct : 0

  const pickupAov = pickupCount ? pickupSales / pickupCount : 0
  const shippingAov = shippingCount ? shippingSales / shippingCount : 0

  // 2. Top Sellers (Top 5) calculation
  const topSellers = [...vendors]
    .map(v => {
      const vendorOrders = allOrders.filter(o => o.vendorId === v.id && o.status !== 'cancelled')
      const orderSales = vendorOrders.reduce((s, o) => s + o.total, 0)
      return {
        id: v.id,
        name: v.name,
        logo: v.logo,
        plan: v.plan,
        computedGmv: v.gmv > 0 ? v.gmv : orderSales,
        salesCount: vendorOrders.length + (v.openOrders || 0),
        activeProducts: v.activeProducts,
      }
    })
    .sort((a, b) => b.computedGmv - a.computedGmv)
    .slice(0, 5)

  const totalTopSellersGmv = topSellers.reduce((sum, s) => sum + s.computedGmv, 0)

  // 3. Top products list
  const topProducts = wigs.slice(0, 5).map((wig, idx) => {
    const ordersCount = [48, 36, 29, 24, 18][idx]
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
    <>
      <PageHeader
        eyebrow="Insight"
        title="Platform Analytics"
        description="High-level metrics across the entire marketplace."
        actions={
          <div className="flex gap-2 sm:mt-10" role="group" aria-label="Time range">
            {(['Week', '30d', '90d', '1y'] as Range[]).map(r => (
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

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sales" value={currency(Math.round(totalGmv * 100) / 100)} hint="Across all orders" />
        <StatCard label="Avg order value" value={currency(Math.round(avgOrder * 100) / 100)} hint={`${allOrders.length} orders`} />
        <StatCard
          label="Pickup vs Shipping"
          value={`${pickupCount} / ${shippingCount}`}
          hint={`${pickupSalesPct}% Pickup · ${shippingSalesPct}% Shipping ($)`}
        />
        <StatCard
          label="Top Seller (#1)"
          value={topSellers[0]?.name ? (topSellers[0].name.length > 14 ? `${topSellers[0].name.slice(0, 14)}...` : topSellers[0].name) : 'Root & Reign'}
          hint={`${currency(topSellers[0]?.computedGmv ?? 0)} Total Sales`}
          tone="violet"
        />
      </div>

      <GmvChart data={data} range={range} gmvAxis={gmvAxis} />

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <OrdersChart data={data} range={range} ordersAxis={ordersAxis} />
        <FulfillmentBreakdown
          pickupCount={pickupCount}
          shippingCount={shippingCount}
          pickupSales={pickupSales}
          shippingSales={shippingSales}
          pickupCountPct={pickupCountPct}
          shippingCountPct={shippingCountPct}
          pickupSalesPct={pickupSalesPct}
          shippingSalesPct={shippingSalesPct}
          pickupAov={pickupAov}
          shippingAov={shippingAov}
        />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopRankings
            topSellers={topSellers}
            totalTopSellersGmv={totalTopSellersGmv}
            topProducts={topProducts}
          />
        </div>
        <TextureBreakdown />
      </div>
    </>
  )
}
