import React from 'react'
import { cn } from '@/lib/utils'
type Variant = 'primary' | 'outline' | 'ghost' | 'danger' | 'blush'
type Size = 'sm' | 'md' | 'lg'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; full?: boolean; icon?: React.ReactNode; loading?: boolean
}
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-soft active:scale-[0.98]',
  outline: 'border border-line-strong bg-white text-ink hover:border-ink hover:bg-ivory-deep',
  ghost: 'text-ink hover:bg-ivory-deep',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  blush: 'bg-blush-300 text-ink hover:bg-blush-400 active:scale-[0.98]',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12.5px] rounded-lg gap-1.5',
  md: 'h-10 px-4 text-[13.5px] rounded-xl gap-2',
  lg: 'h-12 px-6 text-[14px] rounded-xl gap-2',
}
export function Button({ variant = 'primary', size = 'md', full, icon, loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 ease-premium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant], sizes[size], full && 'w-full', className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon}
      {children}
    </button>
  )
}
