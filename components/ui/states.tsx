export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {icon && <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ivory-deep text-ink-muted">{icon}</span>}
      <p className="font-display text-[19px] text-ink">{title}</p>
      {body && <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-ink-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
