import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { requireAccount } from '@/features/rooms/services/requireRoom'
import { joinRoomByCodeAction } from '@/features/rooms/actions/roomActions'
import { getJoinPreview } from '@/features/rooms/services/roomService'
import { JoinCodeContinueForm } from '@/features/rooms/components/JoinCodeContinueForm'
import { JoinRoomForm } from '@/features/rooms/components/JoinRoomForm'

export default async function JoinRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  await requireAccount()
  const params = await searchParams
  const code = (params.code ?? '').trim().toUpperCase()

  if (!code) {
    return (
      <Section data-ui="room-join">
        <Container>
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Rooms'}</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              Join a <span className="text-danger-bright">room</span>
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
              Enter the join code shared by the host.
            </p>
          </div>

          <TacticalPanel label="Join code" className="mx-auto max-w-2xl p-5 sm:p-7">
            <JoinCodeContinueForm />
          </TacticalPanel>
        </Container>
      </Section>
    )
  }

  const preview = await getJoinPreview(code)
  if (!preview) {
    return (
      <Section data-ui="room-join">
        <Container>
          <TacticalPanel label="Join code" className="mx-auto max-w-2xl p-5 sm:p-7">
            <p role="alert" className="font-mono text-sm text-danger-bright">
              Unknown join code. Check the value and try again.
            </p>
          </TacticalPanel>
        </Container>
      </Section>
    )
  }

  return (
    <Section data-ui="room-join">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{'// Rooms'}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Join a <span className="text-danger-bright">room</span>
          </h1>
        </div>

        <JoinRoomForm
          code={code}
          roomName={preview.room.name}
          teams={preview.teams}
          action={joinRoomByCodeAction}
        />
      </Container>
    </Section>
  )
}
