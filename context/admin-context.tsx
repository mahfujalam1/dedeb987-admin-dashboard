'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useConfirm } from '@/context/confirm-context'
import type { AdminAccount, AppNotification, Order } from '@/lib/types'
import {
  adminNotifications, adminUsers, adminVendors, campaigns as seedCampaigns, collections as seedCollections,
  disputes as seedDisputes, platformOrders, riskSignals as seedRiskSignals,
  type AdminUser, type AdminVendor, type Campaign, type Collection, type Dispute, type RiskSignal,
} from '@/lib/data/admin-data'

type NewCampaign = Omit<Campaign, 'id'> & { id?: string }
type NewCollection = Omit<Collection, 'id'> & { id?: string }

interface AdminContextValue {
  allOrders: Order[]
  vendors: AdminVendor[]
  users: AdminUser[]
  disputes: Dispute[]
  riskSignals: RiskSignal[]
  campaigns: Campaign[]
  collections: Collection[]
  adminNotifs: AppNotification[]
  account: AdminAccount
  verifyVendor: (id: string, decision: 'approved' | 'rejected') => void
  approveVendor: (id: string) => void
  suspendVendor: (id: string, suspended?: boolean) => void
  resolveDispute: (id: string, res: string) => void
  escalateDispute: (id: string) => void
  resolveRiskSignal: (id: string) => void
  dismissRiskSignal: (id: string) => void
  banUser: (id: string) => void
  unbanUser: (id: string) => void
  adminActionOrder: (id: string, action: string) => void
  addCampaign: (c: NewCampaign) => void
  launchCampaign: (c: NewCampaign) => void
  updateCampaign: (id: string, patch: Partial<Campaign>) => void
  addCollection: (c: NewCollection) => void
  updateCollection: (id: string, patch: Partial<Collection>) => void
  deleteCollection: (id: string) => void
  publishCollection: (id: string) => void
  archiveCollection: (id: string) => void
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

  const resolveRiskSignal = useCallback((id: string) => {
    setRiskSignals(rs => rs.map(r => r.id === id ? { ...r, status: 'resolved' } : r))
  }, [])
  const dismissRiskSignal = resolveRiskSignal

  const banUser = useCallback((id: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: 'suspended' } : u))
  }, [])
  const unbanUser = useCallback((id: string) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: 'active' } : u))
  }, [])

  // No-op stub, matching the original app.
  const adminActionOrder: AdminContextValue['adminActionOrder'] = useCallback(() => {}, [])

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
      allOrders: platformOrders, vendors, users, disputes, riskSignals, campaigns, collections, adminNotifs, account,
      verifyVendor, approveVendor, suspendVendor, resolveDispute, escalateDispute, resolveRiskSignal, dismissRiskSignal,
      banUser, unbanUser, adminActionOrder, addCampaign, launchCampaign, updateCampaign,
      addCollection, updateCollection, deleteCollection, publishCollection, archiveCollection,
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
