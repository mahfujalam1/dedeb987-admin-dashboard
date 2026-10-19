'use client'
import { useState, useMemo } from 'react'
import {
  SparklesIcon,
  PlusIcon,
  StarIcon,
  CoinsIcon,
  DollarSignIcon,
  TrendingUpIcon,
  PencilIcon,
  Trash2Icon,
  ArchiveIcon,
  CheckCircle2Icon,
  CopyIcon,
  SmartphoneIcon,
  CreditCardIcon,
  SearchIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatCard } from '@/components/admin/stat-card'
import { Panel } from '@/components/admin/panel'
import { Button } from '@/components/ui/button'
import { inputCls } from '@/components/ui/field'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import type { AiCreditPackage } from '@/lib/data/admin-data'
import { cn, currency } from '@/lib/utils'
import { PackageModal, type PackageDraft } from '@/components/admin/package-modal'

export default function AiPackagesPage() {
  const { aiPackages, addAiPackage, updateAiPackage, deleteAiPackage, toggleAiPackageStatus } = useAdmin()
  const confirm = useConfirm()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<AiCreditPackage | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [search, setSearch] = useState('')

  // Aggregate Metrics
  const activeCount = aiPackages.filter(p => p.status === 'active').length
  const totalCreditsSold = aiPackages.reduce((sum, p) => sum + p.credits * (p.salesCount || 0), 0)
  const totalRevenue = aiPackages.reduce((sum, p) => sum + (p.revenue || 0), 0)
  const topPackage = [...aiPackages].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))[0]

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return aiPackages.filter(p => {
      if (filter === 'active' && p.status !== 'active') return false
      if (filter === 'archived' && p.status !== 'archived') return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          (p.badge && p.badge.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [aiPackages, filter, search])

  const handleOpenCreate = () => {
    setEditingPackage(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (pkg: AiCreditPackage) => {
    setEditingPackage(pkg)
    setModalOpen(true)
  }

  const handleDuplicate = (pkg: AiCreditPackage) => {
    addAiPackage({
      title: `${pkg.title} (Copy)`,
      credits: pkg.credits,
      price: pkg.price,
      perCreditLabel: pkg.perCreditLabel,
      badge: pkg.badge,
      isPopular: false,
      description: pkg.description,
      status: 'active',
      salesCount: 0,
      revenue: 0,
      updatedAt: 'Just now',
    })
  }

  const handleDelete = async (pkg: AiCreditPackage) => {
    const ok = await confirm({
      title: `Delete package "${pkg.title}"?`,
      body: 'This will remove the package from the mobile app. Users who already purchased credits will keep them.',
      confirmLabel: 'Delete package',
      tone: 'danger',
    })
    if (ok) {
      deleteAiPackage(pkg.id)
    }
  }

  const handleSaveDraft = (draft: PackageDraft) => {
    if (draft.id) {
      updateAiPackage(draft.id, {
        title: draft.title,
        credits: draft.credits,
        price: draft.price,
        perCreditLabel: draft.perCreditLabel,
        badge: draft.badge || undefined,
        isPopular: draft.isPopular,
        description: draft.description || undefined,
        status: draft.status,
      })
    } else {
      addAiPackage({
        title: draft.title,
        credits: draft.credits,
        price: draft.price,
        perCreditLabel: draft.perCreditLabel,
        badge: draft.badge || undefined,
        isPopular: draft.isPopular,
        description: draft.description || undefined,
        status: draft.status,
        salesCount: 0,
        revenue: 0,
        updatedAt: 'Just now',
      })
    }
    setModalOpen(false)
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">
      <PageHeader
        eyebrow="Monetization"
        title="AI Credit Packages"
        description="Manage top-up credit packages for the mobile app's AI Virtual Try-On and Wig Matchmaker features."
        actions={
          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 h-10 px-4 text-[13px] font-semibold"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create AI Package</span>
          </Button>
        }
      />

      {/* Top 4 Stat Cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Packages"
          value={`${activeCount} / ${aiPackages.length}`}
          hint="Live in mobile in-app shop"
        />
        <StatCard
          label="Credits Sold"
          value={totalCreditsSold.toLocaleString()}
          hint="AI photo generations funded"
        />
        <StatCard
          label="AI Credit Revenue"
          value={currency(totalRevenue)}
          hint="Direct in-app card payments"
          tone="success"
        />
        <StatCard
          label="Top Performing Tier"
          value={topPackage ? topPackage.title : 'None'}
          hint={topPackage ? `${topPackage.salesCount} purchases (${currency(topPackage.revenue)})` : 'No sales yet'}
          tone="violet"
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-full border border-line bg-white p-1 text-[12.5px] font-semibold w-fit">
          {(['all', 'active', 'archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'rounded-full px-4 py-1.5 capitalize transition-colors',
                filter === tab ? 'bg-ink text-white shadow-xs' : 'text-ink-muted hover:text-ink',
              )}
            >
              {tab === 'all' ? `All (${aiPackages.length})` : tab === 'active' ? `Active (${activeCount})` : `Archived (${aiPackages.length - activeCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search packages or badges..."
            className={cn(inputCls, 'pl-10 h-9.5 text-[13px]')}
          />
        </div>
      </div>

      {/* Packages Grid */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPackages.map(pkg => {
          const isActive = pkg.status === 'active'
          return (
            <div
              key={pkg.id}
              className={cn(
                'relative flex flex-col justify-between rounded-3xl border bg-white p-5 transition-all shadow-xs duration-200 hover:shadow-card',
                pkg.isPopular
                  ? 'border-[#C4A887] ring-2 ring-[#C4A887]/20'
                  : 'border-line',
                !isActive && 'opacity-65 bg-ivory/50',
              )}
            >
              {/* Top Row: Promo Badge or Popular Tag */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {pkg.badge && (
                    <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-xs">
                      {pkg.badge}
                    </span>
                  )}
                  {pkg.isPopular && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-900 border border-amber-300">
                      <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
                      MOST POPULAR
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-ivory-deep text-ink-muted',
                  )}
                >
                  {isActive ? 'Active' : 'Archived'}
                </span>
              </div>

              {/* Title & Pricing */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-[22px] font-semibold text-ink">
                    {pkg.title}
                  </h3>
                  <div className="text-right">
                    <span className="font-display text-[22px] font-bold text-ink">
                      {currency(pkg.price)}
                    </span>
                    <span className="block text-[10.5px] text-ink-muted">one-time</span>
                  </div>
                </div>

                {/* Credits Pill */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-lg bg-[#C4A887]/15 px-2.5 py-1 text-[12.5px] font-bold text-[#6B4F1C]">
                    <CoinsIcon className="h-3.5 w-3.5 text-[#8C6A2B]" />
                    {pkg.credits} AI Try-On Credits
                  </span>
                  <span className="text-[12px] font-medium text-ink-soft">
                    ({pkg.perCreditLabel || `$${(pkg.price / pkg.credits).toFixed(2)} / try`})
                  </span>
                </div>

                {/* Description */}
                {pkg.description ? (
                  <p className="mt-3 text-[12.5px] text-ink-muted line-clamp-2">
                    {pkg.description}
                  </p>
                ) : (
                  <p className="mt-3 text-[12px] italic text-ink-faint">
                    Standard virtual try-on credit tier for wig style previews.
                  </p>
                )}
              </div>

              {/* Analytics & Performance */}
              <div className="mt-5 rounded-2xl border border-line/60 bg-ivory/40 p-3 text-[12px]">
                <div className="flex items-center justify-between text-ink-muted">
                  <span>Purchases: <strong className="text-ink">{pkg.salesCount ?? 0} orders</strong></span>
                  <span>Revenue: <strong className="text-emerald-700">{currency(pkg.revenue ?? 0)}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3">
                <button
                  type="button"
                  onClick={() => toggleAiPackageStatus(pkg.id)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  <ArchiveIcon className="h-3.5 w-3.5" />
                  <span>{isActive ? 'Archive' : 'Activate'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(pkg)}
                    title="Duplicate package"
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink transition-colors"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(pkg)}
                    title="Edit package"
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-ivory-deep hover:text-ink transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pkg)}
                    title="Delete package"
                    className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredPackages.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <SparklesIcon className="mx-auto h-8 w-8 text-ink-muted" />
          <h3 className="mt-3 font-display text-[18px] font-semibold text-ink">No packages found</h3>
          <p className="mt-1 text-[13px] text-ink-muted">
            {search ? 'Try clearing your search query.' : 'Create your first AI Credit package to allow shoppers to purchase virtual try-ons.'}
          </p>
          <Button onClick={handleOpenCreate} className="mt-5">
            + Create First Package
          </Button>
        </div>
      )}

      {/* Customer Mobile App Preview Panel */}
      <div className="mt-10">
        <Panel
          title="Customer Mobile App Integration"
          description="How these packages are rendered in the Flutter application's bottom sheet during virtual try-on top up."
        >
          <div className="rounded-2xl border border-line bg-ivory/30 p-5 lg:p-7">
            <div className="max-w-md mx-auto rounded-3xl border-2 border-ink/20 bg-white p-5 shadow-lg">
              {/* Simulated Mobile Sheet Header */}
              <div className="flex items-center justify-between border-b border-line pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C4A887]/20 text-[#8C6A2B]">
                    <SparklesIcon className="h-4 w-4" />
                  </span>
                  <span className="font-display text-[15px] font-semibold text-ink">
                    Top Up Try-On Credits
                  </span>
                </div>
                <span className="text-[11px] text-ink-faint">Secure Checkout</span>
              </div>

              <p className="mt-3 text-[12px] text-ink-muted">
                Your 3 free try-ons are used. Select a credit tier to continue generating photo matches with Stripe:
              </p>

              {/* Simulated Package List in App */}
              <div className="mt-4 space-y-2.5">
                {aiPackages.filter(p => p.status === 'active').slice(0, 3).map(pkg => (
                  <div
                    key={pkg.id}
                    className={cn(
                      'relative flex items-center justify-between rounded-2xl border p-3.5 transition-all',
                      pkg.isPopular
                        ? 'border-[#C4A887] bg-[#C4A887]/5 ring-1 ring-[#C4A887]'
                        : 'border-line bg-white',
                    )}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2 left-3 rounded-full bg-ink px-2 py-0.2 text-[9px] font-bold text-white">
                        {pkg.badge}
                      </span>
                    )}
                    <div className="min-w-0 pr-2">
                      <p className="text-[13px] font-semibold text-ink">{pkg.title}</p>
                      <p className="text-[11px] text-ink-muted">
                        +{pkg.credits} AI Try-On Credits ({pkg.perCreditLabel})
                      </p>
                    </div>
                    <span className="font-semibold text-[14px] text-ink">
                      {currency(pkg.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Simulated Pay Button */}
              <div className="mt-5">
                <div className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-[13px] font-semibold text-white shadow-xs">
                  <CreditCardIcon className="h-4 w-4" />
                  <span>Pay with Card</span>
                </div>
                <p className="mt-2 text-center text-[10.5px] text-ink-faint">
                  Instant balance update · Secured by Stripe
                </p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Package Create / Edit Modal */}
      {modalOpen && (
        <PackageModal
          editing={editingPackage}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveDraft}
        />
      )}
    </div>
  )
}
