'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BellIcon, BellRingIcon, ChevronRightIcon, LayersIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, MessageSquareWarningIcon,
  SettingsIcon, ShieldAlertIcon, ShoppingBagIcon, StoreIcon, TrendingUpIcon, UsersIcon, XIcon,
} from 'lucide-react'
import { BrandLogo } from '@/components/ui/logo'
import { useAdmin } from '@/context/admin-context'
import { cn } from '@/lib/utils'

type BadgeKey = 'orders' | 'disputes' | 'fraud' | 'vendors' | 'users' | 'campaigns'
type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>

const NAV_GROUPS: { label: string; items: { to: string; label: string; Icon: Icon; badge?: BadgeKey }[] }[] = [
  {
    label: 'Operations',
    items: [
      { to: '/admin/dashboard', label: 'Overview', Icon: LayoutDashboardIcon },
      { to: '/admin/orders', label: 'Orders', Icon: ShoppingBagIcon, badge: 'orders' },
    ],
  },
  {
    label: 'Trust & safety',
    items: [
      { to: '/admin/disputes', label: 'Customer disputes', Icon: MessageSquareWarningIcon, badge: 'disputes' },
      { to: '/admin/fraud', label: 'Fraud prevention', Icon: ShieldAlertIcon, badge: 'fraud' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { to: '/admin/vendors', label: 'Vendors', Icon: StoreIcon, badge: 'vendors' },
      { to: '/admin/users', label: 'Users', Icon: UsersIcon, badge: 'users' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/admin/collections', label: 'Featured collections', Icon: LayersIcon },
      { to: '/admin/notifications', label: 'Push notifications', Icon: BellRingIcon, badge: 'campaigns' },
    ],
  },
  {
    label: 'Insight',
    items: [{ to: '/admin/analytics', label: 'Analytics', Icon: TrendingUpIcon }],
  },
  {
    label: 'Account',
    items: [{ to: '/admin/settings', label: 'Settings', Icon: SettingsIcon }],
  },
]

const isActive = (pathname: string, to: string) => pathname === to || pathname.startsWith(to + '/')

function currentLocation(pathname: string) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find(i => isActive(pathname, i.to))
    if (item) return { group: group.label, item: item.label, to: item.to }
  }
  return null
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20'

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { allOrders, disputes, riskSignals, vendors, users, campaigns } = useAdmin()
  const badges: Record<BadgeKey, number> = {
    orders: allOrders.filter(o => o.status === 'placed').length,
    disputes: disputes.filter(d => !d.status.startsWith('resolved')).length,
    fraud: riskSignals.filter(r => r.status === 'open').length,
    vendors: vendors.filter(v => v.verification === 'pending' || v.verification === 'unsubmitted').length,
    users: users.filter(u => u.status === 'flagged').length,
    campaigns: campaigns.filter(c => c.status === 'scheduled').length,
  }

  return (
    <div className="space-y-6">
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.12em] text-ink-faint">{group.label.toUpperCase()}</p>
          <ul className="space-y-0.5">
            {group.items.map(({ to, label, Icon, badge }) => {
              const count = badge ? badges[badge] : 0
              const active = isActive(pathname, to)
              return (
                <li key={to}>
                  <Link
                    href={to}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-150',
                      focusRing,
                      active ? 'bg-ink text-white shadow-lift' : 'text-ink-soft hover:bg-ivory-deep hover:text-ink',
                    )}
                  >
                    <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', active ? 'text-white' : 'text-ink-muted group-hover:text-ink')} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {count > 0 && (
                      <span className={cn('min-w-[22px] rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums', active ? 'bg-white/20 text-white' : 'bg-blush-100 text-blush-600')}>{count}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { account, signOut } = useAdmin()
  return (
    <div className="border-t border-line p-3">
      <div className="flex items-center gap-1 rounded-2xl p-1 transition-colors hover:bg-ivory">
        <Link href="/admin/settings" onClick={onNavigate} className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1.5 py-1.5', focusRing)}>
          <img src={account.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-inset" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{account.name}</p>
            <p className="truncate text-[11.5px] text-ink-muted">{account.role}</p>
          </div>
        </Link>
        <button onClick={signOut} title="Sign out" aria-label="Sign out" className={cn('rounded-xl p-2.5 text-ink-muted transition-colors hover:bg-ivory-deep hover:text-ink', focusRing)}>
          <LogOutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

const notifIcon: Record<string, Icon> = { dispute: MessageSquareWarningIcon, vendor: StoreIcon, system: TrendingUpIcon }

function NotificationsMenu() {
  const router = useRouter()
  const { adminNotifs, markAdminNotifRead, markAdminNotifsRead } = useAdmin()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = adminNotifs.filter(n => !n.read).length

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className={cn('relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-ivory-deep hover:text-ink', focusRing, open && 'bg-ivory-deep text-ink')}
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blush-500 ring-2 ring-white" />}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-[360px] max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-card animate-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-ink">Notifications</p>
              {unread > 0 && <span className="rounded-md bg-blush-100 px-1.5 py-0.5 text-[11px] font-bold text-blush-600">{unread} new</span>}
            </div>
            {unread > 0 && (
              <button onClick={markAdminNotifsRead} className="text-[12px] font-semibold text-ink-muted transition-colors hover:text-ink">Mark all read</button>
            )}
          </div>
          {adminNotifs.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-ink-muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="scroll-thin max-h-[380px] divide-y divide-line-soft overflow-y-auto">
              {adminNotifs.map(n => {
                const KindIcon = notifIcon[n.kind] ?? BellIcon
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        markAdminNotifRead(n.id)
                        setOpen(false)
                        if (n.href) router.push(n.href)
                      }}
                      className={cn('flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ivory', !n.read && 'bg-blush-50/60')}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ivory-deep text-ink-muted">
                        <KindIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={cn('truncate text-[13px] text-ink', !n.read && 'font-semibold')}>{n.title}</span>
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blush-500" aria-label="Unread" />}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">{n.body}</span>
                        <span className="mt-1 block text-[11px] text-ink-faint">{n.at}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { account } = useAdmin()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const location = currentLocation(pathname)
  const isDetail = location ? pathname !== location.to : false

  // The page scrolls inside <main>, so reset it on navigation.
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-ivory">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-20 shrink-0 items-center justify-center border-b border-line px-5">
          <Link href="/admin/dashboard" aria-label="The Cut — Overview" className={cn('rounded-lg', focusRing)}>
            <BrandLogo imgClassName="h-16" />
          </Link>
        </div>
        <nav aria-label="Main" className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <NavItems />
        </nav>
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-ink/30 backdrop-blur-[2px] animate-fade" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-card animate-slide-left" aria-label="Main menu">
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-line px-5">
              <BrandLogo imgClassName="h-16" />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className={cn('rounded-lg p-1.5 text-ink-muted hover:bg-ivory-deep', focusRing)}><XIcon className="h-5 w-5" /></button>
            </div>
            <nav aria-label="Main" className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 py-5">
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </nav>
            <SidebarFooter onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur lg:h-20 lg:px-8">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className={cn('-ml-1 rounded-lg p-1.5 text-ink-muted hover:bg-ivory-deep lg:hidden', focusRing)}>
            <MenuIcon className="h-5 w-5" />
          </button>
          <BrandLogo imgClassName="h-12" className="lg:hidden" />

          {location && (
            <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
              <ol className="flex items-center gap-1.5 text-[13px]">
                <li className="text-ink-faint">{location.group}</li>
                <li aria-hidden><ChevronRightIcon className="h-3.5 w-3.5 text-ink-faint" /></li>
                <li>
                  {isDetail
                    ? <Link href={location.to} className="text-ink-muted transition-colors hover:text-ink">{location.item}</Link>
                    : <span className="font-semibold text-ink" aria-current="page">{location.item}</span>}
                </li>
                {isDetail && (
                  <>
                    <li aria-hidden><ChevronRightIcon className="h-3.5 w-3.5 text-ink-faint" /></li>
                    <li className="truncate font-semibold text-ink" aria-current="page">Details</li>
                  </>
                )}
              </ol>
            </nav>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <NotificationsMenu />
            <span className="mx-1.5 hidden h-6 w-px bg-line sm:block" aria-hidden />
            <Link href="/admin/settings" aria-label="Account settings" className={cn('hidden rounded-full sm:block', focusRing)}>
              <img src={account.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-inset" />
            </Link>
          </div>
        </header>

        <main ref={mainRef} className="scroll-thin flex-1 overflow-y-auto">
          <div key={pathname} className="mx-auto max-w-6xl px-4 py-6 animate-rise sm:px-6 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
