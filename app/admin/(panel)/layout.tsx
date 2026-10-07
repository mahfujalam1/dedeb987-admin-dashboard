import { redirect } from 'next/navigation'
import { AdminProvider } from '@/context/admin-context'
import { AdminShell } from '@/components/admin/admin-shell'
import { ConfirmProvider } from '@/context/confirm-context'
import { getCurrentAdmin } from '@/lib/session'

// Reads the session cookie, so this segment blocks on the server rather than prerendering a static shell.
export const instant = false

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')
  return (
    <ConfirmProvider>
      <AdminProvider initialAccount={admin}>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </ConfirmProvider>
  )
}
