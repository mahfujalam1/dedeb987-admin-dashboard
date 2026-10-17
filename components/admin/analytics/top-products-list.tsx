'use client'
import { currency } from '@/lib/utils'

export interface TopProductItem {
  id: string
  name: string
  brand: string
  price: number
  salePrice?: number
  images?: string[]
  unitsSold: number
  gmv: number
}

export function TopProductsList({ products }: { products: TopProductItem[] }) {
  return (
    <ul className="divide-y divide-line/60">
      {products.map((p, idx) => (
        <li key={p.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ivory text-[11px] font-bold text-ink-muted">
                #{idx + 1}
              </span>
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-line bg-ivory">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-ink-muted">
                    WIG
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[13.5px] text-ink">{p.name}</p>
                <p className="text-[11.5px] text-ink-muted">{p.brand} · {currency(p.salePrice ?? p.price)}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold text-[13.5px] text-ink">{currency(p.gmv)}</p>
              <p className="text-[11px] text-ink-muted">{p.unitsSold} units sold</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
