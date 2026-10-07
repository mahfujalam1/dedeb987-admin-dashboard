import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { getSessionAdmin, SESSION_TTL_MS } from '@/lib/auth-store'

export const SESSION_COOKIE = 'tc_admin_session'

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_MS / 1000,
}

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value
}

export async function getCurrentAdmin() {
  const token = await getSessionToken()
  // Session expiry compares against the current time, so this must run at request time.
  await connection()
  return getSessionAdmin(token)
}
