'use client'
import { Panel } from '@/components/admin/panel'
import { TEXTURES } from './analytics-data'

export function TextureBreakdown() {
  return (
    <Panel title="Sales by texture">
      <ul className="space-y-4">
        {TEXTURES.map(t => (
          <li key={t.label}>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink-soft">{t.label}</span>
              <span className="font-semibold text-ink">{t.pct}%</span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ivory-deep"
              role="progressbar"
              aria-valuenow={t.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t.label}
            >
              <div className="h-full rounded-full bg-ink" style={{ width: `${t.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
