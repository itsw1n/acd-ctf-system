'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/common/Input'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'

export function SearchBar({
  value,
  onSearch,
  placeholder = 'Search',
  'aria-label': ariaLabel = 'Search',
}: {
  value: string
  onSearch: (value: string) => void
  placeholder?: string
  'aria-label'?: string
}) {
  const [inputValue, setInputValue] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const debouncedValue = useDebouncedValue(inputValue)

  // Parent-driven value changes (e.g. URL reset) sync render-phase state
  // instead of an effect.
  if (prevValue !== value) {
    setPrevValue(value)
    setInputValue(value)
  }

  useEffect(() => {
    if (debouncedValue !== value) onSearch(debouncedValue)
  }, [debouncedValue, onSearch, value])

  return (
    <div className="relative">
      <Search
        size={16}
        aria-hidden
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
      />
      <Input
        value={inputValue}
        onChange={(event) => setInputValue(event.currentTarget.value)}
        placeholder={placeholder}
        className="pl-11"
        aria-label={ariaLabel}
      />
    </div>
  )
}
