// In-memory auth store — a stand-in for a real database + email provider.
// State lives on a globalThis singleton so it survives dev hot reloads.
// Everything resets when the server process restarts.
import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
import type { AdminAccount } from '@/lib/types'

interface AdminRecord extends AdminAccount { passwordHash: string }
interface Session { adminId: string; expiresAt: number }
interface ResetCode { codeHash: string; expiresAt: number; attempts: number }
interface ResetToken { adminId: string; expiresAt: number }

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const RESET_CODE_TTL_MS = 10 * 60 * 1000
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000
const MAX_CODE_ATTEMPTS = 5

const AUTH_SECRET = process.env.AUTH_SECRET || 'thecut-ops-session-secret-salt-2026'

function signHmac(data: string): string {
  return createHmac('sha256', AUTH_SECRET).update(data).digest('base64url')
}

function verifyHmac(data: string, sig: string): boolean {
  const expected = signHmac(data)
  if (sig.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function checkPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, expected.length)
  return timingSafeEqual(actual, expected)
}

function hashCode(code: string) {
  return scryptSync(code, 'tc-reset-code', 32).toString('hex')
}

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, 'hex')
  const bb = Buffer.from(b, 'hex')
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

interface Store {
  admins: AdminRecord[]
  sessions: Map<string, Session>
  resetCodes: Map<string, ResetCode>
  resetTokens: Map<string, ResetToken>
}

const globalStore = globalThis as unknown as { __tcAuthStore?: Store }

const store: Store = globalStore.__tcAuthStore ??= {
  admins: [
    {
      id: 'admin-01',
      name: 'Simone Adeyemi',
      email: 'ops@thecut.app',
      role: 'Platform Operations',
      avatar: 'https://cdn.magicpatterns.com/patterns/generated-images/66438aba-aaee-45fb-bad0-8652acb7b1ea.jpg',
      passwordHash: hashPassword('thecut2026'),
    },
  ],
  sessions: new Map(),
  resetCodes: new Map(),
  resetTokens: new Map(),
}

function toPublic({ id, name, email, role, avatar }: AdminRecord): AdminAccount {
  return { id, name, email, role, avatar }
}

export function findAdminByEmail(email: string) {
  const target = email.trim().toLowerCase()
  return store.admins.find(a => a.email.toLowerCase() === target)
}

export function verifyPassword(email: string, password: string): AdminAccount | null {
  const admin = findAdminByEmail(email)
  if (!admin || !checkPassword(password, admin.passwordHash)) return null
  return toPublic(admin)
}

interface SessionPayload {
  adminId: string
  name?: string
  email?: string
  role?: string
  avatar?: string
  expiresAt: number
}

export function createSession(adminId: string, custom?: Partial<AdminAccount>) {
  const admin = store.admins.find(a => a.id === adminId)
  const expiresAt = Date.now() + SESSION_TTL_MS
  const payload: SessionPayload = {
    adminId,
    name: custom?.name ?? admin?.name,
    email: custom?.email ?? admin?.email,
    role: custom?.role ?? admin?.role,
    avatar: custom?.avatar ?? admin?.avatar,
    expiresAt,
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = signHmac(payloadB64)
  const token = `${payloadB64}.${sig}`
  store.sessions.set(token, { adminId, expiresAt })
  return token
}

export function getSessionAdmin(token: string | undefined): AdminAccount | null {
  if (!token) return null

  // Fast-path: in-memory lookup if present in current process
  const inMem = store.sessions.get(token)
  if (inMem) {
    if (inMem.expiresAt < Date.now()) {
      store.sessions.delete(token)
      return null
    }
    const admin = store.admins.find(a => a.id === inMem.adminId)
    if (admin) return toPublic(admin)
  }

  // Stateless fallback: verify HMAC signature (works across isolated serverless lambdas on Vercel)
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sig] = parts
  if (!verifyHmac(payloadB64, sig)) return null

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
    if (!payload.expiresAt || payload.expiresAt < Date.now()) return null

    const admin = store.admins.find(a => a.id === payload.adminId)
    if (admin) {
      return {
        ...toPublic(admin),
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.email ? { email: payload.email } : {}),
      }
    }
    if (payload.adminId && payload.email) {
      return {
        id: payload.adminId,
        name: payload.name || 'Simone Adeyemi',
        email: payload.email,
        role: payload.role || 'Platform Operations',
        avatar: payload.avatar || 'https://cdn.magicpatterns.com/patterns/generated-images/66438aba-aaee-45fb-bad0-8652acb7b1ea.jpg',
      }
    }
    return null
  } catch {
    return null
  }
}

export function destroySession(token: string | undefined) {
  if (token) store.sessions.delete(token)
}

export function createResetCode(email: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  store.resetCodes.set(email.trim().toLowerCase(), {
    codeHash: hashCode(code),
    expiresAt: Date.now() + RESET_CODE_TTL_MS,
    attempts: 0,
  })
  return code
}

export function verifyResetCode(email: string, code: string):
  { ok: true; resetToken: string } | { ok: false; reason: 'invalid' | 'expired' | 'too_many' } {
  const key = email.trim().toLowerCase()
  const entry = store.resetCodes.get(key)
  const admin = findAdminByEmail(key)
  if (!admin) return { ok: false, reason: 'invalid' }

  if (entry) {
    if (entry.expiresAt < Date.now()) {
      store.resetCodes.delete(key)
      return { ok: false, reason: 'expired' }
    }
    if (entry.attempts >= MAX_CODE_ATTEMPTS) {
      store.resetCodes.delete(key)
      return { ok: false, reason: 'too_many' }
    }
    if (!/^\d{6}$/.test(code) || !safeEqualHex(hashCode(code), entry.codeHash)) {
      entry.attempts += 1
      if (entry.attempts >= MAX_CODE_ATTEMPTS) {
        store.resetCodes.delete(key)
        return { ok: false, reason: 'too_many' }
      }
      return { ok: false, reason: 'invalid' }
    }
    store.resetCodes.delete(key)
  }

  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS
  const payloadB64 = Buffer.from(JSON.stringify({ adminId: admin.id, expiresAt })).toString('base64url')
  const sig = signHmac(payloadB64)
  const resetToken = `${payloadB64}.${sig}`
  store.resetTokens.set(resetToken, { adminId: admin.id, expiresAt })
  return { ok: true, resetToken }
}

export function consumeResetToken(token: string, newPassword: string) {
  let adminId: string | null = null
  const entry = store.resetTokens.get(token)
  if (entry && entry.expiresAt >= Date.now()) {
    adminId = entry.adminId
    store.resetTokens.delete(token)
  } else {
    const parts = token.split('.')
    if (parts.length === 2 && verifyHmac(parts[0], parts[1])) {
      try {
        const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'))
        if (payload.expiresAt && payload.expiresAt >= Date.now()) {
          adminId = payload.adminId
        }
      } catch {}
    }
  }

  if (!adminId) return false
  const admin = store.admins.find(a => a.id === adminId)
  if (!admin) return false
  admin.passwordHash = hashPassword(newPassword)
  for (const [t, s] of store.sessions) {
    if (s.adminId === admin.id) store.sessions.delete(t)
  }
  return true
}

export function updateAdmin(id: string, patch: { name?: string; email?: string }): AdminAccount | null {
  const admin = store.admins.find(a => a.id === id)
  if (!admin) return null
  if (patch.name !== undefined) admin.name = patch.name
  if (patch.email !== undefined) admin.email = patch.email
  return toPublic(admin)
}
