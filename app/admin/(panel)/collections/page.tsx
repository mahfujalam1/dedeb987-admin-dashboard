'use client'
import { useState } from 'react'
import { DownloadIcon, GripVerticalIcon, LayersIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { CollectionModal, type CollectionDraft } from '@/components/admin/collection-modal'
import { EmptyState } from '@/components/ui/states'
import { Tag, type TagTone } from '@/components/ui/tag'
import { useAdmin } from '@/context/admin-context'
import { useConfirm } from '@/context/confirm-context'
import type { Collection } from '@/lib/data/admin-data'
import { wigById } from '@/lib/data/wigs'
import { downloadCollectionsGuide } from '@/lib/download-collections-guide'
import { cn } from '@/lib/utils'

const statusTone: Record<Collection['status'], TagTone> = { live: 'success', draft: 'warn', archived: 'default' }
const today = () => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())

export default function CollectionsPage() {
  const { collections, addCollection, updateCollection, deleteCollection, publishCollection, archiveCollection } = useAdmin()
  const [modal, setModal] = useState<{ open: boolean; editing: Collection | null }>({ open: false, editing: null })
  const confirm = useConfirm()
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sorted = [...collections].sort((a, b) => a.position - b.position)

  function onDownload() {
    try {
      downloadCollectionsGuide()
    } catch {
      toast.error('The collections guide isn’t available yet.')
    }
  }

  function save(d: CollectionDraft) {
    const fields = {
      title: d.title.trim(), eyebrow: d.eyebrow.trim(), description: d.description.trim(), wigIds: d.wigIds,
      status: d.status, slot: d.slot || undefined, startsOn: d.startsOn.trim() || undefined, endsOn: d.endsOn.trim() || undefined,
      updatedAt: today(),
    }
    // Only one collection can hold the hero slot.
    if (fields.slot === 'hero') {
      collections.filter(c => c.slot === 'hero' && c.id !== modal.editing?.id).forEach(c => updateCollection(c.id, { slot: undefined }))
    }
    if (modal.editing) {
      updateCollection(modal.editing.id, fields)
      toast.success('Collection updated')
    } else {
      const position = collections.reduce((max, c) => Math.max(max, c.position), 0) + 1
      addCollection({ ...fields, position, createdAt: today() })
      toast.success('Collection created')
    }
    setModal({ open: false, editing: null })
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return
    const ids = sorted.map(c => c.id).filter(id => id !== dragId)
    ids.splice(ids.indexOf(targetId), 0, dragId)
    ids.forEach((id, i) => updateCollection(id, { position: i + 1 }))
    toast.success('Collection order updated')
  }

  async function onDelete(c: Collection) {
    const ok = await confirm({
      title: `Delete “${c.title}”?`,
      body: 'It will be removed from the home feed and from this list.',
      confirmLabel: 'Delete collection',
      tone: 'danger',
    })
    if (!ok) return
    deleteCollection(c.id)
    toast.success('Collection deleted', { action: { label: 'Undo', onClick: () => addCollection(c) } })
  }

  return (
    <>
      <PageHeader
        eyebrow="Growth"
        title="Collections"
        description="Curate editorial collections featured on the customer home feed."
        actions={
          <>
            <Button variant="outline" icon={<DownloadIcon className="h-4 w-4" />} onClick={onDownload} className="font-medium text-ink-soft">Download guide</Button>
            <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setModal({ open: true, editing: null })}>New collection</Button>
          </>
        }
      />

      <div className="mt-7 space-y-4">
        {sorted.length === 0 && (
          <div className="rounded-2xl border border-line bg-white">
            <EmptyState icon={<LayersIcon className="h-5 w-5" />} title="No collections yet" body="Create a collection to feature it on the home feed." />
          </div>
        )}
        {sorted.map(c => (
          <div
            key={c.id}
            onDragOver={e => { e.preventDefault(); setOverId(c.id) }}
            onDragLeave={() => setOverId(id => (id === c.id ? null : id))}
            onDrop={() => { onDrop(c.id); setDragId(null); setOverId(null) }}
            className={cn(
              'flex gap-3 rounded-2xl border bg-white p-5 transition-colors duration-150',
              overId === c.id && dragId !== c.id ? 'border-ink' : 'border-line',
              dragId === c.id && 'opacity-50',
            )}
          >
            <span
              draggable
              onDragStart={e => { setDragId(c.id); e.dataTransfer.effectAllowed = 'move' }}
              onDragEnd={() => { setDragId(null); setOverId(null) }}
              className="mt-0.5 h-fit cursor-grab text-ink-faint hover:text-ink-muted active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVerticalIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {c.eyebrow && <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-faint">{c.eyebrow}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-[15.5px] font-medium text-ink">{c.title}</p>
                    <Tag tone={statusTone[c.status]}>{c.status}</Tag>
                    {c.slot === 'hero' && <Tag tone="violet">hero</Tag>}
                  </div>
                </div>
                <p className="shrink-0 text-[12px] text-ink-faint">{c.wigIds.length} units · {c.updatedAt}</p>
              </div>
              {c.description && <p className="mt-1.5 text-[13px] text-ink-muted">{c.description}</p>}
              <div className="mt-3 flex gap-1.5">
                {c.wigIds.map(id => {
                  const w = wigById(id)
                  return w ? <img key={id} src={w.images[0]} alt={w.name} title={w.name} className="h-9 w-9 rounded-lg object-cover" /> : null
                })}
              </div>
              {(c.startsOn || c.endsOn) && (
                <p className="mt-2 text-[12px] text-ink-faint">
                  {[c.startsOn && `Starts ${c.startsOn}`, c.endsOn && `Ends ${c.endsOn}`].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {c.status === 'live' ? (
                  <Button size="sm" variant="outline" onClick={() => { archiveCollection(c.id); toast.success(`${c.title} archived`) }}>Archive</Button>
                ) : (
                  <Button size="sm" onClick={() => { publishCollection(c.id); toast.success(`${c.title} is now live`) }}>Publish</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setModal({ open: true, editing: c })}>Edit</Button>
                <button onClick={() => onDelete(c)} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12.5px] text-danger-500 transition-colors hover:bg-danger-50">
                  <Trash2Icon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <CollectionModal
          key={modal.editing?.id ?? 'new'}
          editing={modal.editing}
          onClose={() => setModal({ open: false, editing: null })}
          onSave={save}
        />
      )}
    </>
  )
}
