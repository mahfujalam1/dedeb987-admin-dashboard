const block = 'animate-shimmer rounded-xl bg-[linear-gradient(90deg,var(--color-ivory-deep)_0%,var(--color-line-soft)_50%,var(--color-ivory-deep)_100%)] bg-[length:200%_100%]'

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className={`${block} h-3 w-24`} />
      <div className={`${block} mt-3 h-8 w-64`} />
      <div className={`${block} mt-3 h-4 w-80 max-w-full`} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className={`${block} h-28 rounded-2xl`} />)}
      </div>
      <div className={`${block} mt-6 h-72 rounded-2xl`} />
    </div>
  )
}
