'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileTextIcon, ShieldIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/page-header'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { initialPrivacyHtml } from '@/lib/data/legal-data'

export default function PrivacyEditPage() {
  const router = useRouter()
  const [content, setContent] = useState(initialPrivacyHtml)
  const [lastSaved, setLastSaved] = useState('Aug 1, 2026')
  const [isSaving, setIsSaving] = useState(false)

  // Load saved content from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thecut_legal_privacy')
      const savedDate = localStorage.getItem('thecut_legal_privacy_date')
      if (saved) setContent(saved)
      if (savedDate) setLastSaved(savedDate)
    } catch {
      // localStorage fallback
    }
  }, [])

  const handleSave = (newContent: string) => {
    setIsSaving(true)
    const now = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())
    try {
      localStorage.setItem('thecut_legal_privacy', newContent)
      localStorage.setItem('thecut_legal_privacy_date', now)
    } catch {
      // ignore
    }
    setContent(newContent)
    setLastSaved(now)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Privacy policy published successfully!')
    }, 400)
  }

  const handleCancel = () => {
    router.push('/admin/settings')
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/admin/settings" className="text-[12.5px] text-ink-muted hover:text-ink">
          ← Back to settings
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/settings/terms"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1 text-[12px] font-medium text-ink-muted hover:border-ink hover:text-ink transition-colors"
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            <span>Switch to Terms of Service</span>
          </Link>
        </div>
      </div>

      <div className="mt-3">
        <PageHeader
          eyebrow="Legal Documents"
          title="Privacy Policy Editor"
          description={`Edit privacy and data disclosure statements shown in the app. Last published ${lastSaved}.`}
        />
      </div>

      <div className="mt-6">
        <RichTextEditor
          initialValue={content}
          placeholder="Start with a heading, then write each clause as its own section..."
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      </div>
    </>
  )
}
