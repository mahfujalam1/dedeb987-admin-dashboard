'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  FileTextIcon,
  MessageSquareIcon,
  SendIcon,
  ShieldAlertIcon,
  StoreIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inputCls } from '@/components/ui/field'
import { Tag } from '@/components/ui/tag'
import type { Dispute } from '@/lib/data/admin-data'
import { useAppDispatch, useAppSelector } from '@/components/store/hooks'
import { sendMessage } from '@/components/store/slices/messagesSlice'
import { cn, currency } from '@/lib/utils'

interface DisputeChatModalProps {
  dispute: Dispute | null
  isOpen: boolean
  onClose: () => void
  onResolveCustomer?: () => void
  onResolveVendor?: () => void
  onEscalate?: () => void
  onDeescalate?: () => void
}

export function DisputeChatModal({
  dispute,
  isOpen,
  onClose,
  onResolveCustomer,
  onResolveVendor,
  onEscalate,
  onDeescalate,
}: DisputeChatModalProps) {
  const [mounted, setMounted] = useState(false)
  const [adminReply, setAdminReply] = useState('')
  const dispatch = useAppDispatch()

  const { conversations } = useAppSelector(state => state.messages)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!mounted || !isOpen || !dispute) return null

  // Find conversation matching this dispute orderId or customerName
  const conv = conversations.find(
    c => (c.orderId && c.orderId === dispute.orderId) || c.customerName.toLowerCase() === dispute.customerName.toLowerCase()
  ) || conversations[0]

  const isEscalated = dispute.status === 'escalated'
  const isResolved = dispute.status.startsWith('resolved')

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminReply.trim() || !conv) return

    dispatch(
      sendMessage({
        conversationId: conv.id,
        text: `[Admin Mediation]: ${adminReply.trim()}`,
      })
    )
    setAdminReply('')
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dispute-chat-title"
        className="relative z-10 flex max-h-[86dvh] h-full w-full max-w-[700px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-white shadow-card animate-rise sm:h-[820px] sm:max-h-[min(820px,calc(100dvh-2rem))] sm:rounded-3xl"
      >
        {/* Header */}
        <div className="border-b border-line bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger-50 text-danger-500">
                  <MessageSquareIcon className="h-4 w-4" />
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                  Dispute Case #{dispute.id}
                </span>
                {isEscalated && (
                  <Tag tone="danger">Escalated Priority</Tag>
                )}
                {isResolved ? (
                  <Tag tone="success">Resolved</Tag>
                ) : (
                  <Tag tone="warn">{dispute.status}</Tag>
                )}
              </div>
              <h2 id="dispute-chat-title" className="mt-1 font-display text-[18px] leading-snug text-ink sm:text-[20px]">
                {dispute.reason}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1.5 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-ivory-deep hover:text-ink"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Context Strip */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ivory/80 px-3.5 py-2 text-[12px]">
            <div className="flex flex-wrap items-center gap-3 text-ink-muted">
              <span>Order: <strong className="font-semibold text-ink">{dispute.orderId}</strong></span>
              <span>·</span>
              <span>Customer: <strong className="font-semibold text-ink">{dispute.customerName}</strong></span>
              <span>·</span>
              <span>Vendor: <strong className="font-semibold text-ink">{dispute.vendorName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-[14px] font-semibold text-ink">{currency(dispute.amount)}</span>
              <Link
                href={`/admin/messages?orderId=${dispute.orderId}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:bg-white hover:text-ink"
              >
                <span>Full screen</span>
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Escalation Notice if Escalated */}
        {isEscalated && (
          <div className="flex items-center justify-between border-b border-danger-500/20 bg-danger-50/60 px-6 py-2.5 text-[12px] text-danger-700">
            <div className="flex items-center gap-2">
              <ShieldAlertIcon className="h-4 w-4 shrink-0 text-danger-500" />
              <span>
                <strong>Escalated to Senior Admin:</strong> Requires administrative determination between customer refund or vendor payout.
              </span>
            </div>
          </div>
        )}

        {/* Chat Feed */}
        <div className="scroll-thin flex-1 space-y-3.5 overflow-y-auto bg-ivory/30 p-5 sm:p-6">
          <div className="flex justify-center">
            <span className="rounded-full bg-line-soft px-3 py-1 text-[11px] font-medium text-ink-muted">
              Chat history between {dispute.customerName} & {dispute.vendorName}
            </span>
          </div>

          {conv?.messages?.map(msg => {
            const isCustomer = msg.sender === 'customer'
            const isAdmin = msg.text.startsWith('[Admin Mediation]')
            return (
              <div
                key={msg.id}
                className={cn('flex flex-col', isCustomer ? 'items-start' : 'items-end')}
              >
                <div className="mb-1 flex items-center gap-1.5 px-1 text-[11px] text-ink-muted">
                  {isAdmin ? (
                    <span className="font-semibold text-purple-700">Admin Mediation</span>
                  ) : isCustomer ? (
                    <>
                      <UserIcon className="h-3 w-3" />
                      <span className="font-medium text-ink">{dispute.customerName} (Customer)</span>
                    </>
                  ) : (
                    <>
                      <StoreIcon className="h-3 w-3" />
                      <span className="font-medium text-ink">{dispute.vendorName} (Vendor)</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{msg.time}</span>
                </div>

                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs',
                    isAdmin
                      ? 'border border-purple-300 bg-purple-50 text-purple-950'
                      : isCustomer
                      ? 'border border-line bg-white text-ink'
                      : 'border border-ink bg-ink text-white',
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Attachment if any */}
                  {msg.attachment && (
                    <div className="mt-2.5 rounded-xl border border-line-strong/30 bg-black/5 p-2">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate font-medium">{msg.attachment.name}</span>
                        {msg.attachment.size && (
                          <span className="text-[10px] opacity-70">({msg.attachment.size})</span>
                        )}
                      </div>
                      {msg.attachment.type === 'image' && msg.attachment.url && (
                        <img
                          src={msg.attachment.url}
                          alt={msg.attachment.name}
                          className="mt-2 max-h-48 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Admin Mediation Input */}
        <form onSubmit={handleSendAdminMessage} className="border-t border-line bg-white p-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={adminReply}
              onChange={e => setAdminReply(e.target.value)}
              placeholder="Send an administrative mediation message to both parties..."
              className={cn(inputCls, 'h-10 py-2 text-[13px]')}
            />
            <Button type="submit" size="sm" disabled={!adminReply.trim()} className="shrink-0 gap-1.5">
              <SendIcon className="h-3.5 w-3.5" />
              <span>Send</span>
            </Button>
          </div>
        </form>

        {/* Footer Resolution Controls */}
        <div className="sticky bottom-0 z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-white/95 backdrop-blur-md px-6 pt-3 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] shadow-[0_-8px_20px_rgba(0,0,0,0.06)] sm:py-3.5">
          <div className="flex items-center gap-2">
            {!isResolved && (
              <>
                {isEscalated ? (
                  onDeescalate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onDeescalate()
                        onClose()
                      }}
                    >
                      Return to standard queue
                    </Button>
                  )
                ) : (
                  onEscalate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onEscalate()
                      }}
                      className="text-danger-600 hover:border-danger-500"
                    >
                      Escalate to Senior Admin
                    </Button>
                  )
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            {!isResolved && onResolveCustomer && onResolveVendor && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onResolveVendor()
                    onClose()
                  }}
                >
                  Resolve for vendor
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onResolveCustomer()
                    onClose()
                  }}
                >
                  Resolve for customer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
