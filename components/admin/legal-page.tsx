import Link from 'next/link'
import { PageHeader } from '@/components/admin/page-header'
import { Panel } from '@/components/admin/panel'

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { heading: string; body: string }[] }) {
  return (
    <>
      <Link href="/admin/settings" className="text-[12.5px] text-ink-muted hover:text-ink">← Back to settings</Link>
      <div className="mt-3">
        <PageHeader eyebrow="Legal" title={title} description={`Last updated ${updated}`} />
      </div>
      <Panel className="mt-7">
        <div className="max-w-[68ch] space-y-6">
          {sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="text-[14px] font-semibold text-ink">{i + 1}. {s.heading}</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{s.body}</p>
            </section>
          ))}
        </div>
      </Panel>
    </>
  )
}
