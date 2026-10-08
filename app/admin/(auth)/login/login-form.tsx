'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRightIcon, LockIcon, MailIcon } from 'lucide-react'
import { toast } from 'sonner'
import { AuthError, AuthField } from '@/components/admin/auth-field'
import { AuthShell } from '@/components/admin/auth-shell'
import { Button } from '@/components/ui/button'

const DEMO = { email: 'ops@thecut.app', password: 'thecut2026' }

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(DEMO.email)
  const [password, setPassword] = useState(DEMO.password)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const resetToastShown = useRef(false)

  useEffect(() => {
    if (searchParams.get('reset') === '1' && !resetToastShown.current) {
      resetToastShown.current = true
      toast.success('Password updated — sign in with your new password')
    }
  }, [searchParams])

  const next = searchParams.get('next')
  const destination = next && next.startsWith('/admin/') && next !== '/admin/dashboard' && next !== '/admin' ? next : '/'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Invalid admin credentials')
        setLoading(false)
        return
      }
      window.location.href = destination
    } catch {
      setError('An error occurred during sign in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Platform operations"
      subtitle="Sign in to manage orders, vendors and trust & safety."
      footer={
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-line-strong bg-white/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint">Demo access</p>
            <p className="mt-0.5 truncate font-mono text-[12px] text-ink-muted">{DEMO.email} / {DEMO.password}</p>
          </div>
          <button
            type="button"
            onClick={() => { setEmail(DEMO.email); setPassword(DEMO.password); setError('') }}
            className="shrink-0 text-[12px] font-semibold text-ink hover:text-ink-muted"
          >
            Use demo
          </button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <AuthField id="email" label="Email" type="email" icon={MailIcon} autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
        <AuthField
          id="password"
          label="Password"
          type="password"
          icon={LockIcon}
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          aside={<Link href="/admin/forgot-password" className="text-[12px] font-semibold text-ink hover:text-ink-muted">Forgot password?</Link>}
        />
        {error && <AuthError>{error}</AuthError>}
        <Button type="submit" full size="lg" loading={loading} className="mt-2">
          Sign in
          {!loading && <ArrowRightIcon className="h-4 w-4" aria-hidden />}
        </Button>
      </form>
    </AuthShell>
  )
}
