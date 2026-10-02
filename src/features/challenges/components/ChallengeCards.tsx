'use client'

import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, ExternalLink, Lightbulb, LockKeyhole, Trophy } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { FlagSubmissionForm } from '@/features/flags/components/FlagSubmissionForm'
import type { PlayerChallenge } from '@/features/challenges/queries/challengePlayerQueries'
import { SearchBar } from '@/components/common/SearchBar'
import { Select } from '@/components/common/Select'

const difficultyClass = {
  EASY: 'text-success',
  MEDIUM: 'text-warning',
  HARD: 'text-danger-bright',
} as const

export function ChallengeCards({
  challenges,
  roomId,
}: {
  challenges: PlayerChallenge[]
  roomId: string
}) {
  const [selected, setSelected] = useState<PlayerChallenge | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const searchChallenges = useCallback((value: string) => setSearch(value), [])
  const categories = useMemo(
    () =>
      [...new Set(challenges.map((challenge) => challenge.category))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [challenges]
  )
  const filteredChallenges = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return challenges.filter((challenge) => {
      const matchesSearch =
        !query ||
        `${challenge.title} ${challenge.category} ${challenge.description}`
          .toLocaleLowerCase()
          .includes(query)
      return (
        matchesSearch &&
        (!category || challenge.category === category) &&
        (!difficulty || challenge.difficulty === difficulty)
      )
    })
  }, [category, challenges, difficulty, search])

  return (
    <>
      <div className="mb-5 grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(170px,220px)_minmax(170px,220px)]">
        <SearchBar
          value={search}
          onSearch={searchChallenges}
          placeholder="Search challenges"
          aria-label="Search challenges"
        />
        <Select
          aria-label="Filter by category"
          placeholder="All categories"
          value={category}
          onChange={setCategory}
          options={[
            { id: '', label: 'All categories' },
            ...categories.map((value) => ({ id: value, label: value })),
          ]}
        />
        <Select
          aria-label="Filter by difficulty"
          placeholder="All difficulties"
          value={difficulty}
          onChange={setDifficulty}
          options={[
            { id: '', label: 'All difficulties' },
            { id: 'EASY', label: 'Easy' },
            { id: 'MEDIUM', label: 'Medium' },
            { id: 'HARD', label: 'Hard' },
          ]}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredChallenges.map((challenge) => (
          <button
            key={challenge.id}
            type="button"
            onClick={() => setSelected(challenge)}
            className="group flex min-h-52 flex-col border border-border bg-surface/80 p-5 text-left transition hover:border-danger/70 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                {challenge.category}
              </span>
              {challenge.solved ? (
                <CheckCircle2 size={18} className="text-success" aria-label="Solved" />
              ) : (
                <LockKeyhole size={17} className="text-muted" aria-hidden />
              )}
            </div>
            <h2 className="mt-8 font-display text-xl font-bold uppercase group-hover:text-danger-bright">
              {challenge.title}
            </h2>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-4 font-mono text-xs uppercase tracking-[0.1em]">
              <span className={difficultyClass[challenge.difficulty]}>{challenge.difficulty}</span>
              <span className="text-danger-bright">{challenge.points} PTS</span>
            </div>
          </button>
        ))}
      </div>
      {!filteredChallenges.length && (
        <p className="border border-border p-10 text-center font-mono text-sm text-muted">
          {challenges.length ? 'No challenges match these filters.' : 'No active challenges yet.'}
        </p>
      )}
      {selected && (
        <Modal
          title={selected.title}
          eyebrow={`// ${selected.category}`}
          isOpen
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4 font-mono text-xs uppercase tracking-[0.1em]">
              <span className={difficultyClass[selected.difficulty]}>{selected.difficulty}</span>
              <span className="text-danger-bright">{selected.points} points</span>
              {selected.solved && <span className="text-success">Solved</span>}
            </div>
            <p className="font-mono text-sm leading-7 text-muted">{selected.description}</p>
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
              Author: <span className="text-foreground">{selected.author}</span>
            </p>
            {selected.hint && (
              <div className="border border-warning/40 bg-warning/5 p-4">
                <p className="flex items-center gap-2 font-mono text-xs uppercase text-warning">
                  <Lightbulb size={15} aria-hidden /> Hint
                </p>
                <p className="mt-2 font-mono text-sm leading-6 text-muted">{selected.hint}</p>
              </div>
            )}
            {selected.externalUrl && (
              <a
                href={selected.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-border-strong px-4 font-mono text-xs uppercase text-foreground hover:border-danger"
              >
                <ExternalLink size={16} aria-hidden /> Open challenge link
              </a>
            )}
            <div className="border-t border-border pt-5">
              <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase text-muted">
                <Trophy size={15} aria-hidden /> Submit solution
              </p>
              <FlagSubmissionForm roomId={roomId} />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
