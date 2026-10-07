import { NextResponse } from 'next/server'
import { verifyResetCode } from '@/lib/auth-store'

const ERRORS = {
  invalid: { error: 'That code is incorrect.', status: 400 },
  expired: { error: 'That code has expired. Request a new one.', status: 400 },
  too_many: { error: 'Too many attempts. Request a new code.', status: 429 },
} as const

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email : ''
  const code = typeof body.code === 'string' ? body.code : ''

  const result = verifyResetCode(email, code)
  if (!result.ok) {
    const { error, status } = ERRORS[result.reason]
    return NextResponse.json({ error }, { status })
  }
  return NextResponse.json({ ok: true, resetToken: result.resetToken })
}
