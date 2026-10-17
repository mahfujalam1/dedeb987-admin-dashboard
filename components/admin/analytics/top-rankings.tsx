'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trophy, ExternalLink } from 'lucide-react'
import { Panel } from '@/components/admin/panel'
import { cn, currency } from '@/lib/utils'
import { TopProductsList, type TopProductItem } from './top-products-list'

export interface TopSellerItem {
  id: string
  name: string
  logo?: string
  plan?: string
  computedGmv: number
  salesCount: number
  activeProducts: number
}

interface TopRankingsProps {
  topSellers: TopSellerItem[]
  totalTopSellersGmv: number
  topProducts: TopProductItem[]
}

export function TopRankings({ topSellers, totalTopSellersGmv, topProducts }: TopRankingsProps) {
  const [topRankingTab, setTopRankingTab] = useState<'sellers' | 'products'>('sellers')

  return (
    <Panel
      title={topRankingTab === 'sellers' ? 'Top 5 Sellers' : 'Top 5 Products'}
      description={
        topRankingTab === 'sellers'
          ? 'Highest grossing vendor ateliers ranked by marketplace sales volume.'
          : 'Most popular wigs by revenue and units sold.'
      }
      action={
        <div className="flex rounded-lg border border-line bg-ivory p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setTopRankingTab('sellers')}
            className={cn(
              'rounded-md px-3 py-1 transition-colors',
              topRankingTab === 'sellers' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink',
            )}
          >
            Top 5 Sellers
          </button>
          <button
            onClick={() => setTopRankingTab('products')}
            className={cn(
              'rounded-md px-3 py-1 transition-colors',
              topRankingTab === 'products' ? 'bg-white text-ink shadow-xs' : 'text-ink-muted hover:text-ink',
            )}
          >
            Top Products
          </button>
        </div>
      }
    >
      {topRankingTab === 'sellers' ? (
        <ul className="divide-y divide-line/60">
          {topSellers.map((seller, index) => {
            const sharePct = totalTopSellersGmv > 0 ? Math.round((seller.computedGmv / totalTopSellersGmv) * 100) : 0
            const isFirst = index === 0

            return (
              <li key={seller.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold',
                        isFirst
                          ? 'bg-ink text-white ring-2 ring-ink/20 shadow-xs'
                          : index === 1
                          ? 'bg-ivory-deep text-ink-soft'
                          : index === 2
                          ? 'bg-[#C4A887]/20 text-[#6B4F1C]'
                          : 'bg-ivory text-ink-muted',
                      )}
                    >
                      {isFirst ? <Trophy className="h-3 w-3 text-amber-300" /> : `#${index + 1}`}
                    </div>

                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
                      {seller.logo ? (
                        <img src={seller.logo} alt={seller.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[12px] font-bold text-ink-muted">
                          {seller.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link
                        href={`/admin/vendors/${seller.id}`}
                        className="group flex items-center gap-1.5 font-semibold text-[13.5px] text-ink hover:text-ink-soft hover:underline"
                      >
                        <span className="truncate">{seller.name}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-muted">
                        <span>{seller.salesCount} orders</span>
                        <span>·</span>
                        <span>{seller.activeProducts} active products</span>
                        {seller.plan && seller.plan !== 'None' && (
                          <span className="rounded bg-ivory px-1.5 py-0.2 text-[10px] font-semibold text-ink-soft">
                            {seller.plan}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-[14px] text-ink">{currency(seller.computedGmv)}</p>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ivory-deep">
                        <div className="h-full rounded-full bg-ink" style={{ width: `${sharePct}%` }} />
                      </div>
                      <span className="text-[11px] font-medium text-ink-muted">{sharePct}%</span>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <TopProductsList products={topProducts} />
      )}
    </Panel>
  )
}
