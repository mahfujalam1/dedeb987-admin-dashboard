import { NextResponse } from 'next/server'
import { consumeResetToken } from '@/lib/auth-store'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const token = typeof body.token === 'string' ? body.token : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  if (!consumeResetToken(token, password)) return NextResponse.json({ error: 'This reset link has expired. Start again.' }, { status: 400 })
  return NextResponse.json({ ok: true })
}
