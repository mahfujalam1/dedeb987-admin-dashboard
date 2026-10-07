'use client'
import { useState } from 'react'
import { UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { Panel, TableWrap, Td, Th, rowCls } from '@/components/admin/panel'
import { useConfirm } from '@/context/confirm-context'
import type { AdminUser } from '@/lib/data/admin-data'
import { userStatusTone } from '@/components/admin/status-tag'
import { Button } from '@/components/ui/button'
import { searchCls } from '@/components/ui/field'
import { EmptyState } from '@/components/ui/states'
import { Tag } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { cn, currency } from '@/lib/utils'

export default function UsersPage() {
  const { users, banUser, unbanUser } = useAdmin()
  const confirm = useConfirm()

  async function suspend(u: AdminUser) {
    const ok = await confirm({
      title: `Suspend ${u.name}?`,
      body: 'They won’t be able to sign in or place orders until you reinstate them.',
      confirmLabel: 'Suspend user',
      tone: 'danger',
    })
    if (!ok) return
    banUser(u.id)
    toast.success(`${u.name} suspended`, { action: { label: 'Undo', onClick: () => unbanUser(u.id) } })
  }
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const list = users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))

  return (
    <>
      <PageHeader eyebrow="Marketplace" title="Users" description="Manage customer accounts across the platform." />

      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users..." className={cn(searchCls, 'mt-7 max-w-[384px]')} />

      <Panel padded={false} className="mt-7">
        {list.length === 0 ? (
          <EmptyState icon={<UsersIcon className="h-5 w-5" />} title="No users found" body="Try a different name or email." />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Joined</Th>
                <Th>Orders</Th>
                <Th>Spent</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {list.map(u => (
                <tr key={u.id} className={rowCls}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </Td>
                  <Td className="text-ink-soft">{u.email}</Td>
                  <Td>{u.joinedAt}</Td>
                  <Td>{u.orders}</Td>
                  <Td>{currency(u.spent)}</Td>
                  <Td><Tag tone={userStatusTone[u.status]}>{u.status}</Tag></Td>
                  <Td className="text-center">
                    {u.status === 'suspended' ? (
                      <Button size="sm" variant="outline" onClick={() => { unbanUser(u.id); toast.success(`${u.name} reinstated`) }}>Reinstate</Button>
                    ) : (
                      <Button size="sm" variant="danger" onClick={() => suspend(u)}>Suspend</Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Panel>
    </>
  )
}
