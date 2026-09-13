import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { requireCurrentPlayer } from "@/features/sessions/services/sessionService";
import { getPlayerScore } from "@/features/activity/queries/activityQueries";

export default async function CtfLayout({ children }: { children: ReactNode }) {
  const player = await requireCurrentPlayer();
  const score = await getPlayerScore(player.id);

  return (
    <AppShell player={player} score={score}>
      {children}
    </AppShell>
  );
}
