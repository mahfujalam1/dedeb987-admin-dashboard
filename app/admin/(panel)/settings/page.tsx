'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { Panel } from '@/components/admin/panel'
import { Button } from '@/components/ui/button'
import { inputCls, labelCls } from '@/components/ui/field'
import { useAdmin } from '@/context/admin-context'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LEGAL = [
  {
    href: '/admin/settings/terms',
    label: 'Terms of service',
    description: 'Boutique vendor agreements, order fulfillment, and dispute policies.',
  },
  {
    href: '/admin/settings/privacy',
    label: 'Privacy policy',
    description: 'Data collection disclosures, payment security, and customer privacy rights.',
  },
]

export default function SettingsPage() {
  const { account, updateAdminAccount, signOut } = useAdmin()
  const [name, setName] = useState(account.name)
  const [email, setEmail] = useState(account.email)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const dirty = name.trim() !== account.name || email.trim() !== account.email

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Display name is required.')
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.')
    setSaving(true)
    try {
      await updateAdminAccount({ name: name.trim(), email: email.trim() })
      toast.success('Profile updated')
    } catch {
      setError('Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="Admin settings" description="Manage your admin account and platform configuration." />

      <Panel title="Admin profile" className="mt-7">
        <form onSubmit={save} className="space-y-5">
          <div>
            <label htmlFor="name" className={labelCls}>Display name</label>
            <input id="name" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          </div>
          {error && <p className="text-[12.5px] text-danger-500">{error}</p>}
          <Button type="submit" loading={saving} disabled={!dirty}>Save changes</Button>
        </form>
      </Panel>

      <Panel title="Legal documents" className="mt-7">
        <div className="space-y-3">
          {LEGAL.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-center justify-between rounded-2xl border border-line bg-white p-4 transition-all duration-150 hover:border-ink hover:shadow-xs"
            >
              <div>
                <p className="text-[14px] font-semibold text-ink group-hover:text-accent-600">
                  {l.label}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {l.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-ivory px-2.5 py-1 text-[11.5px] font-medium text-ink-soft group-hover:bg-ink group-hover:text-white transition-colors">
                  Edit in WYSIWYG
                </span>
                <ChevronRightIcon className="h-4 w-4 text-ink-faint group-hover:text-ink transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel title="Danger zone" className="mt-7">
        <div className="rounded-xl border border-danger-500/20 bg-danger-50 p-4">
          <p className="text-[13.5px] font-medium text-ink">Sign out</p>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">End your current admin session.</p>
          <Button size="sm" variant="danger" className="mt-3" onClick={signOut}>Sign out</Button>
        </div>
      </Panel>
    </>
  )
}
