'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { AuthBackLink, AuthError } from '@/components/admin/auth-field'
import { AuthShell } from '@/components/admin/auth-shell'
import { OtpInput, emptyOtp } from '@/components/admin/otp-input'
import { Button } from '@/components/ui/button'

const RESEND_COOLDOWN = 30

function VerifyForm() {
  const router = useRouter()
  const email = useSearchParams().get('email') ?? ''
  const [digits, setDigits] = useState(emptyOtp)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)

  useEffect(() => {
    if (!email) router.replace('/admin/forgot-password')
  }, [email, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function verify(code: string) {
    if (loading || code.length !== 6) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'That code is incorrect.')
        setDigits(emptyOtp())
        setLoading(false)
        return
      }
      router.push('/admin/reset-password?token=' + data.resetToken)
    } catch {
      setError('Something went wrong. Try again.')
      setDigits(emptyOtp())
      setLoading(false)
    }
  }

  async function resend() {
    if (cooldown > 0) return
    setCooldown(RESEND_COOLDOWN)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.devCode) toast('Demo code: ' + data.devCode)
      else toast.success('A new code is on its way')
    } catch {
      setError('Something went wrong. Try again.')
    }
  }

  if (!email) return null

  const code = digits.join('')
  const mm = Math.floor(cooldown / 60)
  const ss = String(cooldown % 60).padStart(2, '0')

  return (
    <AuthShell
      step={2}
      title="Check your email"
      subtitle={<>We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>. It expires in 10 minutes.</>}
    >
      <form onSubmit={e => { e.preventDefault(); verify(code) }}>
        <OtpInput value={digits} onChange={d => { setDigits(d); if (error) setError('') }} onComplete={verify} disabled={loading} invalid={!!error} />
        {error && <div className="mt-4"><AuthError>{error}</AuthError></div>}
        <Button type="submit" full size="lg" className="mt-6" loading={loading} disabled={code.length !== 6}>Verify code</Button>
      </form>
      <p className="mt-5 text-center text-[12.5px] text-ink-muted">
        Didn&apos;t get it?{' '}
        {cooldown > 0
          ? <span className="tabular-nums">Resend in {mm}:{ss}</span>
          : <button type="button" onClick={resend} className="font-semibold text-ink hover:text-ink-muted">Resend code</button>}
      </p>
      <AuthBackLink />
    </AuthShell>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
