'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { CheckIcon, RotateCcwIcon, SaveIcon } from 'lucide-react'
import 'react-quill-new/dist/quill.snow.css'
import { Button } from '@/components/ui/button'

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-2xl border border-line bg-white text-[13px] text-ink-muted">
      Loading editor...
    </div>
  ),
})

interface RichTextEditorProps {
  initialValue: string
  placeholder?: string
  onSave: (content: string) => void
  onCancel?: () => void
  isSaving?: boolean
}

export function RichTextEditor({
  initialValue,
  placeholder = 'Start with a heading, then write each clause as its own section...',
  onSave,
  onCancel,
  isSaving = false,
}: RichTextEditorProps) {
  const [content, setContent] = useState(initialValue)
  const [hasChanged, setHasChanged] = useState(false)

  useEffect(() => {
    setContent(initialValue)
    setHasChanged(false)
  }, [initialValue])

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block', 'link', 'image', 'video'],
        ['clean'],
      ],
    }),
    [],
  )

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'align',
    'list',
    'bullet',
    'indent',
    'blockquote',
    'code-block',
    'link',
    'image',
    'video',
  ]

  // Calculate text statistics
  const { words, characters, readingTime } = useMemo(() => {
    // Strip HTML tags for accurate metrics
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordList = text ? text.split(/\s+/) : []
    const wordCount = wordList.length
    const charCount = text.length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))
    return { words: wordCount, characters: charCount, readingTime: readTime }
  }, [content])

  const handleChange = (val: string) => {
    setContent(val)
    setHasChanged(true)
  }

  const handleSave = () => {
    onSave(content)
    setHasChanged(false)
  }

  return (
    <div className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] shadow-sm">
      {/* Custom Scoped Styles for Quill to match the screenshot perfectly */}
      <style jsx global>{`
        .rich-editor-wrapper .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #E2E8F0 !important;
          background: #F8FAFC;
          padding: 10px 14px;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          font-family: inherit;
        }
        .rich-editor-wrapper .ql-toolbar.ql-snow .ql-picker-label {
          color: #475569;
          font-weight: 500;
        }
        .rich-editor-wrapper .ql-toolbar.ql-snow .ql-stroke {
          stroke: #475569;
        }
        .rich-editor-wrapper .ql-toolbar.ql-snow .ql-fill {
          fill: #475569;
        }
        .rich-editor-wrapper .ql-toolbar.ql-snow button:hover .ql-stroke,
        .rich-editor-wrapper .ql-toolbar.ql-snow .ql-picker:hover .ql-stroke {
          stroke: #0F172A;
        }
        .rich-editor-wrapper .ql-toolbar.ql-snow button:hover .ql-fill,
        .rich-editor-wrapper .ql-toolbar.ql-snow .ql-picker:hover .ql-fill {
          fill: #0F172A;
        }
        .rich-editor-wrapper .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
          padding: 16px;
        }
        .rich-editor-wrapper .ql-editor {
          min-height: 480px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 12px;
          padding: 24px 28px;
          font-size: 14.5px;
          line-height: 1.7;
          color: #1E293B;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
        }
        .rich-editor-wrapper .ql-editor.ql-blank::before {
          color: #94A3B8;
          font-style: normal;
          left: 28px;
          right: 28px;
        }
        .rich-editor-wrapper .ql-editor h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0F172A;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
        }
        .rich-editor-wrapper .ql-editor h2 {
          font-size: 1.35rem;
          font-weight: 600;
          color: #0F172A;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .rich-editor-wrapper .ql-editor p {
          margin-bottom: 0.85rem;
        }
        .rich-editor-wrapper .ql-editor ul,
        .rich-editor-wrapper .ql-editor ol {
          padding-left: 1.5rem;
          margin-bottom: 0.85rem;
        }
      `}</style>

      {/* Editor Main Canvas */}
      <div className="rich-editor-wrapper flex-1">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>

      {/* Bottom Status & Actions Footer */}
      <div className="flex flex-col gap-3 border-t border-[#E2E8F0] bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between rounded-b-2xl">
        {/* Statistics */}
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-slate-500">
          <span>{words} words</span>
          <span>•</span>
          <span>{characters} characters</span>
          <span>•</span>
          <span>~{readingTime} min read</span>
          {hasChanged && (
            <>
              <span>•</span>
              <span className="text-amber-600 font-normal italic">Unsaved changes</span>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
          >
            <SaveIcon className="h-4 w-4" />
            <span>{isSaving ? 'Publishing...' : 'Publish changes'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
