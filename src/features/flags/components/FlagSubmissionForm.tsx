'use client'

import { useActionState } from 'react'
import { Label, TextField } from 'react-aria-components'
import { AlertTriangle, CheckCircle2, ChevronRight, Flag, RotateCcw } from 'lucide-react'
import { submitFlagAction, type FlagState } from '@/features/flags/actions/flagActions'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { cn } from '@/lib/cn'

const initialState: FlagState = {}

export function FlagSubmissionForm() {
  const [state, action, pending] = useActionState(submitFlagAction, initialState)

  return (
    <form action={action} className="mt-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <TextField name="flag" isRequired>
          <Label className="mb-2 inline-flex items-center gap-2 bg-background px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <Flag size={12} className="text-danger" aria-hidden />
            Flag token
          </Label>
          <Input
            autoComplete="off"
            spellCheck={false}
            placeholder="ACD{____________________________}"
            className="h-16 px-5 text-lg tracking-[0.08em] placeholder:text-muted/45 focus:shadow-[inset_0_0_22px_rgba(227,38,54,.06),0_0_12px_rgba(227,38,54,.12)]"
          />
        </TextField>

        <Button type="submit" size="lg" isPending={pending} className="h-16 self-end">
          <ChevronRight size={20} aria-hidden />
          {pending ? 'Validating...' : 'Submit flag'}
        </Button>
      </div>

      {state.message && (
        <div
          role="status"
          className={cn(
            'mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 border px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.09em]',
            state.status === 'correct' && 'border-success/70 bg-success/5 text-success',
            state.status === 'duplicate' && 'border-warning/60 bg-warning/5 text-warning',
            (state.status === 'incorrect' || state.status === 'error') &&
              'border-danger/60 bg-primary/10 text-danger-bright'
          )}
        >
          {state.status === 'correct' ? (
            <CheckCircle2 size={16} aria-hidden />
          ) : state.status === 'duplicate' ? (
            <RotateCcw size={16} aria-hidden />
          ) : (
            <AlertTriangle size={16} aria-hidden />
          )}
          {state.message}
        </div>
      )}
    </form>
  )
}
