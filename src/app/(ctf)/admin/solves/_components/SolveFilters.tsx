'use client'

import { usePathname, useRouter } from 'next/navigation'

import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/ui/select/Select'

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

  function updateFilters(next: { search?: string; teamId?: string; category?: string }) {
    const params = new URLSearchParams()
    const nextSearch = next.search ?? initialSearch
    const nextTeamId = next.teamId ?? teamId
    const nextCategory = next.category ?? category

    if (nextSearch.trim()) params.set('search', nextSearch.trim())
    if (nextTeamId) params.set('teamId', nextTeamId)
    if (nextCategory) params.set('category', nextCategory)

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
        defaultValue={teamId}
        onChange={(value) => updateFilters({ teamId: value })}
        aria-label="Filter by team"
        placeholder="All teams"
        options={teams.map((team) => ({ id: team.id, label: team.name }))}
      />
      <Select
        name="category"
        defaultValue={category}
        onChange={(value) => updateFilters({ category: value })}
        aria-label="Filter by category"
        placeholder="All categories"
        options={categories.map((value) => ({ id: value, label: value }))}
      />
    </div>
  )
}
