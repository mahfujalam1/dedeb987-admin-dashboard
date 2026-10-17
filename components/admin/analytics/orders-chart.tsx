'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel } from '@/components/admin/panel'
import type { Point, Range } from './analytics-data'
import { TAN, GRID, TICK } from './analytics-data'
import { ChartXAxisTick, ChartTooltipContent } from './chart-ticks'

interface OrdersChartProps {
  data: Point[]
  range: Range
  ordersAxis: { domain: [number, number]; ticks: number[] }
}

export function OrdersChart({ data, range, ordersAxis }: OrdersChartProps) {
  const chartTitle = range === '30d' ? 'Orders per week' : range === 'Week' ? 'Orders per day' : 'Orders per month'
  const chartDesc = range === '30d' ? 'Weekly order counts with corresponding dates' : undefined

  return (
    <Panel title={chartTitle} description={chartDesc}>
      <div className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
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
              domain={ordersAxis.domain}
              ticks={ordersAxis.ticks}
            />
            <Tooltip
              content={props => <ChartTooltipContent {...props} isGmv={false} />}
              cursor={{ fill: '#F7F3F0' }}
            />
            <Bar dataKey="orders" fill={TAN} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
