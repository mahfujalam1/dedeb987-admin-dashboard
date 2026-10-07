'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckIcon, CircleIcon, LinkIcon, LockIcon } from 'lucide-react'
import { AuthBackLink, AuthError, AuthField } from '@/components/admin/auth-field'
import { AuthShell } from '@/components/admin/auth-shell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className={cn('flex items-center gap-2 text-[12px] transition-colors', met ? 'text-success-600' : 'text-ink-faint')}>
      {met ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <CircleIcon className="h-3.5 w-3.5" aria-hidden />}
      {children}
    </li>
  )
}

function ResetForm() {
  const router = useRouter()
  const token = useSearchParams().get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <AuthShell>
        <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-50 text-danger-500">
          <LinkIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-5 font-display text-[28px] leading-tight text-ink">Link expired</h1>
        <p className="mt-2 text-[13.5px] text-ink-muted">This reset link is invalid or has expired.</p>
        <Button full size="lg" className="mt-7" onClick={() => router.push('/admin/forgot-password')}>Start again</Button>
        <AuthBackLink />
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell>
        <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 text-success-600">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-[28px] leading-tight text-ink">Password updated</h1>
        <p className="mt-2 text-[13.5px] text-ink-muted">You can now sign in with your new password.</p>
        <Button full size="lg" className="mt-7" onClick={() => router.push('/admin/login?reset=1')}>Back to sign in</Button>
      </AuthShell>
    )
  }

  const longEnough = password.length >= 8
  const matches = confirm.length > 0 && password === confirm

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!longEnough) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError("Passwords don't match.")
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'This reset link has expired. Start again.')
        setLoading(false)
        return
      }
      setDone(true)
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <AuthShell step={3} title="Choose a new password" subtitle="Use at least 8 characters. You'll be signed out of other sessions.">
      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <AuthField id="password" label="New password" type="password" icon={LockIcon} autoComplete="new-password" autoFocus value={password} onChange={e => setPassword(e.target.value)} />
        <AuthField id="confirm" label="Confirm password" type="password" icon={LockIcon} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <ul className="space-y-1.5 rounded-xl bg-ivory px-3.5 py-3">
          <Requirement met={longEnough}>At least 8 characters</Requirement>
          <Requirement met={matches}>Passwords match</Requirement>
        </ul>
        {error && <AuthError>{error}</AuthError>}
        <Button type="submit" full size="lg" loading={loading} className="mt-2">Update password</Button>
      </form>
      <AuthBackLink />
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
