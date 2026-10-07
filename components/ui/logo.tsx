import { cn } from '@/lib/utils'
export function Logo({ size = 'md', withMark, className }: { size?: 'sm' | 'md' | 'lg'; withMark?: boolean; className?: string }) {
  const text = size === 'sm' ? 'text-[18px]' : size === 'lg' ? 'text-[32px]' : 'text-[24px]'
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {withMark && (
        <span className={cn('flex items-center justify-center rounded-lg bg-ink text-white', size === 'sm' ? 'h-7 w-7 text-[11px]' : size === 'lg' ? 'h-12 w-12 text-[18px]' : 'h-9 w-9 text-[14px]')}>
          <span className="font-display font-bold leading-none">TC</span>
        </span>
      )}
      <span className={cn('font-display font-bold leading-none text-ink tracking-tight', text)}>The Cut</span>
    </div>
  )
}
export function BrandLogo({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return (
    <div className={cn('flex items-center', className)}>
      <img src="/the-cut-logo.png" alt="The Cut" className={cn('h-10 w-auto object-contain', imgClassName)} />
    </div>
  )
}
