'use client'
import { useState } from 'react'
import { BellRingIcon, SendIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { Panel } from '@/components/admin/panel'
import { Button } from '@/components/ui/button'
import { inputCls, labelCls } from '@/components/ui/field'
import { EmptyState } from '@/components/ui/states'
import { Tag, type TagTone } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import type { Campaign } from '@/lib/data/admin-data'
import { cn } from '@/lib/utils'

const SEGMENTS = ['All users', 'Wishlist users', 'No try-ons in 30 days', 'All vendors']
const statusTone: Record<Campaign['status'], TagTone> = { scheduled: 'warn', sent: 'success', draft: 'default' }
const today = () => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())

function campaignMeta(c: Campaign) {
  if (c.status === 'scheduled') return [c.segment, c.scheduledAt]
  if (c.status === 'sent') return [c.segment, c.sentAt && `Sent ${c.sentAt}`, c.recipients !== undefined && `${c.recipients} recipients`]
  return [c.segment, 'Draft']
}

export default function NotificationsPage() {
  const { campaigns, launchCampaign, updateCampaign } = useAdmin()
  const [segment, setSegment] = useState(SEGMENTS[0])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const canSend = title.trim() !== '' && message.trim() !== ''

  function send(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend) return
    launchCampaign({ title: title.trim(), segment, message: message.trim(), status: 'sent', sentAt: today() })
    toast.success(`Notification sent to ${segment.toLowerCase()}`)
    setTitle('')
    setMessage('')
  }

  return (
    <>
      <PageHeader eyebrow="Growth" title="Push notifications" description="Broadcast messages to customers and vendors." />

      <Panel title="Send notification" className="mt-7">
        <form onSubmit={send} className="space-y-5">
          <div>
            <label htmlFor="segment" className={labelCls}>Audience segment</label>
            <select id="segment" value={segment} onChange={e => setSegment(e.target.value)} className={cn(inputCls, 'w-auto min-w-[185px] py-2.5')}>
              {SEGMENTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="title" className={labelCls}>Title</label>
            <input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification title..." className={inputCls} />
          </div>
          <div>
            <label htmlFor="message" className={labelCls}>Message</label>
            <textarea id="message" rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification message..." className={cn(inputCls, 'resize-none')} />
          </div>
          <Button type="submit" icon={<SendIcon className="h-4 w-4" />} disabled={!canSend}>Send now</Button>
        </form>
      </Panel>

      <Panel title="Campaign history" padded={false} className="mt-7">
        {campaigns.length === 0 ? (
          <EmptyState icon={<BellRingIcon className="h-5 w-5" />} title="No campaigns yet" body="Notifications you send will show up here." />
        ) : (
          <ul className="divide-y divide-line">
            {campaigns.map(c => (
              <li key={c.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-ink">{c.title}</p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">{c.message}</p>
                  <p className="mt-1 text-[12px] text-ink-faint">{campaignMeta(c).filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 self-center">
                  <Tag tone={statusTone[c.status]}>{c.status}</Tag>
                  {c.status !== 'sent' && (
                    <button
                      onClick={() => { updateCampaign(c.id, { status: 'sent', sentAt: today() }); toast.success(`${c.title} sent`) }}
                      className="text-[12px] font-semibold text-ink hover:text-ink-muted"
                    >
                      Send now
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  )
}
