import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { TacticalPanel } from '@/components/common/TacticalPanel'
import { requireRoomOwner } from '@/features/rooms/services/requireRoom'
import { setMemberLockedAction } from '@/features/rooms/actions/roomActions'
import { listRoomMembers } from '@/features/rooms/services/roomService'
import { MemberRowActions } from '@/features/rooms/components/MemberRowActions'

export default async function RoomMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { room } = await requireRoomOwner(slug)
  const members = await listRoomMembers(room.id)

  return (
    <Section data-ui="room-admin-members">
      <Container>
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {'// Room admin'} · {room.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-6xl">
            Mem<span className="text-danger-bright">bers</span>
          </h1>
        </div>

        <div className="grid gap-5">
          <TacticalPanel label="Members" className="p-5 sm:p-7">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left font-mono">
                <thead>
                  <tr className="border-y border-border bg-background/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                    <th className="px-4 py-3 font-normal">Alias</th>
                    <th className="px-4 py-3 font-normal">Team</th>
                    <th className="px-4 py-3 font-normal">Role</th>
                    <th className="px-4 py-3 font-normal">Access</th>
                    <th className="px-4 py-3 text-right font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.playerId} className="border-b border-border/70 text-xs">
                      <td className="px-4 py-4 font-bold text-danger-bright">{member.alias}</td>
                      <td className="px-4 py-4 text-muted">{member.team}</td>
                      <td className="px-4 py-4">{member.role}</td>
                      <td className="px-4 py-4">
                        {member.accessLocked ? (
                          <span className="text-warning">Locked</span>
                        ) : (
                          <span className="text-success">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {member.role === 'PARTICIPANT' ? (
                          <MemberRowActions
                            roomId={room.id}
                            playerId={member.playerId}
                            locked={member.accessLocked}
                            lockAction={setMemberLockedAction}
                          />
                        ) : (
                          <span className="text-muted">Owner</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!members.length && (
                <p className="py-14 text-center font-mono text-sm text-muted">No members yet.</p>
              )}
            </div>
          </TacticalPanel>

        </div>
      </Container>
    </Section>
  )
}
