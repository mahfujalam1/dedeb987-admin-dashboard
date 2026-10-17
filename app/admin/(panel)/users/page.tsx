'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRightIcon, UsersIcon } from 'lucide-react'
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
      <PageHeader eyebrow="Marketplace" title="Users" description="Manage customer accounts across the platform. Click any user to view profile and order history." />

      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users by name or email..." className={cn(searchCls, 'mt-7 max-w-[384px]')} />

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
                <Th>Orders (Purchases)</Th>
                <Th>Spent</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {list.map(u => (
                <tr key={u.id} className={rowCls}>
                  <Td>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="group flex items-center gap-2.5 transition-colors"
                      title="Open client profile"
                    >
                      <img src={u.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover transition-transform group-hover:scale-105" />
                      <div>
                        <span className="font-semibold text-ink group-hover:text-accent-600 group-hover:underline">{u.name}</span>
                        <p className="text-[11px] text-ink-muted">View profile →</p>
                      </div>
                    </Link>
                  </Td>
                  <Td className="text-ink-soft">{u.email}</Td>
                  <Td>{u.joinedAt}</Td>
                  <Td>
                    <Link
                      href={`/admin/users/${u.id}#purchases`}
                      className="inline-flex items-center gap-1 font-semibold text-accent-600 hover:underline"
                      title="View client purchases"
                    >
                      <span>{u.orders} orders</span>
                      <ArrowUpRightIcon className="h-3 w-3" />
                    </Link>
                  </Td>
                  <Td className="font-medium text-ink">{currency(u.spent)}</Td>
                  <Td><Tag tone={userStatusTone[u.status]}>{u.status}</Tag></Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex h-8 items-center rounded-lg border border-line bg-white px-2.5 text-[12px] font-medium text-ink transition-colors hover:bg-ivory-deep hover:text-ink"
                      >
                        Profile
                      </Link>
                      {u.status === 'suspended' ? (
                        <Button size="sm" variant="outline" onClick={() => { unbanUser(u.id); toast.success(`${u.name} reinstated`) }}>Reinstate</Button>
                      ) : (
                        <Button size="sm" variant="danger" onClick={() => suspend(u)}>Suspend</Button>
                      )}
                    </div>
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
