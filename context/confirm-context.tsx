'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ConfirmOptions {
  title: string
  body?: React.ReactNode
  confirmLabel?: string
  tone?: 'danger' | 'primary'
}
type Pending = ConfirmOptions & { resolve: (ok: boolean) => void }

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>(resolve => setPending({ ...options, resolve })), [])

  const close = useCallback((ok: boolean) => {
    setPending(p => {
      p?.resolve(ok)
      return null
    })
  }, [])

  useEffect(() => {
    if (!pending) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, close])

  const danger = pending?.tone === 'danger'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade" onClick={() => close(false)} />
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-full max-w-[420px] rounded-3xl border border-line bg-white p-6 shadow-card animate-rise">
            <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', danger ? 'bg-danger-50 text-danger-500' : 'bg-success-50 text-success-600')}>
              {danger ? <AlertTriangleIcon className="h-5 w-5" /> : <CheckCircle2Icon className="h-5 w-5" />}
            </span>
            <h2 id="confirm-title" className="mt-4 font-display text-[22px] leading-tight text-ink">{pending.title}</h2>
            {pending.body && <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{pending.body}</p>}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => close(false)}>Cancel</Button>
              <Button variant={danger ? 'danger' : 'primary'} autoFocus onClick={() => close(true)}>{pending.confirmLabel ?? 'Confirm'}</Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
