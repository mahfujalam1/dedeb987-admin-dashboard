'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ExternalLinkIcon, PackageIcon, SearchIcon, StoreIcon, Trash2Icon, MessageSquareIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { DetailRow, Panel } from '@/components/admin/panel'
import { vendorStatusTone } from '@/components/admin/status-tag'
import { VendorStorefrontModal } from '@/components/admin/vendor-storefront-modal'
import { Button } from '@/components/ui/button'
import { searchCls } from '@/components/ui/field'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import { wigs } from '@/lib/data/wigs'
import { currency } from '@/lib/utils'

export default function VendorDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { vendors, suspendVendor, verifyVendor, deleteVendor, platformSettings } = useAdmin()
  const confirm = useConfirm()
  const [storeModalOpen, setStoreModalOpen] = useState(false)
  const [searchProduct, setSearchProduct] = useState('')

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
  const storeUrl = `https://thecut.app/stores/${v.id}`
  const vendorProducts = wigs.filter(w => w.vendorId === v.id)
  const filteredProducts = vendorProducts.filter(p =>
    !searchProduct || p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.brand.toLowerCase().includes(searchProduct.toLowerCase())
  )

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

  async function handleDeleteVendor() {
    const ok = await confirm({
      title: `Permanently delete ${v.name}?`,
      body: 'This will remove the vendor boutique and its catalog from the platform. This action cannot be undone.',
      confirmLabel: 'Delete vendor',
      tone: 'danger',
    })
    if (!ok) return
    deleteVendor(v.id)
    router.push('/admin/vendors')
  }

  return (
    <>
      <Link href="/admin/vendors" className="text-[12.5px] text-ink-muted hover:text-ink">← Back to vendors</Link>
      <div className="mt-3">
        <PageHeader
          eyebrow="Vendor profile"
          title={vendor.name}
          actions={
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                icon={<ExternalLinkIcon className="h-4 w-4" />}
                onClick={() => setStoreModalOpen(true)}
              >
                View Storefront
              </Button>
              <Tag tone={vendorStatusTone[vendor.status]} className="bg-transparent">{vendor.status}</Tag>
            </div>
          }
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Panel title="Business metrics">
          <div className="space-y-0.5">
            <DetailRow label="Total Sales">{currency(vendor.gmv)}</DetailRow>
            <DetailRow label="Active products">
              <a href="#products-catalog" className="font-semibold text-accent-600 hover:underline">
                {vendor.activeProducts} items listed
              </a>
            </DetailRow>
            <DetailRow label="Open orders">{vendor.openOrders}</DetailRow>
            <DetailRow label="Plan">{vendor.plan}</DetailRow>
            <DetailRow label="Transaction Split">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-accent-700">
                  {platformSettings.feeType === 'percentage'
                    ? `${platformSettings.commissionRate}% Admin Cut`
                    : platformSettings.feeType === 'fixed'
                    ? `$${platformSettings.flatFee.toFixed(2)} Admin Flat Fee`
                    : `${platformSettings.commissionRate}% + $${platformSettings.flatFee.toFixed(2)}`}
                </span>
                <Link
                  href="/admin/settings"
                  className="text-[11px] font-medium text-ink-muted hover:text-ink underline ml-1"
                >
                  Edit in Settings
                </Link>
              </div>
            </DetailRow>
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
          <div className="mt-4 border-t border-line pt-3 space-y-0.5">
            <DetailRow label="Storefront link">
              <button
                type="button"
                onClick={() => setStoreModalOpen(true)}
                className="inline-flex items-center gap-1.5 font-medium text-accent-600 hover:text-accent-700 hover:underline"
              >
                <span>thecut.app/stores/{vendor.id}</span>
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </button>
            </DetailRow>
            <DetailRow label="Store status">
              <span className="capitalize">{vendor.status}</span>
            </DetailRow>
          </div>
        </Panel>
      </div>

      {/* ALL PRODUCTS SECTION */}
      <div id="products-catalog" className="mt-8">
        <Panel
          title={`Products Catalog (${vendorProducts.length})`}
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<ExternalLinkIcon className="h-3.5 w-3.5" />}
              onClick={() => setStoreModalOpen(true)}
            >
              Preview in store
            </Button>
          }
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-ink-muted">
              All wigs and hair units actively registered to this vendor's catalog.
            </p>
            {vendorProducts.length > 0 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                  className="h-8 rounded-lg border border-line bg-white px-3 text-[12px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {vendorProducts.length === 0 ? (
            <div className="py-8 text-center">
              <PackageIcon className="mx-auto h-8 w-8 text-ink-faint" />
              <p className="mt-2 text-[14px] font-medium text-ink">No products found</p>
              <p className="text-[12.5px] text-ink-muted">This vendor hasn’t listed any products yet.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-6 text-center text-[13px] text-ink-muted">
              No products match "{searchProduct}".
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xs transition-all hover:shadow-card"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-ivory-deep">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {p.salePrice && (
                      <span className="absolute top-2 left-2 rounded-full bg-danger-500 px-2 py-0.5 text-[10.5px] font-semibold text-white shadow-xs">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">{p.brand}</p>
                      <h4 className="mt-0.5 font-display text-[14.5px] font-medium text-ink line-clamp-1">{p.name}</h4>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2 text-[12.5px]">
                      <div>
                        {p.salePrice ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-ink">{currency(p.salePrice)}</span>
                            <span className="text-[11px] text-ink-faint line-through">{currency(p.price)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-ink">{currency(p.price)}</span>
                        )}
                      </div>
                      <span className="rounded bg-ivory px-1.5 py-0.5 font-mono text-[10.5px] text-ink-muted">
                        {p.id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <Button variant="outline" onClick={() => setStoreModalOpen(true)}>Open Storefront</Button>
          <Button
            variant="outline"
            icon={<MessageSquareIcon className="h-4 w-4" />}
            onClick={() => router.push(`/admin/messages?vendorId=${vendor.id}`)}
          >
            Send message
          </Button>
          <Button variant="danger" icon={<Trash2Icon className="h-4 w-4" />} onClick={handleDeleteVendor}>
            Delete vendor
          </Button>
        </div>
      </Panel>

      {/* Storefront Modal */}
      <VendorStorefrontModal
        vendor={vendor}
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
      />
    </>
  )
}
