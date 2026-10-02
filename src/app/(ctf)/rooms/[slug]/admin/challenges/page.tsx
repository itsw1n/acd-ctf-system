import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { Button } from '@/components/common/Button'
import { requireRoomOwner } from '@/features/rooms/services/requireRoom'
import {
  createChallengeAction,
  toggleChallengeActiveAction,
  updateChallengeAction,
} from '@/features/challenges/actions/challengeActions'
import {
  CreateChallengeDialog,
  EditChallengeDialog,
} from '@/features/challenges/components/ChallengeDialogs'
import {
  getChallengeForAdminEdit,
  listChallengesForAdmin,
} from '@/features/challenges/queries/challengeAdminQueries'
import { cn } from '@/lib/cn'

async function ChallengeEditModal({
  challengeId,
  roomId,
}: {
  challengeId: string
  roomId: string
}) {
  const challenge = await getChallengeForAdminEdit(challengeId, roomId)
  if (!challenge) return null

  return (
    <EditChallengeDialog challenge={challenge} action={updateChallengeAction.bind(null, roomId)} />
  )
}

export default async function RoomChallengesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { room } = await requireRoomOwner(slug)
  const challenges = await listChallengesForAdmin(room.id)

  return (
    <Section data-ui="room-admin-challenges">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              {'// Room admin'} · {room.name}
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
              Chall<span className="text-danger-bright">enges</span>
            </h1>
          </div>
          <CreateChallengeDialog action={createChallengeAction.bind(null, room.id)} />
        </div>

        <TacticalPanel label="Challenge list" className="p-5 sm:p-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left font-mono">
              <thead>
                <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-4 py-3 font-normal">Title</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 font-normal">Type</th>
                  <th className="px-4 py-3 text-right font-normal">Points</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="border-b border-border/70 text-xs">
                    <td className="max-w-[240px] truncate px-4 py-4 font-semibold">
                      {challenge.title}
                    </td>
                    <td className="px-4 py-4 text-muted">{challenge.category}</td>
                    <td className="px-4 py-4">{challenge.type}</td>
                    <td className="px-4 py-4 text-right font-bold text-danger-bright">
                      {challenge.points}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.12em]',
                          challenge.active
                            ? 'border-success/60 bg-success/5 text-success'
                            : 'border-muted/60 bg-background text-muted'
                        )}
                      >
                        {challenge.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <ChallengeEditModal challengeId={challenge.id} roomId={room.id} />
                        <form action={toggleChallengeActiveAction.bind(null, room.id)}>
                          <input type="hidden" name="id" value={challenge.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={challenge.active ? 'false' : 'true'}
                          />
                          <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            {challenge.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!challenges.length && (
              <p className="py-14 text-center font-mono text-sm text-muted">
                No challenges yet. Create the first one.
              </p>
            )}
          </div>
        </TacticalPanel>
      </Container>
    </Section>
  )
}
