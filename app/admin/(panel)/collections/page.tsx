'use client'
import { useState } from 'react'
import { Edit3Icon, PlusIcon, SearchIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { Button } from '@/components/ui/button'
import { WigStyleModal } from '@/components/admin/wig-style-modal'
import { useConfirm } from '@/context/confirm-context'
import { initialWigStyles, type WigStyle } from '@/lib/data/admin-data'

export default function CollectionsPage() {
  const [styleModal, setStyleModal] = useState<{ open: boolean; editing: WigStyle | null }>({ open: false, editing: null })
  const [wigStyles, setWigStyles] = useState<WigStyle[]>(initialWigStyles)
  const confirm = useConfirm()

  // Wig Styles handlers
  const handleSaveStyle = (data: { title: string; image: string; searchTerm: string }) => {
    if (styleModal.editing) {
      setWigStyles(styles =>
        styles.map(s => (s.id === styleModal.editing?.id ? { ...s, ...data } : s))
      )
      toast.success(`Wig style "${data.title}" updated`)
    } else {
      const newStyle: WigStyle = {
        id: `style-${Date.now()}`,
        ...data,
        active: true,
        position: wigStyles.length + 1,
      }
      setWigStyles(styles => [...styles, newStyle])
      toast.success(`Wig style "${data.title}" added to app home feed`)
    }
    setStyleModal({ open: false, editing: null })
  }

  const handleDeleteStyle = async (style: WigStyle) => {
    const ok = await confirm({
      title: `Remove "${style.title}" style?`,
      body: `This style card will be removed from the "Find your texture" section on the app home feed.`,
      confirmLabel: 'Delete style',
      tone: 'danger',
    })
    if (!ok) return
    setWigStyles(styles => styles.filter(s => s.id !== style.id))
    toast.success(`Wig style "${style.title}" removed`)
  }

  return (
    <>
      <PageHeader
        eyebrow="Growth"
        title="Featured Collections & Styles"
        description="Manage the “Shop by style / Find your texture” section featured on the customer app home feed."
        actions={
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setStyleModal({ open: true, editing: null })}>
            Add wig style
          </Button>
        }
      />

      <div className="mt-7 space-y-6">
        {/* Header Preview Banner matching App visual */}
        <div className="rounded-2xl border border-line bg-gradient-to-r from-ivory to-blush-50/40 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-serif italic text-[14px] text-ink-muted">Shop by style</p>
              <h3 className="mt-0.5 font-display text-[26px] tracking-tight text-ink">Find your texture</h3>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
                These cards appear directly on the customer mobile app home feed under the <strong>“Shop by style”</strong> section.
                When a customer taps any card, the app instantly filters the catalog with that texture query.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft shadow-2xs">
              <SparklesIcon className="h-3.5 w-3.5 text-accent-500" />
              <span>{wigStyles.length} active styles</span>
            </div>
          </div>
        </div>

        {/* Grid of Wig Styles matching the Mobile Screenshot */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {wigStyles.map(style => (
            <div
              key={style.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xs transition-all hover:shadow-card"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory-deep">
                <img
                  src={style.image}
                  alt={style.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay action buttons */}
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setStyleModal({ open: true, editing: style })}
                    className="rounded-lg bg-white p-2 text-ink shadow-sm transition-transform hover:scale-110"
                    title="Edit Style"
                  >
                    <Edit3Icon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStyle(style)}
                    className="rounded-lg bg-danger-500 p-2 text-white shadow-sm transition-transform hover:scale-110"
                    title="Delete Style"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* White bottom bar with Title */}
              <div className="flex flex-col items-center justify-center bg-white px-2 py-3 text-center">
                <p className="truncate font-display text-[15px] font-medium tracking-wide text-ink">
                  {style.title}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-ivory px-2 py-0.5 text-[10.5px] font-medium text-ink-muted">
                  <SearchIcon className="h-2.5 w-2.5" />
                  {style.searchTerm}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setStyleModal({ open: true, editing: null })}
          >
            Add wig style
          </Button>
        </div>
      </div>

      {/* Wig Style Modal */}
      <WigStyleModal
        editing={styleModal.editing}
        isOpen={styleModal.open}
        onClose={() => setStyleModal({ open: false, editing: null })}
        onSave={handleSaveStyle}
      />
    </>
  )
}
