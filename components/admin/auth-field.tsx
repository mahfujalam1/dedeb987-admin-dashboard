'use client'
import { useState } from 'react'
import Link from 'next/link'
import { AlertCircleIcon, ArrowLeftIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { inputCls, labelCls } from '@/components/ui/field'
import { cn } from '@/lib/utils'

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string; label: string; icon?: React.ComponentType<{ className?: string }>; aside?: React.ReactNode
}

export function AuthField({ id, label, icon: Icon, aside, type = 'text', className, ...props }: AuthFieldProps) {
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className={labelCls.replace(' mb-1.5', '')}>{label}</label>
        {aside}
      </div>
      <div className="group relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-ink" />}
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          className={cn(inputCls, 'transition-colors', Icon && 'pl-11', isPassword && 'pr-11', className)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal(r => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
          >
            {reveal ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger-500/20 bg-danger-50 px-3.5 py-2.5 text-[12.5px] text-danger-500">
      <AlertCircleIcon className="mt-px h-4 w-4 shrink-0" aria-hidden />
      {children}
    </p>
  )
}

export function AuthBackLink() {
  return (
    <div className="mt-6 border-t border-line pt-5 text-center">
      <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink hover:text-ink-muted">
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
        Back to sign in
      </Link>
    </div>
  )
}
