'use client'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel } from '@/components/admin/panel'
import type { Point, Range } from './analytics-data'
import { INK, GRID, TICK, kFormat } from './analytics-data'
import { ChartXAxisTick, ChartTooltipContent } from './chart-ticks'

interface GmvChartProps {
  data: Point[]
  range: Range
  gmvAxis: { domain: [number, number]; ticks: number[] }
}

export function GmvChart({ data, range, gmvAxis }: GmvChartProps) {
  return (
    <Panel
      title="Total Sales over time"
      description={range === '30d' ? 'Weekly sales showing dates next to each week' : undefined}
      className="mt-7"
    >
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INK} stopOpacity={0.12} />
                <stop offset="100%" stopColor={INK} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={<ChartXAxisTick data={data} />}
              stroke={GRID}
              tickLine={false}
              height={range === '30d' || range === 'Week' ? 38 : 28}
            />
            <YAxis
              tick={TICK}
              stroke={GRID}
              tickLine={false}
              tickFormatter={kFormat}
              domain={gmvAxis.domain}
              ticks={gmvAxis.ticks}
              width={56}
            />
            <Tooltip
              content={props => <ChartTooltipContent {...props} isGmv={true} />}
              cursor={{ stroke: '#C9B8B5' }}
            />
            <Area
              type="monotone"
              dataKey="gmv"
              stroke={INK}
              strokeWidth={2}
              fill="url(#gmvFill)"
              activeDot={{ r: 4, fill: INK, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
