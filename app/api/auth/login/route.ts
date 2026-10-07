import { NextResponse } from 'next/server'
import { createSession, verifyPassword } from '@/lib/auth-store'
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''

  const admin = verifyPassword(email, password)
  if (!admin) return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, createSession(admin.id), sessionCookieOptions)
  return res
}
