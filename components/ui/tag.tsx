import { cn } from '@/lib/utils'
export type TagTone = 'default' | 'blush' | 'warn' | 'success' | 'danger' | 'violet'
const tones: Record<TagTone, string> = {
  default: 'bg-ivory-deep text-ink',
  blush: 'bg-blush-100 text-blush-600',
  warn: 'bg-warn-50 text-warn-600',
  success: 'bg-success-50 text-success-600',
  danger: 'bg-danger-50 text-danger-500',
  violet: 'bg-violet-100 text-violet-700',
}
export function Tag({ children, tone = 'default', className }: { children: React.ReactNode; tone?: TagTone; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold', tones[tone], className)}>{children}</span>
}
