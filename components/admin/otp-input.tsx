'use client'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

const LENGTH = 6

export function OtpInput({ value, onChange, onComplete, disabled, invalid }: {
  value: string[]; onChange: (value: string[]) => void; onComplete?: (code: string) => void; disabled?: boolean; invalid?: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function update(next: string[]) {
    onChange(next)
    if (next.every(d => d !== '')) onComplete?.(next.join(''))
  }

  function handleChange(i: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length > 1) return fill(digits, i)
    const next = [...value]
    next[i] = digits
    update(next)
    if (digits && i < LENGTH - 1) refs.current[i + 1]?.focus()
  }

  function fill(digits: string, from = 0) {
    const next = [...value]
    for (let k = 0; k < digits.length && from + k < LENGTH; k++) next[from + k] = digits[k]
    update(next)
    refs.current[Math.min(from + digits.length, LENGTH - 1)]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      e.preventDefault()
      const next = [...value]
      next[i - 1] = ''
      onChange(next)
      refs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!digits) return
    e.preventDefault()
    fill(digits)
  }

  return (
    <div className="mt-7 flex gap-2">

      {Array.from({ length: LENGTH }, (_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          value={value[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          autoFocus={i === 0}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            'h-14 w-full min-w-0 flex-1 rounded-xl border bg-white text-center text-[20px] font-semibold text-ink transition-colors',
            'focus:border-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink/10 disabled:opacity-60',
            invalid ? 'border-danger-500/50 bg-danger-50' : value[i] ? 'border-line-strong bg-ivory' : 'border-line',
          )}
        />
      ))}
    </div>
  )
}

export const emptyOtp = () => Array<string>(LENGTH).fill('')
