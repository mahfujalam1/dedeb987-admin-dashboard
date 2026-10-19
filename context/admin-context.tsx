'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useConfirm } from '@/context/confirm-context'
import type { AdminAccount, AppNotification, Order, PlatformSettings } from '@/lib/types'
import {
  adminNotifications, adminUsers, adminVendors, campaigns as seedCampaigns, collections as seedCollections,
  disputes as seedDisputes, initialAiPackages, initialPlatformSettings, platformOrders, riskSignals as seedRiskSignals,
  type AdminUser, type AdminVendor, type AiCreditPackage, type Campaign, type Collection, type Dispute, type RiskSignal,
} from '@/lib/data/admin-data'

type NewCampaign = Omit<Campaign, 'id'> & { id?: string }
type NewCollection = Omit<Collection, 'id'> & { id?: string }
export type NewAiPackage = Omit<AiCreditPackage, 'id'> & { id?: string }

interface AdminContextValue {
  allOrders: Order[]
  vendors: AdminVendor[]
  users: AdminUser[]
  disputes: Dispute[]
  riskSignals: RiskSignal[]
  campaigns: Campaign[]
  collections: Collection[]
  aiPackages: AiCreditPackage[]
  adminNotifs: AppNotification[]
  account: AdminAccount
  platformSettings: PlatformSettings
  updatePlatformSettings: (patch: Partial<PlatformSettings>) => void
  setVendorCommissionRate: (vendorId: string, rate: number | undefined) => void
  verifyVendor: (id: string, decision: 'approved' | 'rejected') => void
  approveVendor: (id: string) => void
  suspendVendor: (id: string, suspended?: boolean) => void
  deleteVendor: (id: string) => void
  resolveDispute: (id: string, res: string) => void
  escalateDispute: (id: string) => void
  deescalateDispute: (id: string) => void
  resolveRiskSignal: (id: string, note?: string) => void
  dismissRiskSignal: (id: string) => void
  banUser: (id: string) => void
  unbanUser: (id: string) => void
  adminActionOrder: (id: string, action: string, payload?: any) => void
  addCampaign: (c: NewCampaign) => void
  launchCampaign: (c: NewCampaign) => void
  updateCampaign: (id: string, patch: Partial<Campaign>) => void
  addCollection: (c: NewCollection) => void
  updateCollection: (id: string, patch: Partial<Collection>) => void
  deleteCollection: (id: string) => void
  publishCollection: (id: string) => void
  archiveCollection: (id: string) => void
  addAiPackage: (p: NewAiPackage) => void
  updateAiPackage: (id: string, patch: Partial<AiCreditPackage>) => void
  deleteAiPackage: (id: string) => void
  toggleAiPackageStatus: (id: string) => void
  markAdminNotifRead: (id: string) => void
  markAdminNotifsRead: () => void
  updateAdminAccount: (patch: { name?: string; email?: string }) => Promise<void>
  signOut: () => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ initialAccount, children }: { initialAccount: AdminAccount; children: React.ReactNode }) {
  const router = useRouter()
  const confirm = useConfirm()
  const [vendors, setVendors] = useState(adminVendors)
  const [users, setUsers] = useState(adminUsers)
  const [disputes, setDisputes] = useState(seedDisputes)
  const [riskSignals, setRiskSignals] = useState(seedRiskSignals)
  const [campaigns, setCampaigns] = useState(seedCampaigns)
  const [collections, setCollections] = useState(seedCollections)
  const [adminNotifs, setAdminNotifs] = useState(adminNotifications)
  const [account, setAccount] = useState(initialAccount)
  const [orders, setOrders] = useState(platformOrders)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(initialPlatformSettings)

  const updatePlatformSettings = useCallback((patch: Partial<PlatformSettings>) => {
    setPlatformSettings(prev => ({ ...prev, ...patch }))
    toast.success('Platform commission & fee settings updated')
  }, [])

  const setVendorCommissionRate = useCallback((vendorId: string, rate: number | undefined) => {
    setVendors(vs => vs.map(v => v.id === vendorId ? { ...v, customCommissionRate: rate } : v))
    toast.success(rate !== undefined ? `Custom commission set to ${rate}%` : 'Reset to default platform rate')
  }, [])

  const verifyVendor = useCallback((id: string, decision: 'approved' | 'rejected') => {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, verification: decision, status: decision === 'approved' ? 'active' : 'pending' } : v))
  }, [])
  const approveVendor = useCallback((id: string) => {
    setVendors(vs => vs.map(v => v.id === id ? { ...v, verification: 'approved', status: 'active' } : v))
  }, [])
  const suspendVendor = useCallback((id: string, suspended?: boolean) => {
    setVendors(vs => vs.map(v => {
      if (v.id !== id) return v
      if (suspended === false) return { ...v, status: 'active' }
      return { ...v, status: v.status === 'suspended' ? 'active' : 'suspended' }
    }))
  }, [])

  const resolveDispute = useCallback((id: string, res: string) => {
    setDisputes(ds => ds.map(d => d.id === id ? { ...d, status: `resolved_${res}` } : d))
  }, [])
  const escalateDispute = useCallback((id: string) => {
    setDisputes(ds => ds.map(d => d.id === id ? { ...d, status: 'escalated' } : d))
  }, [])
  const deescalateDispute = useCallback((id: string) => {
    setDisputes(ds => ds.map(d => d.id === id ? { ...d, status: 'reviewing' } : d))
  }, [])

  const deleteVendor = useCallback((id: string) => {
    setVendors(vs => vs.filter(v => v.id !== id))
    toast.success('Vendor deleted')
  }, [])

  const resolveRiskSignal = useCallback((id: string, note?: string) => {
    setRiskSignals(rs => rs.map(r => r.id === id ? {
      ...r,
      status: 'resolved',
      resolutionNote: note || 'Resolved by administrator',
      resolvedAt: 'Just now',
    } : r))
  }, [])
  const dismissRiskSignal = useCallback((id: string) => {
    setRiskSignals(rs => rs.map(r => r.id === id ? { ...r, status: 'resolved', resolutionNote: 'Dismissed without action', resolvedAt: 'Just now' } : r))
  }, [])

  const banUser = useCallback((id: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: 'suspended' } : u))
  }, [])
  const unbanUser = useCallback((id: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: 'active' } : u))
  }, [])

  const adminActionOrder: AdminContextValue['adminActionOrder'] = useCallback((id: string, action: string, payload?: any) => {
    setOrders(os => os.map(o => {
      if (o.id !== id) return o
      if (action === 'refund') {
        const refundAmt = payload?.amount ?? o.total
        const isPartial = refundAmt < o.total
        return {
          ...o,
          status: isPartial ? o.status : 'cancelled',
          returnStatus: 'refunded',
          refundedAmount: (o.refundedAmount ?? 0) + refundAmt,
          refundType: isPartial ? 'partial' : 'full',
          refundReason: payload?.reason,
        }
      }
      if (action === 'force_cancel') {
        return { ...o, status: 'cancelled' }
      }
      if (action === 'flag_for_review') {
        return { ...o, flaggedForReview: true }
      }
      return o
    }))
  }, [])

  const addCampaign = useCallback((c: NewCampaign) => {
    setCampaigns(cs => [...cs, { ...c, id: c.id ?? `cp-${Date.now()}` }])
  }, [])
  const launchCampaign = useCallback((c: NewCampaign) => addCampaign({ ...c, status: 'sent' }), [addCampaign])
  const updateCampaign = useCallback((id: string, patch: Partial<Campaign>) => {
    setCampaigns(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [])

  const addCollection = useCallback((c: NewCollection) => {
    setCollections(cs => [...cs, { ...c, id: c.id ?? `col-${Date.now()}` }])
  }, [])
  const updateCollection = useCallback((id: string, patch: Partial<Collection>) => {
    setCollections(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c))
  }, [])
  const deleteCollection = useCallback((id: string) => {
    setCollections(cs => cs.filter(c => c.id !== id))
  }, [])
  const [aiPackages, setAiPackages] = useState<AiCreditPackage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('thecut_ai_packages')
        if (saved) return JSON.parse(saved)
      } catch (_) {}
    }
    return initialAiPackages
  })

  const saveAiPackages = useCallback((pkgs: AiCreditPackage[]) => {
    setAiPackages(pkgs)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('thecut_ai_packages', JSON.stringify(pkgs))
      } catch (_) {}
    }
  }, [])

  const addAiPackage = useCallback((pkg: NewAiPackage) => {
    const newPkg: AiCreditPackage = {
      id: pkg.id || `pkg-${Date.now()}`,
      title: pkg.title,
      credits: pkg.credits,
      price: pkg.price,
      perCreditLabel: pkg.perCreditLabel || `$${(pkg.price / Math.max(1, pkg.credits)).toFixed(2)} / try`,
      badge: pkg.badge,
      isPopular: pkg.isPopular ?? false,
      description: pkg.description ?? '',
      status: pkg.status ?? 'active',
      salesCount: pkg.salesCount ?? 0,
      revenue: pkg.revenue ?? 0,
      updatedAt: 'Just now',
    }
    setAiPackages(prev => {
      const updated = [newPkg, ...prev]
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('thecut_ai_packages', JSON.stringify(updated)) } catch (_) {}
      }
      return updated
    })
    toast.success(`Package "${newPkg.title}" created`)
  }, [])

  const updateAiPackage = useCallback((id: string, patch: Partial<AiCreditPackage>) => {
    setAiPackages(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...patch, updatedAt: 'Just now' } : p)
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('thecut_ai_packages', JSON.stringify(updated)) } catch (_) {}
      }
      return updated
    })
    toast.success('Package updated')
  }, [])

  const deleteAiPackage = useCallback((id: string) => {
    setAiPackages(prev => {
      const updated = prev.filter(p => p.id !== id)
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('thecut_ai_packages', JSON.stringify(updated)) } catch (_) {}
      }
      return updated
    })
    toast.success('Package deleted')
  }, [])

  const toggleAiPackageStatus = useCallback((id: string) => {
    setAiPackages(prev => {
      let nextStatus = 'active'
      const updated = prev.map(p => {
        if (p.id !== id) return p
        nextStatus = p.status === 'active' ? 'archived' : 'active'
        return { ...p, status: nextStatus as 'active' | 'archived', updatedAt: 'Just now' }
      })
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('thecut_ai_packages', JSON.stringify(updated)) } catch (_) {}
      }
      toast.success(`Package ${nextStatus === 'active' ? 'activated' : 'archived'}`)
      return updated
    })
  }, [])

  const publishCollection = useCallback((id: string) => updateCollection(id, { status: 'live' }), [updateCollection])
  const archiveCollection = useCallback((id: string) => updateCollection(id, { status: 'archived' }), [updateCollection])

  const markAdminNotifRead = useCallback((id: string) => {
    setAdminNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])
  const markAdminNotifsRead = useCallback(() => {
    setAdminNotifs(ns => ns.map(n => ({ ...n, read: true })))
  }, [])

  const updateAdminAccount = useCallback(async (patch: { name?: string; email?: string }) => {
    const res = await fetch('/api/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error('Could not update account')
    const { admin } = await res.json()
    setAccount(admin)
  }, [])

  const signOut = useCallback(async () => {
    const ok = await confirm({
      title: 'Sign out?',
      body: 'You’ll need to sign in again to access the admin console.',
      confirmLabel: 'Sign out',
      tone: 'danger',
    })
    if (!ok) return
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Signed out of admin')
    router.replace('/admin/login')
    router.refresh()
  }, [router, confirm])

  return (
    <AdminContext.Provider value={{
      allOrders: orders, vendors, users, disputes, riskSignals, campaigns, collections, aiPackages, adminNotifs, account,
      platformSettings, updatePlatformSettings, setVendorCommissionRate,
      verifyVendor, approveVendor, suspendVendor, deleteVendor, resolveDispute, escalateDispute, deescalateDispute, resolveRiskSignal, dismissRiskSignal,
      banUser, unbanUser, adminActionOrder, addCampaign, launchCampaign, updateCampaign,
      addCollection, updateCollection, deleteCollection, publishCollection, archiveCollection,
      addAiPackage, updateAiPackage, deleteAiPackage, toggleAiPackageStatus,
      markAdminNotifRead, markAdminNotifsRead, updateAdminAccount, signOut,
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
