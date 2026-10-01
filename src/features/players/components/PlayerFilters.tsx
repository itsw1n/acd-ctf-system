'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'

type PlayerFiltersProps = {
  search: string
  teamId: string
  teams: { id: string; name: string }[]
}

export function PlayerFilters({ search, teamId, teams }: PlayerFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilters(next: { search?: string; teamId?: string }) {
    const params = new URLSearchParams(searchParams.toString())
    const nextSearch = next.search ?? params.get('search') ?? search
    const nextTeamId = next.teamId ?? params.get('teamId') ?? teamId

    if (nextSearch.trim()) params.set('search', nextSearch.trim())
    else params.delete('search')
    if (nextTeamId) params.set('teamId', nextTeamId)
    else params.delete('teamId')

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
      <SearchBar
        value={search}
        onSearch={(value) => updateFilters({ search: value })}
        placeholder="Search alias or full name"
        aria-label="Search by alias or full name"
      />
      <Select
        name="teamId"
        defaultValue={teamId || 'all'}
        onChange={(value) => updateFilters({ teamId: value === 'all' ? '' : value })}
        aria-label="Filter by team"
        placeholder="All teams"
        options={[
          { id: 'all', label: 'All teams' },
          ...teams.map((team) => ({ id: team.id, label: team.name })),
        ]}
      />
    </div>
  )
}
