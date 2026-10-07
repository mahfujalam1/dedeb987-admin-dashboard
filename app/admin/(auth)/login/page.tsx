import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/session'
import { LoginForm } from './login-form'

// Reads the session cookie, so this page blocks on the server rather than prerendering a static shell.
export const instant = false

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect('/admin/dashboard')
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
