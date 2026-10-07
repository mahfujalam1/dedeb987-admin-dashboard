'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheckIcon, StoreIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { vendorStatusTone } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { searchCls } from '@/components/ui/field'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import type { AdminVendor } from '@/lib/data/admin-data'
import { cn, currency } from '@/lib/utils'

const detailBtnCls = 'inline-flex h-8 items-center rounded-lg border border-line-strong bg-white px-3 text-[12.5px] font-semibold text-ink transition-all duration-150 hover:border-ink hover:bg-ivory-deep'

export default function VendorsPage() {
  const { vendors, suspendVendor, verifyVendor } = useAdmin()
  const confirm = useConfirm()

  async function suspend(v: AdminVendor) {
    const ok = await confirm({
      title: `Suspend ${v.name}?`,
      body: 'Their listings will be hidden from shoppers and new orders paused until you reinstate them.',
      confirmLabel: 'Suspend vendor',
      tone: 'danger',
    })
    if (!ok) return
    suspendVendor(v.id)
    toast.success(`${v.name} suspended`, { action: { label: 'Undo', onClick: () => suspendVendor(v.id, false) } })
  }

  async function reject(v: AdminVendor) {
    const ok = await confirm({
      title: `Reject ${v.name}?`,
      body: 'The vendor will be told their application wasn’t approved. You can still approve them later.',
      confirmLabel: 'Reject application',
      tone: 'danger',
    })
    if (!ok) return
    verifyVendor(v.id, 'rejected')
    toast(`${v.name} application rejected`)
  }
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const list = vendors.filter(v => !q || v.name.toLowerCase().includes(q))

  return (
    <>
      <PageHeader eyebrow="Marketplace" title="Vendors" description="Review vendor applications and manage account status." />

      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search vendors..." className={cn(searchCls, 'mt-7 max-w-[384px]')} />

      <div className="mt-7 space-y-4">
        {list.length === 0 && (
          <div className="rounded-2xl border border-line bg-white">
            <EmptyState icon={<StoreIcon className="h-5 w-5" />} title="No vendors found" body="Try a different search." />
          </div>
        )}
        {list.map(v => (
          <div key={v.id} className="rounded-2xl border border-line bg-white p-5 transition-shadow duration-200 hover:shadow-lift">
            <div className="flex items-start gap-4">
              <img src={v.logo} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-inset" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[15.5px] font-medium text-ink">{v.name}</p>
                  {v.verification === 'approved' && <ShieldCheckIcon className="h-4 w-4 shrink-0 text-success-500" aria-label="Verified" />}
                </div>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">{v.plan} plan · Joined {v.joinedAt}</p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-muted">
                  <span>GMV: <span className="font-medium text-ink">{currency(v.gmv)}</span></span>
                  <span>Products: <span className="font-medium text-ink">{v.activeProducts}</span></span>
                  <span>Open orders: <span className="font-medium text-ink">{v.openOrders}</span></span>
                </div>
              </div>
              <Tag tone={vendorStatusTone[v.status]} className="shrink-0">{v.status}</Tag>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/admin/vendors/${v.id}`} className={detailBtnCls}>View details</Link>
              {v.status === 'active' && (
                <Button size="sm" variant="danger" onClick={() => suspend(v)}>Suspend</Button>
              )}
              {v.status === 'suspended' && (
                <Button size="sm" onClick={() => { suspendVendor(v.id, false); toast.success(`${v.name} reinstated`) }}>Reinstate</Button>
              )}
              {v.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => { verifyVendor(v.id, 'approved'); toast.success(`${v.name} approved`) }}>Approve</Button>
                  {v.verification !== 'rejected' && (
                    <Button size="sm" variant="outline" onClick={() => reject(v)}>Reject</Button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
