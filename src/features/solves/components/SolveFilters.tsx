'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'

type SolveFiltersProps = {
  search: string
  teamId: string
  category: string
  teams: { id: string; name: string }[]
  categories: string[]
}

export function SolveFilters({
  search: initialSearch,
  teamId,
  category,
  teams,
  categories,
}: SolveFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilters(next: { search?: string; teamId?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString())
    const nextSearch = next.search ?? params.get('search') ?? initialSearch
    const nextTeamId = next.teamId ?? params.get('teamId') ?? teamId
    const nextCategory = next.category ?? params.get('category') ?? category

    if (nextSearch.trim()) params.set('search', nextSearch.trim())
    else params.delete('search')
    if (nextTeamId) params.set('teamId', nextTeamId)
    else params.delete('teamId')
    if (nextCategory) params.set('category', nextCategory)
    else params.delete('category')

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
      <SearchBar
        value={initialSearch}
        onSearch={(value) => updateFilters({ search: value })}
        placeholder="Search player, alias, or challenge"
        aria-label="Search solves"
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
      <Select
        name="category"
        defaultValue={category || 'all'}
        onChange={(value) => updateFilters({ category: value === 'all' ? '' : value })}
        aria-label="Filter by category"
        placeholder="All categories"
        options={[
          { id: 'all', label: 'All categories' },
          ...categories.map((value) => ({ id: value, label: value })),
        ]}
      />
    </div>
  )
}
