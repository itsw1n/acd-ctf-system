import type { ReactNode } from 'react'

import { requireRoomMember } from '@/features/rooms/services/requireRoom'
import { RoomTabs } from '@/features/rooms/components/RoomTabs'

export default async function RoomLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { membership } = await requireRoomMember(slug)

  return (
    <div className="space-y-5">
      <RoomTabs slug={slug} isOwner={membership.role === 'OWNER'} />
      {children}
    </div>
  )
}
