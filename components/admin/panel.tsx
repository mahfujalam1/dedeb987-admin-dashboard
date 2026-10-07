import { cn } from '@/lib/utils'
export function Panel({ title, description, action, children, padded = true, emphasis, className }: {
  title?: string; description?: string; action?: React.ReactNode; children: React.ReactNode; padded?: boolean; emphasis?: boolean; className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-line bg-white', emphasis && 'ring-1 ring-line-strong', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h3 className="font-semibold text-[14px] text-ink">{title}</h3>}
            {description && <p className="mt-0.5 text-[12px] text-ink-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(padded && 'p-5')}>{children}</div>
    </div>
  )
}
export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-[13.5px]">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  )
}
export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="scroll-thin overflow-x-auto"><table className="w-full min-w-[600px] text-[13px]">{children}</table></div>
}
// Body row: hover tint, and no double border against the panel edge on the last row.
export const rowCls = 'transition-colors duration-150 hover:bg-ivory/70 last:[&>td]:border-b-0'
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('border-b border-line bg-ivory/40 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-faint', className)}>{children}</th>
}
export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('border-b border-line px-4 py-3 text-[13px] text-ink', className)}>{children}</td>
}
