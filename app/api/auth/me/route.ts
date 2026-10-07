import { NextResponse } from 'next/server'
import { updateAdmin } from '@/lib/auth-store'
import { getCurrentAdmin } from '@/lib/session'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ admin })
}

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const patch: { name?: string; email?: string } = {}
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim()
  if (typeof body.email === 'string' && body.email.trim()) patch.email = body.email.trim()

  return NextResponse.json({ admin: updateAdmin(admin.id, patch) })
}
