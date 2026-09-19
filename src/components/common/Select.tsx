'use client'

import { useState } from 'react'
import type { Key } from 'react-aria-components'
import {
  Button,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export type SelectOption = {
  id: string
  label: string
  isDisabled?: boolean
}

type SelectProps = {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  label?: string
  id?: string
  name?: string
  required?: boolean
  isDisabled?: boolean
  className?: string
  onChange?: (value: string) => void
  'aria-label'?: string
}

/**
 * Shared single-value select. Generic presentation + interaction only —
 * options and state ownership stay with the feature using it.
 *
 * Controlled when `value` is provided, otherwise uncontrolled (seeded from
 * `defaultValue`, which stays in sync for URL-driven filters). Optional
 * selects toggle back to empty when the current item is picked again.
 *
 * Appearance reuses the existing input system (h-12 clip-input trigger,
 * danger accents, selected check) — React Aria owns accessibility,
 * keyboard navigation, and popover behavior.
 */
export function Select({
  className,
  defaultValue,
  id,
  isDisabled,
  label,
  name,
  onChange,
  options,
  placeholder,
  required,
  value,
  'aria-label': ariaLabel,
}: SelectProps) {
  const selectId = id ?? name
  const isControlled = value !== undefined
  const [internalKey, setInternalKey] = useState<Key | null>(defaultValue || null)
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue)

  // URL-driven filters change defaultValue without remounting (e.g. browser
  // back navigation). Sync render-phase state instead of an effect.
  if (!isControlled && prevDefaultValue !== defaultValue) {
    setPrevDefaultValue(defaultValue)
    setInternalKey(defaultValue || null)
  }

  const selectedKey = isControlled ? value || null : internalKey

  return (
    <AriaSelect
      id={selectId}
      name={name}
      selectedKey={selectedKey}
      isRequired={required}
      isDisabled={isDisabled}
      onSelectionChange={(key) => {
        const isSameSelection = key === selectedKey
        const nextKey = !required && isSameSelection ? null : key
        if (!isControlled) setInternalKey(nextKey)
        onChange?.(nextKey ? String(nextKey) : '')
      }}
      aria-label={label ? undefined : ariaLabel}
      className="group relative"
    >
      {({ isOpen }) => (
        <>
          {label && (
            <Label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              {label}
            </Label>
          )}
          <Button
            className={cn(
              'clip-input flex h-12 w-full items-center justify-between border border-border-strong bg-background/90 px-4 text-left font-mono text-sm text-foreground outline-none transition hover:border-danger/70 focus-visible:border-danger focus-visible:shadow-[inset_0_0_18px_rgba(227,38,54,.05),0_0_10px_rgba(227,38,54,.08)] disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
          >
            <SelectValue>{({ selectedText }) => selectedText || placeholder || ''}</SelectValue>
            <ChevronDown
              size={17}
              aria-hidden
              className={cn('text-danger transition-transform', isOpen && 'rotate-180')}
            />
          </Button>
          <Popover
            offset={4}
            className="w-[var(--trigger-width)] overflow-hidden border border-danger/70 bg-surface shadow-[0_0_28px_rgba(0,0,0,.55),0_0_18px_rgba(227,38,54,.12)] entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
          >
            <ListBox
              items={options}
              className="max-h-64 overflow-y-auto p-1 outline-none"
              renderEmptyState={() => null}
            >
              {(option) => (
                <ListBoxItem
                  id={option.id as Key}
                  textValue={option.label}
                  isDisabled={option.isDisabled}
                  className="group flex cursor-pointer items-center justify-between px-3 py-3 font-mono text-sm text-foreground outline-none transition hover:bg-danger/15 focus:bg-danger/20 focus:text-white data-[selected]:bg-danger/25 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                >
                  {option.label}
                  <Check
                    size={15}
                    aria-hidden
                    className="text-danger opacity-0 group-data-[selected]:opacity-100"
                  />
                </ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </>
      )}
    </AriaSelect>
  )
}
