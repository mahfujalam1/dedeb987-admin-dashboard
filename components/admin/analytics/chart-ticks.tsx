'use client'
import React from 'react'
import type { Point } from './analytics-data'
import { currency } from '@/lib/utils'

export function ChartXAxisTick(props: any) {
  const { x, y, payload, data } = props
  const pt = (data as Point[] | undefined)?.find(d => d.label === payload.value)
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#0C090E" fontSize={12} fontWeight={600}>
        {payload.value}
      </text>
      {pt?.dateRange && (
        <text x={0} y={0} dy={26} textAnchor="middle" fill="#8C827A" fontSize={10.5}>
          {pt.dateRange}
        </text>
      )}
    </g>
  )
}

export function ChartTooltipContent({ active, payload, isGmv }: { active?: boolean; payload?: readonly any[]; isGmv: boolean }) {
  if (!active || !payload?.length) return null
  const pt = payload[0].payload as Point
  return (
    <div className="rounded-xl border border-line bg-white p-3 shadow-lg text-[12.5px] min-w-[170px]">
      <div className="flex items-center gap-1.5 font-semibold text-ink">
        <span>{pt.label}</span>
        {pt.dateRange && (
          <span className="text-[11px] font-normal text-ink-muted">({pt.dateRange})</span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 border-t border-line/60 pt-2 text-[12px] text-ink-muted">
        <span>{isGmv ? 'Total Sales' : 'Orders'}</span>
        <span className="font-semibold text-ink">
          {isGmv ? currency(pt.gmv) : `${pt.orders} orders`}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 pt-1 text-[11px] text-ink-faint">
        <span>{isGmv ? 'Orders' : 'Total Sales'}</span>
        <span>{isGmv ? `${pt.orders} orders` : currency(pt.gmv)}</span>
      </div>
    </div>
  )
}
