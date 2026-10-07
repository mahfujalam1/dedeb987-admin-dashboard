'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { StoreIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { DetailRow, Panel } from '@/components/admin/panel'
import { vendorStatusTone } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import { currency } from '@/lib/utils'

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { vendors, suspendVendor, verifyVendor } = useAdmin()
  const confirm = useConfirm()
  const vendor = vendors.find(v => v.id === id)

  if (!vendor) {
    return (
      <EmptyState
        icon={<StoreIcon className="h-5 w-5" />}
        title="Vendor not found"
        body="This vendor doesn't exist or has been removed."
        action={<Link href="/admin/vendors" className="text-[13px] font-semibold text-ink hover:text-ink-muted">← Back to vendors</Link>}
      />
    )
  }

  const v = vendor
  const verification = v.verification.charAt(0).toUpperCase() + v.verification.slice(1)

  async function suspend() {
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

  async function reject() {
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

  return (
    <>
      <Link href="/admin/vendors" className="text-[12.5px] text-ink-muted hover:text-ink">← Back to vendors</Link>
      <div className="mt-3">
        <PageHeader
          eyebrow="Vendor profile"
          title={vendor.name}
          actions={<Tag tone={vendorStatusTone[vendor.status]} className="bg-transparent">{vendor.status}</Tag>}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Panel title="Business metrics">
          <div className="space-y-0.5">
            <DetailRow label="GMV">{currency(vendor.gmv)}</DetailRow>
            <DetailRow label="Active products">{vendor.activeProducts}</DetailRow>
            <DetailRow label="Open orders">{vendor.openOrders}</DetailRow>
            <DetailRow label="Plan">{vendor.plan}</DetailRow>
            <DetailRow label="Joined">{vendor.joinedAt}</DetailRow>
            <DetailRow label="Verification">{verification}</DetailRow>
          </div>
        </Panel>

        <Panel title="Store profile">
          <div className="flex items-center gap-4">
            <img src={vendor.logo} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-inset" />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{vendor.name}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">{vendor.plan} plan</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Admin actions" className="mt-7">
        <div className="flex flex-wrap gap-3">
          {vendor.status === 'active' && (
            <Button variant="danger" onClick={suspend}>Suspend vendor</Button>
          )}
          {vendor.status === 'suspended' && (
            <Button onClick={() => { suspendVendor(vendor.id, false); toast.success(`${vendor.name} reinstated`) }}>Reinstate vendor</Button>
          )}
          {vendor.status === 'pending' && (
            <>
              <Button onClick={() => { verifyVendor(vendor.id, 'approved'); toast.success(`${vendor.name} approved`) }}>Approve vendor</Button>
              {vendor.verification !== 'rejected' && (
                <Button variant="outline" onClick={reject}>Reject application</Button>
              )}
            </>
          )}
          <Button variant="outline" onClick={() => toast.success(`Message sent to ${vendor.name}`)}>Send message</Button>
        </div>
      </Panel>
    </>
  )
}
