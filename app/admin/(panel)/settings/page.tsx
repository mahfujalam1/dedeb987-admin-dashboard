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
import { cn } from '@/lib/utils'

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
  const { account, updateAdminAccount, signOut, platformSettings, updatePlatformSettings } = useAdmin()
  const [name, setName] = useState(account.name)
  const [email, setEmail] = useState(account.email)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const dirty = name.trim() !== account.name || email.trim() !== account.email

  // Per-Transaction Split Settings State
  const [feeType, setFeeType] = useState<'percentage' | 'fixed' | 'both'>(platformSettings.feeType || 'percentage')
  const [commissionRate, setCommissionRate] = useState<number>(platformSettings.commissionRate)
  const [flatFee, setFlatFee] = useState<number>(platformSettings.flatFee)
  const [savingFees, setSavingFees] = useState(false)

  const feeDirty =
    feeType !== (platformSettings.feeType || 'percentage') ||
    commissionRate !== platformSettings.commissionRate ||
    flatFee !== platformSettings.flatFee

  // Live simulation for a $200 sample customer purchase
  const sampleSale = 200
  let sampleAdminCut = 0
  if (feeType === 'percentage') {
    sampleAdminCut = (sampleSale * (Number(commissionRate) || 0)) / 100
  } else if (feeType === 'fixed') {
    sampleAdminCut = Number(flatFee) || 0
  } else {
    sampleAdminCut = (sampleSale * (Number(commissionRate) || 0)) / 100 + (Number(flatFee) || 0)
  }
  sampleAdminCut = Math.min(sampleSale, Math.max(0, sampleAdminCut))
  const sampleVendorCut = Math.max(0, sampleSale - sampleAdminCut)

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

  function saveCommissionSettings(e: React.FormEvent) {
    e.preventDefault()
    setSavingFees(true)
    setTimeout(() => {
      updatePlatformSettings({
        feeType,
        commissionRate: feeType === 'fixed' ? 0 : Number(commissionRate) || 0,
        flatFee: feeType === 'percentage' ? 0 : Number(flatFee) || 0,
      })
      setSavingFees(false)
    }, 200)
  }

  return (
    <>
      <PageHeader eyebrow="Account" title="Admin settings" description="Manage your admin account, per-transaction fee split, and platform configuration." />

      {/* PER-TRANSACTION SPLIT SETTINGS */}
      <Panel
        title="Per-Transaction Payment Split"
        description="When a customer orders a vendor's product, payments are automatically split at checkout: the admin fee is routed to your account, and the full remaining balance goes directly to the vendor."
        className="mt-7"
      >
        <form onSubmit={saveCommissionSettings} className="space-y-6">
          {/* Split Mode Selector */}
          <div>
            <label className={labelCls}>How would you like to charge per transaction?</label>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  id: 'percentage',
                  title: 'Percentage Cut (%)',
                  desc: 'e.g. Admin keeps 10% of each sale, vendor gets 90%',
                },
                {
                  id: 'fixed',
                  title: 'Fixed Amount ($)',
                  desc: 'e.g. Admin keeps $5.00 flat per transaction, vendor gets rest',
                },
                {
                  id: 'both',
                  title: 'Percentage + Fixed ($ + %)',
                  desc: 'e.g. Admin keeps 8% + $1.00 per transaction',
                },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFeeType(opt.id as any)}
                  className={cn(
                    'flex flex-col text-left rounded-xl border p-3.5 transition-all',
                    feeType === opt.id
                      ? 'border-ink bg-ink/5 shadow-xs ring-1 ring-ink'
                      : 'border-line bg-white hover:border-line-strong hover:bg-ivory/40',
                  )}
                >
                  <span className="text-[13px] font-bold text-ink">{opt.title}</span>
                  <span className="mt-1 text-[11.5px] text-ink-muted leading-relaxed">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {(feeType === 'percentage' || feeType === 'both') && (
              <div>
                <label htmlFor="commission-rate" className={labelCls}>
                  Admin Percentage Cut (%)
                </label>
                <div className="relative mt-1">
                  <input
                    id="commission-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionRate}
                    onChange={e => setCommissionRate(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                    placeholder="10"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] font-semibold text-ink-muted">
                    %
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] text-ink-muted">
                  Percentage of the customer's total order kept by the admin.
                </p>
              </div>
            )}

            {(feeType === 'fixed' || feeType === 'both') && (
              <div>
                <label htmlFor="flat-fee" className={labelCls}>
                  Admin Fixed Amount ($ per transaction)
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[13px] font-semibold text-ink-muted">
                    $
                  </span>
                  <input
                    id="flat-fee"
                    type="number"
                    min="0"
                    step="0.50"
                    value={flatFee}
                    onChange={e => setFlatFee(parseFloat(e.target.value) || 0)}
                    className={inputCls}
                    style={{ paddingLeft: '28px' }}
                    placeholder="2.00"
                  />
                </div>
                <p className="mt-1.5 text-[12px] text-ink-muted">
                  Fixed dollar amount deducted on every order for the admin.
                </p>
              </div>
            )}
          </div>

          {/* REAL-TIME INSTANT PAYMENT SPLIT SIMULATION */}
          <div className="rounded-2xl border border-line bg-ivory/60 p-4.5 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">
                Instant Checkout Split Example ($200.00 Order)
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                Split Simulation
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-white p-3.5">
                <p className="text-[11.5px] font-medium text-ink-muted">Customer Order Total</p>
                <p className="mt-1 text-[18px] font-bold text-ink">${sampleSale.toFixed(2)}</p>
                <p className="text-[11px] text-ink-muted mt-0.5">Paid by customer at checkout</p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold text-emerald-800">Admin Cut (You Get)</p>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                    Platform Fee
                  </span>
                </div>
                <p className="mt-1 text-[18px] font-bold text-emerald-700">
                  +${sampleAdminCut.toFixed(2)}
                </p>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">
                  {feeType === 'percentage' && `${commissionRate}% of $${sampleSale}`}
                  {feeType === 'fixed' && `$${flatFee.toFixed(2)} fixed fee`}
                  {feeType === 'both' && `${commissionRate}% + $${flatFee.toFixed(2)} fixed`}
                </p>
              </div>

              <div className="rounded-xl border border-accent-200 bg-accent-50/40 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold text-accent-900">Vendor Cut (Vendor Gets)</p>
                  <span className="text-[10px] font-bold uppercase text-accent-700 bg-accent-100 rounded px-1.5 py-0.5">
                    Direct Payout
                  </span>
                </div>
                <p className="mt-1 text-[18px] font-bold text-ink">
                  ${sampleVendorCut.toFixed(2)}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Remaining amount routed to vendor
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[12.5px] text-ink-muted">
              Applies instantly to every customer order placed across all boutique vendors.
            </p>
            <Button type="submit" loading={savingFees} disabled={!feeDirty}>
              Save Transaction Split
            </Button>
          </div>
        </form>
      </Panel>

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
