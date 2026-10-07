import { NextResponse } from 'next/server'
import { createResetCode, findAdminByEmail } from '@/lib/auth-store'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })

  // Always succeed so the response doesn't reveal whether the account exists.
  if (!findAdminByEmail(email)) return NextResponse.json({ ok: true })

  const code = createResetCode(email)
  // TODO: send via email provider
  console.log(`[auth] Password reset code for ${email}: ${code}`)

  return NextResponse.json(process.env.NODE_ENV !== 'production' ? { ok: true, devCode: code } : { ok: true })
}
