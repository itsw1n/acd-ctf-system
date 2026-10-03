import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Skeleton, SkeletonTable } from '@/components/common/Skeleton'
import { TacticalPanel } from '@/components/common/TacticalPanel'

export default function BrowseRoomsLoading() {
  return (
    <Section data-ui="page-loading">
      <Container>
        <div role="status" aria-label="Loading rooms">
          <span className="sr-only">Loading rooms…</span>
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
