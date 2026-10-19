import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function currency(n: number, options?: { decimals?: number }) {
  const decimals = options?.decimals ?? 2
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}
export function compact(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n) }
