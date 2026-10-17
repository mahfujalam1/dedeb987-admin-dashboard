'use client'
import { useState } from 'react'
import { Calculator, Calendar, TrendingUp, Package, Percent } from 'lucide-react'
import { Panel } from '@/components/admin/panel'
import { SERIES } from './analytics-data'
import { cn, currency } from '@/lib/utils'

export function WeekCalculator() {
  const weeksList = SERIES['30d']
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(3)
  const [takeRate, setTakeRate] = useState(10)
  const [growthRate, setGrowthRate] = useState(8)

  const selectedWeek = weeksList[selectedWeekIdx] ?? weeksList[3]
  const weekAov = selectedWeek.orders ? Math.round(selectedWeek.gmv / selectedWeek.orders) : 0
  const weekDailyGmv = Math.round(selectedWeek.gmv / 7)
  const platformRevenue = Math.round(selectedWeek.gmv * (takeRate / 100))
  const vendorPayout = selectedWeek.gmv - platformRevenue
  const projectedNextWeekGmv = Math.round(selectedWeek.gmv * (1 + growthRate / 100))
  const projectedNextWeekOrders = Math.round(selectedWeek.orders * (1 + growthRate / 100))

  return (
    <Panel
      title="Week Performance & Revenue Calculator"
      description="Select a week to inspect dates, calculated sales velocity, take-rate earnings, and growth projections."
      action={
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-ivory px-3 py-1 text-[12px] font-medium text-ink">
          <Calculator className="h-3.5 w-3.5 text-ink-muted" />
          <span>Week Calculator</span>
        </div>
      }
      className="mt-7"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-medium text-ink-muted mr-1">Select week:</span>
          {weeksList.map((wk, idx) => (
            <button
              key={wk.label}
              onClick={() => setSelectedWeekIdx(idx)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-all duration-150',
                selectedWeekIdx === idx
                  ? 'border-ink bg-ink text-white shadow-sm'
                  : 'border-line bg-white text-ink hover:border-line-strong hover:bg-ivory/50',
              )}
            >
              <span>{wk.label}</span>
              <span className={cn('text-[11px] font-normal', selectedWeekIdx === idx ? 'text-white/70' : 'text-ink-muted')}>
                {wk.dateRange}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-ivory/50 p-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <span>Week Window</span>
              <Calendar className="h-3.5 w-3.5 text-ink-faint" />
            </div>
            <p className="mt-1.5 text-[15px] font-semibold text-ink">{selectedWeek.label} · {selectedWeek.dateRange}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">7 days reporting interval</p>
          </div>

          <div className="rounded-xl border border-line bg-ivory/50 p-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <span>Calculated GMV</span>
              <TrendingUp className="h-3.5 w-3.5 text-success-500" />
            </div>
            <p className="mt-1.5 font-display text-[20px] font-semibold text-ink">{currency(selectedWeek.gmv)}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">{currency(weekDailyGmv)} / day average</p>
          </div>

          <div className="rounded-xl border border-line bg-ivory/50 p-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <span>Volume & AOV</span>
              <Package className="h-3.5 w-3.5 text-ink-faint" />
            </div>
            <p className="mt-1.5 text-[15px] font-semibold text-ink">{selectedWeek.orders} orders</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">Avg ticket: {currency(weekAov)}</p>
          </div>

          <div className="rounded-xl border border-line bg-ivory/50 p-3.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <span>Platform Take ({takeRate}%)</span>
              <Percent className="h-3.5 w-3.5 text-ink-muted" />
            </div>
            <p className="mt-1.5 font-display text-[20px] font-semibold text-ink">{currency(platformRevenue)}</p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">Vendor payout: {currency(vendorPayout)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 rounded-xl border border-line bg-white p-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-semibold text-ink">Marketplace Commission Rate</span>
              <span className="font-mono text-[13px] font-bold text-ink">{takeRate}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="25"
              step="1"
              value={takeRate}
              onChange={e => setTakeRate(Number(e.target.value))}
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-ivory-deep accent-ink"
            />
            <div className="mt-2 flex items-center justify-between text-[11.5px] text-ink-muted">
              <span>Platform Net: <strong className="text-ink">{currency(platformRevenue)}</strong></span>
              <span>Vendors Net: <strong className="text-ink">{currency(vendorPayout)}</strong></span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-semibold text-ink">Growth Projection for Next Week</span>
              <span className="font-mono text-[13px] font-bold text-success-600">+{growthRate}%</span>
            </div>
            <input
              type="range"
              min="-10"
              max="30"
              step="1"
              value={growthRate}
              onChange={e => setGrowthRate(Number(e.target.value))}
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-ivory-deep accent-ink"
            />
            <div className="mt-2 flex items-center justify-between text-[11.5px] text-ink-muted">
              <span>Projected GMV: <strong className="text-ink">{currency(projectedNextWeekGmv)}</strong></span>
              <span>Projected Volume: <strong className="text-ink">{projectedNextWeekOrders} orders</strong></span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
