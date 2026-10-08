import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { DashboardView } from '@/components/admin/dashboard-view'
import { AdminProvider } from '@/context/admin-context'
import { ConfirmProvider } from '@/context/confirm-context'
import { getCurrentAdmin } from '@/lib/session'

export const instant = false

export default async function Home() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  return (
    <ConfirmProvider>
      <AdminProvider initialAccount={admin}>
        <AdminShell>
          <DashboardView />
        </AdminShell>
      </AdminProvider>
    </ConfirmProvider>
  )
}
