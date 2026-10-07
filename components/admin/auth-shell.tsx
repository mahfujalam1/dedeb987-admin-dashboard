import { LockIcon, ShieldCheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESET_STEPS = 3

export function AuthShell({ title, subtitle, step, footer, children }: {
  title?: string; subtitle?: React.ReactNode; step?: number; footer?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <main className="flex min-h-full bg-ivory">
      {/* Brand panel (desktop) */}
      <section className="relative hidden w-[46%] max-w-[640px] shrink-0 flex-col justify-between overflow-hidden border-r border-line bg-white px-12 py-10 lg:flex">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush-100 blur-3xl animate-breathe" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint">Admin console</p>
        <div className="relative flex flex-col items-center text-center">
          <img src="/the-cut-logo.png" alt="The Cut — Wig Matchmakers" className="w-full max-w-[360px] object-contain mix-blend-multiply" />
          <p className="mt-8 max-w-[30ch] text-balance font-display text-[20px] italic leading-snug text-ink-soft">Run the marketplace behind every perfect match.</p>
        </div>
        <p className="relative text-[12px] text-ink-faint">© 2026 The Cut · Platform operations</p>
      </section>

      {/* Form */}
      <section className="flex flex-1 items-center justify-center bg-grain px-5 py-10 sm:px-8">
        <div className="w-full max-w-[400px]">
          <img src="/the-cut-logo.png" alt="The Cut — Wig Matchmakers" className="mx-auto mb-6 h-32 w-auto object-contain mix-blend-multiply lg:hidden" />

          <div className="rounded-3xl border border-line bg-white p-7 shadow-lift sm:p-8">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <ShieldCheckIcon className="h-3 w-3" aria-hidden />
                Admin
              </span>
              {step && <span className="text-[11px] font-semibold text-ink-faint">Step {step} of {RESET_STEPS}</span>}
            </div>
            {step && (
              <div className="mt-4 grid grid-cols-3 gap-1.5" aria-hidden>
                {Array.from({ length: RESET_STEPS }, (_, i) => (
                  <span key={i} className={cn('h-1 rounded-full transition-colors duration-300', i < step ? 'bg-ink' : 'bg-line')} />
                ))}
              </div>
            )}
            {title && <h1 className="mt-5 font-display text-[28px] leading-tight text-ink">{title}</h1>}
            {subtitle && <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{subtitle}</p>}
            {children}
          </div>

          {footer}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-faint">
            <LockIcon className="h-3 w-3" aria-hidden />
            Restricted area · authorised staff only
          </p>
        </div>
      </section>
    </main>
  )
}
