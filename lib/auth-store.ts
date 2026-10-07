// In-memory auth store — a stand-in for a real database + email provider.
// State lives on a globalThis singleton so it survives dev hot reloads.
// Everything resets when the server process restarts.
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
import type { AdminAccount } from '@/lib/types'

interface AdminRecord extends AdminAccount { passwordHash: string }
interface Session { adminId: string; expiresAt: number }
interface ResetCode { codeHash: string; expiresAt: number; attempts: number }
interface ResetToken { adminId: string; expiresAt: number }

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const RESET_CODE_TTL_MS = 10 * 60 * 1000
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000
const MAX_CODE_ATTEMPTS = 5

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

export function createSession(adminId: string) {
  const token = randomBytes(32).toString('hex')
  store.sessions.set(token, { adminId, expiresAt: Date.now() + SESSION_TTL_MS })
  return token
}

export function getSessionAdmin(token: string | undefined): AdminAccount | null {
  if (!token) return null
  const session = store.sessions.get(token)
  if (!session) return null
  if (session.expiresAt < Date.now()) {
    store.sessions.delete(token)
    return null
  }
  const admin = store.admins.find(a => a.id === session.adminId)
  return admin ? toPublic(admin) : null
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
  if (!entry || !admin) return { ok: false, reason: 'invalid' }
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
  const resetToken = randomBytes(32).toString('hex')
  store.resetTokens.set(resetToken, { adminId: admin.id, expiresAt: Date.now() + RESET_TOKEN_TTL_MS })
  return { ok: true, resetToken }
}

export function consumeResetToken(token: string, newPassword: string) {
  const entry = store.resetTokens.get(token)
  store.resetTokens.delete(token)
  if (!entry || entry.expiresAt < Date.now()) return false
  const admin = store.admins.find(a => a.id === entry.adminId)
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
