import { cn } from '@/lib/utils'
import { Tag, type TagTone } from '@/components/ui/tag'
import type { OrderStatus } from '@/lib/types'
import type { AdminUser, AdminVendor, RiskSignal } from '@/lib/data/admin-data'

export function DisputeTag({ status }: { status: string }) {
  const resolved = status.startsWith('resolved')
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold', resolved ? 'bg-success-50 text-success-600' : 'bg-warn-50 text-warn-600')}>{resolved ? 'Resolved' : 'Open'}</span>
}
export function SlaTag({ hoursLeft }: { hoursLeft: number }) {
  const urgent = hoursLeft < 12
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold', urgent ? 'bg-danger-50 text-danger-500' : 'bg-ivory-deep text-ink-muted')}>{hoursLeft < 0 ? 'Breached' : `${hoursLeft}h left`}</span>
}

const orderTones: Record<OrderStatus, TagTone> = {
  placed: 'warn',
  confirmed: 'warn',
  preparing: 'warn',
  ready: 'default',
  shipped: 'default',
  out_for_delivery: 'default',
  delivered: 'success',
  picked_up: 'success',
  cancelled: 'danger',
}
export function OrderStatusTag({ status }: { status: OrderStatus }) {
  return <Tag tone={orderTones[status]}>{status.replace(/_/g, ' ')}</Tag>
}

export const severityStyles: Record<RiskSignal['severity'], { text: string; dot: string; bar: string; label: string }> = {
  high: { text: 'text-danger-500', dot: 'bg-danger-500', bar: 'bg-danger-500', label: 'High risk' },
  medium: { text: 'text-warn-600', dot: 'bg-warn-500', bar: 'bg-warn-500', label: 'Medium risk' },
  low: { text: 'text-ink-muted', dot: 'bg-ink-faint', bar: 'bg-line-strong', label: 'Low risk' },
}
export function SeverityTag({ severity }: { severity: RiskSignal['severity'] }) {
  const s = severityStyles[severity]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium', s.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </span>
  )
}

export const vendorStatusTone: Record<AdminVendor['status'], TagTone> = { active: 'success', suspended: 'danger', pending: 'warn' }
export const userStatusTone: Record<AdminUser['status'], TagTone> = { active: 'success', suspended: 'danger', flagged: 'warn' }
