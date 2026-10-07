'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inputCls } from '@/components/ui/field'
import type { Collection } from '@/lib/data/admin-data'
import { wigs } from '@/lib/data/wigs'
import { cn, currency } from '@/lib/utils'

export interface CollectionDraft {
  title: string; eyebrow: string; description: string; slot: '' | 'hero'
  status: Collection['status']; startsOn: string; endsOn: string; wigIds: string[]
}

const emptyDraft: CollectionDraft = { title: '', eyebrow: '', description: '', slot: '', status: 'draft', startsOn: '', endsOn: '', wigIds: [] }

function toDraft(c: Collection): CollectionDraft {
  return {
    title: c.title, eyebrow: c.eyebrow, description: c.description, slot: c.slot ?? '', status: c.status,
    startsOn: c.startsOn ?? '', endsOn: c.endsOn ?? '', wigIds: c.wigIds,
  }
}

const labelCls = 'mb-1.5 block text-[12px] font-medium text-ink-soft'
const hintCls = 'mt-1.5 text-[11.5px] text-ink-faint'

function Section({ title, description, aside, children }: { title: string; description: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-medium text-ink">{title}</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function CollectionModal({ editing, onClose, onSave }: { editing: Collection | null; onClose: () => void; onSave: (d: CollectionDraft) => void }) {
  const [draft, setDraft] = useState<CollectionDraft>(editing ? toDraft(editing) : emptyDraft)
  const set = <K extends keyof CollectionDraft>(key: K, value: CollectionDraft[K]) => setDraft(d => ({ ...d, [key]: value }))
  const toggleWig = (id: string) => set('wigIds', draft.wigIds.includes(id) ? draft.wigIds.filter(w => w !== id) : [...draft.wigIds, id])
  const canSave = draft.title.trim() !== '' && draft.wigIds.length > 0

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Portal to <body> so the overlay always covers the full viewport.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-modal-title"
        className="relative flex max-h-[92dvh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-card animate-rise sm:max-h-[min(860px,calc(100dvh-3rem))] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <h2 id="collection-modal-title" className="font-display text-[24px] leading-tight text-ink">{editing ? 'Edit collection' : 'New collection'}</h2>
            <p className="mt-1 text-[13px] text-ink-muted">Feature a curated set of wigs on the customer home feed.</p>
          </div>
          <button onClick={onClose} className="-mr-1 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-ivory-deep hover:text-ink" aria-label="Close"><XIcon className="h-5 w-5" /></button>
        </div>

        <form id="collection-form" className="scroll-thin flex-1 space-y-8 overflow-y-auto px-6 py-6 sm:px-8" onSubmit={e => { e.preventDefault(); if (canSave) onSave(draft) }}>
          <Section title="Details" description="What shoppers see on the home feed.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-title" className={labelCls}>Title</label>
                <input id="c-title" autoFocus value={draft.title} onChange={e => set('title', e.target.value)} placeholder="Runway Ready" className={inputCls} />
                <p className={hintCls}>The headline a shopper reads on the home screen.</p>
              </div>
              <div>
                <label htmlFor="c-eyebrow" className={labelCls}>Eyebrow</label>
                <input id="c-eyebrow" value={draft.eyebrow} onChange={e => set('eyebrow', e.target.value)} placeholder="Curated by The Cut" className={inputCls} />
                <p className={hintCls}>The small label above the title.</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-blurb" className={labelCls}>Blurb</label>
                <textarea id="c-blurb" rows={2} value={draft.description} onChange={e => set('description', e.target.value)} placeholder="Editorial picks for those who dress to be seen." className={cn(inputCls, 'resize-none')} />
                <p className={hintCls}>One line on why this set exists.</p>
              </div>
            </div>
          </Section>

          <Section title="Placement & schedule" description="Where it appears and when it runs.">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="c-slot" className={labelCls}>Placement</label>
                <select id="c-slot" value={draft.slot} onChange={e => set('slot', e.target.value as CollectionDraft['slot'])} className={inputCls}>
                  <option value="">Standard</option>
                  <option value="hero">Hero</option>
                </select>
              </div>
              <div>
                <label htmlFor="c-status" className={labelCls}>Status</label>
                <select id="c-status" value={draft.status} onChange={e => set('status', e.target.value as CollectionDraft['status'])} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label htmlFor="c-start" className={labelCls}>Starts on</label>
                <input id="c-start" value={draft.startsOn} onChange={e => set('startsOn', e.target.value)} placeholder="Sep 15, 2026" className={inputCls} />
              </div>
              <div>
                <label htmlFor="c-end" className={labelCls}>Ends on</label>
                <input id="c-end" value={draft.endsOn} onChange={e => set('endsOn', e.target.value)} placeholder="Oct 31, 2026" className={inputCls} />
              </div>
            </div>
          </Section>

          <Section
            title="Units"
            description="Pick the wigs in this collection."
            aside={<span className="shrink-0 rounded-md bg-ivory-deep px-2 py-0.5 text-[12px] font-medium tabular-nums text-ink">{draft.wigIds.length} selected</span>}
          >
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {wigs.map(w => {
                const picked = draft.wigIds.includes(w.id)
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => toggleWig(w.id)}
                      aria-pressed={picked}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-150',
                        picked ? 'border-ink bg-ivory/60 ring-1 ring-ink' : 'border-line bg-white hover:border-line-strong hover:bg-ivory/40',
                      )}
                    >
                      <img src={w.images[0]} alt="" className="h-14 w-12 shrink-0 rounded-xl object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">{w.name}</span>
                        <span className="mt-0.5 block text-[12px] text-ink-muted">{w.brand} · {currency(w.salePrice ?? w.price)}</span>
                      </span>
                      <span className={cn('mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors', picked ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white')}>
                        {picked && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Section>
        </form>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-ivory/40 px-6 py-4 sm:px-8">
          <p className="hidden text-[12px] text-ink-muted sm:block">
            {canSave ? `${draft.wigIds.length} unit${draft.wigIds.length === 1 ? '' : 's'} · ${draft.status}` : 'Add a title and at least one unit to save.'}
          </p>
          <div className="flex w-full justify-end gap-2 sm:w-auto">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="collection-form" disabled={!canSave}>{editing ? 'Save changes' : 'Create collection'}</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
