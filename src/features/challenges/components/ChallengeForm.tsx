'use client'

import { useActionState } from 'react'
import { Label, TextField } from 'react-aria-components'
import { ChevronDown, Save } from 'lucide-react'

import type { ChallengeActionState } from '@/features/challenges/actions/challengeActions'
import type { ChallengeEditRow } from '@/features/challenges/types'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { TacticalPanel } from '@/components/common/TacticalPanel'

const inputWrap = 'relative'
const labelClass =
  'mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted'
const textareaClass =
  'clip-input min-h-28 w-full border border-border-strong bg-background/90 px-4 py-3 font-mono text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-danger'
const selectClass =
  'clip-input h-12 w-full appearance-none border border-border-strong bg-background/90 pl-4 pr-11 font-mono text-sm text-foreground outline-none transition focus:border-danger'

export function ChallengeForm({
  mode,
  initial,
  action,
}: {
  mode: 'create' | 'edit'
  initial?: ChallengeEditRow
  action: (previous: ChallengeActionState, formData: FormData) => Promise<ChallengeActionState>
}) {
  const [state, formAction, pending] = useActionState(action, {} as ChallengeActionState)

  return (
    <TacticalPanel
      label={mode === 'create' ? 'New challenge' : 'Edit challenge'}
      index={mode === 'create' ? '01' : '02'}
      className="mx-auto max-w-2xl p-5 sm:p-7"
    >
      <form action={formAction} className="space-y-5">
        {initial && <input type="hidden" name="id" value={initial.id} />}

        <TextField name="title" isRequired>
          <Label className={labelClass}>Title</Label>
          <div className={inputWrap}>
            <Input placeholder="Welcome Flag" defaultValue={initial?.title ?? ''} />
          </div>
        </TextField>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="category" isRequired>
            <Label className={labelClass}>Category</Label>
            <Input placeholder="Misc" defaultValue={initial?.category ?? ''} />
          </TextField>

          <div>
            <Label htmlFor="type" className={labelClass}>
              Type
            </Label>
            <div className={inputWrap}>
              <select
                id="type"
                name="type"
                required
                defaultValue={initial?.type ?? 'TEXT'}
                className={selectClass}
              >
                <option value="TEXT">TEXT</option>
                <option value="FILE">FILE</option>
                <option value="EXTERNAL">EXTERNAL</option>
              </select>
              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-danger"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className={labelClass}>
            Description
          </Label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={4000}
            defaultValue={initial?.description ?? ''}
            placeholder="Describe the challenge for players."
            className={textareaClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="points" isRequired>
            <Label className={labelClass}>Points</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              step={1}
              inputMode="numeric"
              defaultValue={initial?.points ?? 50}
            />
          </TextField>

          <TextField name="flag" type="password">
            <Label className={labelClass}>
              Flag{mode === 'edit' ? ' (blank keeps current)' : ''}
            </Label>
            <Input
              placeholder={mode === 'edit' ? 'Leave blank to keep current flag' : 'ACD{...}'}
              autoComplete="off"
              spellCheck={false}
            />
          </TextField>
        </div>

        <TextField name="externalUrl">
          <Label className={labelClass}>External URL (EXTERNAL only)</Label>
          <Input
            type="url"
            inputMode="url"
            placeholder="https://challenge.example.com"
            defaultValue={initial?.externalUrl ?? ''}
          />
        </TextField>

        <TextField name="fileUrl">
          <Label className={labelClass}>File URL (FILE only)</Label>
          <Input
            type="url"
            inputMode="url"
            placeholder="https://files.example.com/challenge.zip"
            defaultValue={initial?.fileUrl ?? ''}
          />
        </TextField>

        <label
          htmlFor="active"
          className="flex cursor-pointer items-center gap-3 border border-border bg-background/75 px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-muted"
        >
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 accent-[#e32636]"
          />
          Active challenge
        </label>

        {state.error && (
          <p
            role="alert"
            className="border-l-2 border-danger pl-3 font-mono text-xs text-danger-bright"
          >
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" isPending={pending} className="w-full sm:w-auto">
          <Save size={18} aria-hidden />
          {pending ? 'Saving...' : mode === 'create' ? 'Create challenge' : 'Save changes'}
        </Button>
      </form>
    </TacticalPanel>
  )
}
