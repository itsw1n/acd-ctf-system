import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Skeleton, SkeletonTable } from '@/components/common/Skeleton'
import { TacticalPanel } from '@/components/common/TacticalPanel'

/**
 * Player-area loading fallback. Skeleton blocks (no spinners) mirroring
 * the page heading + data panel layout while server data streams in.
 */
export default function CtfLoading() {
  return (
    <Section data-ui="page-loading">
      <Container>
        <div role="status" aria-label="Loading content">
          <span className="sr-only">Loading content…</span>
          <div className="mb-8" aria-hidden>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-10 w-2/3 sm:h-14" />
            <Skeleton className="mt-3 h-3 w-1/2" />
          </div>
          <TacticalPanel label="Loading" className="p-5 sm:p-7">
            <SkeletonTable />
          </TacticalPanel>
        </div>
      </Container>
    </Section>
  )
}
