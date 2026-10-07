'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MailIcon } from 'lucide-react'
import { toast } from 'sonner'
import { AuthBackLink, AuthError, AuthField } from '@/components/admin/auth-field'
import { AuthShell } from '@/components/admin/auth-shell'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.')
        setLoading(false)
        return
      }
      if (data.devCode) toast('Demo code: ' + data.devCode)
      try { sessionStorage.setItem('tc_reset_email', email) } catch {}
      router.push('/admin/forgot-password/verify?email=' + encodeURIComponent(email))
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <AuthShell step={1} title="Reset your password" subtitle="Enter your admin email and we'll send you a 6-digit code.">
      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <AuthField id="email" label="Email" type="email" icon={MailIcon} autoComplete="username" autoFocus required value={email} onChange={e => setEmail(e.target.value)} placeholder="ops@thecut.app" />
        {error && <AuthError>{error}</AuthError>}
        <Button type="submit" full size="lg" loading={loading} className="mt-2">Send reset code</Button>
      </form>
      <AuthBackLink />
    </AuthShell>
  )
}
