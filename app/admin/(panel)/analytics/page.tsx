'use client'
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/admin/page-header'
import { Panel } from '@/components/admin/panel'
import { StatCard } from '@/components/admin/stat-card'
import { useAdmin } from '@/context/admin-context'
import { cn, currency } from '@/lib/utils'

type Range = '30d' | '90d' | '1y'
interface Point { label: string; gmv: number; orders: number }

// Demo trend series — swap for real aggregates once orders come from a backend.
const SERIES: Record<Range, Point[]> = {
  '30d': [
    { label: 'Wk 1', gmv: 24200, orders: 158 },
    { label: 'Wk 2', gmv: 25900, orders: 171 },
    { label: 'Wk 3', gmv: 25100, orders: 166 },
    { label: 'Wk 4', gmv: 28600, orders: 189 },
  ],
  '90d': [
    { label: 'Apr', gmv: 48000, orders: 300 },
    { label: 'May', gmv: 62000, orders: 390 },
    { label: 'Jun', gmv: 70000, orders: 460 },
    { label: 'Jul', gmv: 83000, orders: 540 },
    { label: 'Aug', gmv: 91000, orders: 610 },
    { label: 'Sep', gmv: 108000, orders: 710 },
  ],
  '1y': [
    { label: 'Oct', gmv: 18000, orders: 120 },
    { label: 'Nov', gmv: 23000, orders: 150 },
    { label: 'Dec', gmv: 31000, orders: 205 },
    { label: 'Jan', gmv: 27000, orders: 180 },
    { label: 'Feb', gmv: 32000, orders: 210 },
    { label: 'Mar', gmv: 39000, orders: 250 },
    { label: 'Apr', gmv: 48000, orders: 300 },
    { label: 'May', gmv: 62000, orders: 390 },
    { label: 'Jun', gmv: 70000, orders: 460 },
    { label: 'Jul', gmv: 83000, orders: 540 },
    { label: 'Aug', gmv: 91000, orders: 610 },
    { label: 'Sep', gmv: 108000, orders: 710 },
  ],
}

const TEXTURES = [
  { label: 'Straight', pct: 38 },
  { label: 'Wavy', pct: 27 },
  { label: 'Curly', pct: 19 },
  { label: 'Kinky', pct: 16 },
]

const INK = '#0C090E'
const TAN = '#C4A887'
const GRID = '#E6DEDA'
const TICK = { fontSize: 12, fill: '#6B625F' }
const tooltipStyle = { borderRadius: 10, border: '1px solid #E6DEDA', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', fontSize: 12.5 }

const kFormat = (v: number) => (v === 0 ? '$0' : `$${(v / 1000).toFixed(1)}k`)

// Rounded axis ceiling with ~10% headroom, split into four even steps.
function axis(max: number, unit: number) {
  const top = Math.ceil((max * 1.1) / unit) * unit
  return { domain: [0, top] as [number, number], ticks: [0, 1, 2, 3, 4].map(i => (top / 4) * i) }
}

export default function AnalyticsPage() {
  const { allOrders, vendors, users } = useAdmin()
  const [range, setRange] = useState<Range>('90d')
  const data = SERIES[range]
  const gmvAxis = axis(Math.max(...data.map(d => d.gmv)), 30000)
  const ordersAxis = axis(Math.max(...data.map(d => d.orders)), 200)

  const totalGmv = allOrders.reduce((sum, o) => sum + o.total, 0)
  const avgOrder = allOrders.length ? totalGmv / allOrders.length : 0
  const activeVendors = vendors.filter(v => v.status === 'active').length

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Platform analytics"
        description="High-level metrics across the entire marketplace."
        actions={
          <div className="flex gap-2 sm:mt-10" role="group" aria-label="Time range">
            {(['30d', '90d', '1y'] as Range[]).map(r => (
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
        <StatCard label="Total GMV" value={currency(Math.round(totalGmv * 100) / 100)} />
        <StatCard label="Avg order value" value={currency(Math.round(avgOrder * 100) / 100)} />
        <StatCard label="Active vendors" value={String(activeVendors)} />
        <StatCard label="Total users" value={String(users.length)} />
      </div>

      <Panel title="GMV over time" className="mt-7">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INK} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={INK} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={TICK} stroke={GRID} tickLine={false} />
              <YAxis tick={TICK} stroke={GRID} tickLine={false} tickFormatter={kFormat} domain={gmvAxis.domain} ticks={gmvAxis.ticks} width={56} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [currency(Number(v)), 'GMV']} cursor={{ stroke: '#C9B8B5' }} />
              <Area type="monotone" dataKey="gmv" stroke={INK} strokeWidth={2} fill="url(#gmvFill)" activeDot={{ r: 4, fill: INK, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <Panel title={range === '30d' ? 'Orders per week' : 'Orders per month'}>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={TICK} stroke={GRID} tickLine={false} />
                <YAxis tick={TICK} stroke={GRID} tickLine={false} domain={ordersAxis.domain} ticks={ordersAxis.ticks} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [String(v), 'Orders']} cursor={{ fill: '#F7F3F0' }} />
                <Bar dataKey="orders" fill={TAN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sales by texture">
          <ul className="space-y-4">
            {TEXTURES.map(t => (
              <li key={t.label}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-soft">{t.label}</span>
                  <span className="font-semibold text-ink">{t.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ivory-deep" role="progressbar" aria-valuenow={t.pct} aria-valuemin={0} aria-valuemax={100} aria-label={t.label}>
                  <div className="h-full rounded-full bg-ink" style={{ width: `${t.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
