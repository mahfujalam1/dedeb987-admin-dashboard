'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon, CopyIcon, ShieldCheckIcon, ShoppingBagIcon, SparklesIcon, StarIcon, StoreIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import type { AdminVendor } from '@/lib/data/admin-data'
import { wigs } from '@/lib/data/wigs'
import { currency } from '@/lib/utils'

interface VendorStorefrontModalProps {
  vendor: AdminVendor
  isOpen: boolean
  onClose: () => void
}

export function VendorStorefrontModal({ vendor, isOpen, onClose }: VendorStorefrontModalProps) {
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const vendorProducts = wigs.filter(w => w.vendorId === vendor.id)
  const storeUrl = `https://thecut.app/stores/${vendor.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl)
    setCopied(true)
    toast.success('Storefront URL copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-2xl animate-scale-in"
      >
        {/* Top bar with store URL */}
        <div className="flex items-center justify-between border-b border-line bg-ivory/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-2xs">
              <StoreIcon className="h-4 w-4 text-ink-soft" />
            </span>
            <div className="flex items-center gap-2 text-[12.5px] text-ink-muted">
              <span>Public Storefront Preview:</span>
              <code className="rounded bg-white px-2 py-0.5 font-mono text-[11.5px] font-medium text-ink shadow-2xs">
                {storeUrl}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[12px] font-medium text-ink transition-colors hover:bg-ivory-deep"
            >
              {copied ? <CheckIcon className="h-3.5 w-3.5 text-success-500" /> : <CopyIcon className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy link'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto">
          {/* Storefront Hero / Cover Header */}
          <div className="relative bg-gradient-to-r from-stone-900 via-neutral-900 to-stone-800 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="h-20 w-20 shrink-0 rounded-2xl border-2 border-white/20 object-cover shadow-lg"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-[24px] font-medium tracking-tight text-white">
                      {vendor.name}
                    </h2>
                    {vendor.verification === 'approved' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-500/20 px-2 py-0.5 text-[11px] font-medium text-success-300">
                        <ShieldCheckIcon className="h-3.5 w-3.5" />
                        Verified Boutique
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px] text-white/70">
                    <span className="flex items-center gap-1 text-amber-300 font-medium">
                      <StarIcon className="h-3.5 w-3.5 fill-current" />
                      4.9 (128 reviews)
                    </span>
                    <span>·</span>
                    <span>Member since {vendor.joinedAt}</span>
                    <span>·</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
                      {vendor.plan} Boutique
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Store nav tabs */}
            <div className="mt-6 flex gap-4 border-t border-white/10 pt-4 text-[13px]">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`pb-1 font-medium transition-colors ${activeTab === 'products' ? 'border-b-2 border-white text-white' : 'text-white/60 hover:text-white'}`}
              >
                Products ({vendorProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`pb-1 font-medium transition-colors ${activeTab === 'about' ? 'border-b-2 border-white text-white' : 'text-white/60 hover:text-white'}`}
              >
                About Store
              </button>
            </div>
          </div>

          {/* Store Body */}
          <div className="p-6 sm:p-8">
            {activeTab === 'products' ? (
              <>
                {/* Wig Dates AI Try-On Feature Banner */}
                <div className="mb-6 rounded-2xl border border-[#C4A887]/50 bg-gradient-to-r from-[#FBF8F5] via-[#F6EFEA] to-[#F1E6DE] p-4 sm:p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0C090E] text-white shadow-xs">
                        <SparklesIcon className="h-5 w-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#0C090E] px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
                            WIG DATES™
                          </span>
                          <span className="text-[13.5px] font-semibold text-ink">
                            AI Virtual Try-On Enabled
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                          Shoppers can test all wigs from <strong className="text-ink">{vendor.name}</strong> on their own photo before purchasing using AI Wig Matches.
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="rounded-xl border border-line bg-white/90 px-3 py-1.5 text-[11.5px] font-semibold text-ink shadow-2xs">
                        ✨ 3 Free Daily Dates
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-display text-[18px] font-medium text-ink">
                    All Collection Pieces ({vendorProducts.length})
                  </h3>
                  <span className="text-[12.5px] text-ink-muted">
                    Showing official items available on The Cut
                  </span>
                </div>

                {vendorProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-12 text-center">
                    <ShoppingBagIcon className="h-10 w-10 text-ink-faint" />
                    <p className="mt-2 text-[14px] font-medium text-ink">No products currently listed</p>
                    <p className="mt-1 text-[12.5px] text-ink-muted">This vendor has not published any wig listings yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                    {vendorProducts.map(product => (
                      <div
                        key={product.id}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xs transition-all hover:shadow-card"
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-ivory-deep">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {product.salePrice && (
                            <span className="absolute top-2.5 left-2.5 rounded-full bg-danger-500 px-2 py-0.5 text-[10.5px] font-semibold text-white shadow-sm">
                              Sale
                            </span>
                          )}
                          <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-ink shadow-xs">
                            ✨ Try-On Ready
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <p className="text-[11.5px] uppercase tracking-wider text-ink-faint">{product.brand}</p>
                            <h4 className="mt-0.5 font-display text-[15px] font-medium text-ink line-clamp-1">{product.name}</h4>
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5">
                            <div>
                              {product.salePrice ? (
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-semibold text-ink">{currency(product.salePrice)}</span>
                                  <span className="text-[12px] text-ink-faint line-through">{currency(product.price)}</span>
                                </div>
                              ) : (
                                <span className="font-semibold text-ink">{currency(product.price)}</span>
                              )}
                            </div>
                            <span className="rounded bg-ivory px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                              {product.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="max-w-2xl space-y-4 text-[13.5px] leading-relaxed text-ink-soft">
                <div className="rounded-2xl border border-line bg-ivory/40 p-5">
                  <h4 className="font-display text-[16px] font-medium text-ink">Boutique Biography</h4>
                  <p className="mt-2 text-ink-muted">
                    {vendor.name} is a premier luxury lace atelier and wig creator verified on The Cut. Specializing in ethically sourced, 100% human hair wigs, HD invisible closures, and custom machine-made units.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-line p-4">
                    <p className="text-[11.5px] text-ink-faint uppercase font-medium">Fulfillment Rating</p>
                    <p className="mt-1 text-[18px] font-semibold text-ink">99.4% On-time</p>
                  </div>
                  <div className="rounded-xl border border-line p-4">
                    <p className="text-[11.5px] text-ink-faint uppercase font-medium">Return Rate</p>
                    <p className="mt-1 text-[18px] font-semibold text-ink">1.2% (Low)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-line bg-ivory/40 px-6 py-4">
          <p className="text-[12px] text-ink-muted">
            All listings sync in real-time with customer mobile search.
          </p>
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
