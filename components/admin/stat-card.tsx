import Link from 'next/link'
import { ArrowUpRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
type Tone = 'neutral' | 'warn' | 'success' | 'violet'
const toneStyles: Record<Tone, string> = {
  neutral: 'border-line bg-white',
  warn: 'border-warn-500/30 bg-warn-50',
  success: 'border-success-500/30 bg-success-50',
  violet: 'border-ink/20 bg-ink text-white',
}
export function StatCard({ label, value, hint, tone = 'neutral', to }: { label: string; value: string; hint?: string; tone?: Tone; to?: string }) {
  const content = (
    <>
      <p className={cn('text-[11px] font-bold uppercase tracking-[0.08em]', tone === 'violet' ? 'text-white/60' : 'text-ink-muted')}>{label}</p>
      <p className={cn('mt-2 font-display text-[28px] leading-none', tone === 'violet' ? 'text-white' : 'text-ink')}>{value}</p>
      {hint && <p className={cn('mt-1.5 text-[12px]', tone === 'violet' ? 'text-white/60' : 'text-ink-muted')}>{hint}</p>}
    </>
  )
  const base = cn('relative rounded-2xl border p-5', toneStyles[tone])
  if (to) return (
    <Link href={to} className={cn(base, 'group block transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20')}>
      {content}
      <ArrowUpRightIcon className={cn('absolute right-4 top-4 h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100', tone === 'violet' ? 'text-white' : 'text-ink-muted')} />
    </Link>
  )
  return <div className={base}>{content}</div>
}
