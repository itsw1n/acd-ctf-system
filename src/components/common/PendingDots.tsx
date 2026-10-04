export function PendingDots({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-baseline gap-0">
      <span aria-hidden className="pending-dots inline-block w-[3ch] text-left" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
