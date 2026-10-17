'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon, ImageIcon, SparklesIcon, Trash2Icon, UploadCloudIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { inputCls } from '@/components/ui/field'
import type { WigStyle } from '@/lib/data/admin-data'
import { cn } from '@/lib/utils'

const PRESET_LOOKS = [
  { label: 'Straight', path: '/wig-looks/straingth.jpg' },
  { label: 'Wavy', path: '/wig-looks/wavy.jpg' },
  { label: 'Curly', path: '/wig-looks/curly.jpg' },
  { label: 'Nat. Pattern', path: '/wig-looks/natural pattern.jpg' },
  { label: 'Processed', path: '/wig-looks/processed.jpg' },
  { label: 'Cut', path: '/wig-looks/cut.jpg' },
]

interface WigStyleModalProps {
  editing: WigStyle | null
  isOpen: boolean
  onClose: () => void
  onSave: (style: { title: string; image: string; searchTerm: string }) => void
}

export function WigStyleModal({ editing, isOpen, onClose, onSave }: WigStyleModalProps) {
  const [mounted, setMounted] = useState(false)
  const [title, setTitle] = useState(editing?.title ?? '')
  const [searchTerm, setSearchTerm] = useState(editing?.searchTerm ?? '')
  const [image, setImage] = useState(editing?.image ?? PRESET_LOOKS[0].path)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (editing) {
      setTitle(editing.title)
      setSearchTerm(editing.searchTerm)
      setImage(editing.image)
      setFileName(null)
    } else {
      setTitle('')
      setSearchTerm('')
      setImage(PRESET_LOOKS[0].path)
      setFileName(null)
    }
  }, [editing, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const canSave = title.trim() !== '' && image.trim() !== ''

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editing && (!searchTerm || searchTerm === title)) {
      setSearchTerm(val)
    }
  }

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        setImage(dataUrl)
        setFileName(file.name)
        toast.success(`Uploaded "${file.name}"`)
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave({
      title: title.trim(),
      searchTerm: (searchTerm.trim() || title.trim()),
      image: image.trim(),
    })
  }

  const isPresetSelected = PRESET_LOOKS.some(look => look.path === image)
  const isCustomUploaded = image.startsWith('data:image/') || (!isPresetSelected && image.trim() !== '')

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
        aria-labelledby="wig-style-title"
        className="relative flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-card animate-rise sm:max-h-[min(820px,calc(100dvh-2rem))] sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blush-50 text-ink">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id="wig-style-title" className="font-display text-[20px] leading-tight text-ink">
                {editing ? 'Edit Wig Style' : 'Add New Wig Style'}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                Featured in “Find your texture / Shop by style” on app home feed
              </p>
            </div>
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="scroll-thin flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-7">
          {/* Card Preview */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              App Home Feed Card Preview
            </label>
            <div className="flex items-center justify-center rounded-2xl border border-line bg-ivory/60 p-4">
              <div className="group relative flex w-36 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-transform">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory-deep">
                  <img
                    src={image}
                    alt={title || 'Preview'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                </div>
                <div className="bg-white py-2.5 text-center">
                  <p className="truncate px-2 font-display text-[13.5px] font-semibold tracking-wide text-ink">
                    {title || 'Style Title'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="style-title" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Style / Texture Title <span className="text-danger-500">*</span>
            </label>
            <input
              id="style-title"
              autoFocus
              type="text"
              value={title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="e.g. Straight, Deep Wave, Pixie Cut"
              className={inputCls}
            />
            <p className="mt-1 text-[11.5px] text-ink-faint">
              This title is displayed right underneath the model photo on the home feed.
            </p>
          </div>

          {/* Search Term */}
          <div>
            <label htmlFor="style-search-term" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Search Filter Keyword
            </label>
            <input
              id="style-search-term"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="e.g. Straight, Wave, Curly, Bob"
              className={inputCls}
            />
            <p className="mt-1 text-[11.5px] text-ink-faint">
              When shoppers tap this card in the app, the catalog filters by this keyword.
            </p>
          </div>

          {/* IMAGE UPLOAD SECTION */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Upload Style Image <span className="text-danger-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11.5px] text-accent-600 hover:underline"
              >
                {showUrlInput ? 'Hide URL field' : 'Or paste image URL'}
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Drag & Drop File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all',
                isDragging
                  ? 'border-ink bg-ivory-deep/80 ring-2 ring-ink ring-offset-2'
                  : 'border-line-strong bg-ivory/30 hover:border-ink hover:bg-ivory/60',
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-xs transition-transform group-hover:scale-110">
                <UploadCloudIcon className="h-5 w-5 text-ink" />
              </div>
              <p className="mt-2.5 text-[13px] font-medium text-ink">
                <span className="font-semibold text-accent-600 underline">Click to upload</span> or drag and drop
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                PNG, JPG, or WEBP up to 10MB
              </p>

              {fileName && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-0.5 text-[11.5px] font-medium text-success-600">
                  <CheckIcon className="h-3 w-3" />
                  <span>Uploaded: {fileName}</span>
                </div>
              )}
            </div>

            {/* Optional URL Input if toggled */}
            {showUrlInput && (
              <div className="mt-3">
                <input
                  id="style-image-url"
                  type="text"
                  value={image}
                  onChange={e => {
                    setImage(e.target.value)
                    setFileName(null)
                  }}
                  placeholder="https://... or /wig-looks/..."
                  className={cn(inputCls, 'text-[12.5px]')}
                />
              </div>
            )}

            {/* Preset Looks Selector */}
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                Or select from default model presets
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PRESET_LOOKS.map(look => (
                  <button
                    key={look.path}
                    type="button"
                    onClick={() => {
                      setImage(look.path)
                      setFileName(null)
                    }}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-xl border transition-all',
                      image === look.path
                        ? 'border-ink ring-2 ring-ink ring-offset-1'
                        : 'border-line opacity-70 hover:opacity-100',
                    )}
                  >
                    <img src={look.path} alt={look.label} className="h-full w-full object-cover" />
                    {image === look.path && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center text-[9px] font-medium text-white truncate px-1">
                      {look.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {editing ? 'Save Changes' : 'Add Style to App'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
