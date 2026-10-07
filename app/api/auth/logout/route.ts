import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth-store'
import { SESSION_COOKIE, getSessionToken, sessionCookieOptions } from '@/lib/session'

export async function POST() {
  destroySession(await getSessionToken())
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 })
  return res
}
