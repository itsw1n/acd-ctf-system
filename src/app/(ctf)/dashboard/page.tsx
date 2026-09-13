import { AlertTriangle, Skull } from "lucide-react";
import { TacticalPanel } from "@/components/common/TacticalPanel";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { FlagSubmissionForm } from "@/features/flags/components/FlagSubmissionForm";

export default function DashboardPage() {
  return (
    <Section data-ui="dashboard">
      <Container>
      <TacticalPanel label="Flag input" index="01" className="min-h-[620px] p-5 sm:p-8 lg:p-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">
              Submit <span className="text-danger-bright">Flag</span>
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
              Enter a valid flag to earn points for your team
            </p>
          </div>
          <div className="hidden items-center gap-4 xl:flex">
            <div className="border-l border-border px-5 font-mono text-[10px] uppercase leading-5 tracking-[0.13em] text-muted">
              {"// Global input"}
              <br />
              Parse &gt; Validate &gt; Score
            </div>
            <Skull className="text-border-strong" size={62} aria-hidden />
          </div>
        </div>

        <FlagSubmissionForm />

        <div className="mt-16 border-t border-border pt-8 sm:mt-20">
          <div className="flex max-w-2xl gap-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-danger" size={34} aria-hidden />
            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-danger-bright">
                {"// Operational security"}
              </h2>
              <p className="mt-2 font-mono text-[11px] uppercase leading-5 tracking-[0.09em] text-muted">
                Submit only challenge flags through this field. Duplicate solves never award points twice.
              </p>
            </div>
          </div>
        </div>
      </TacticalPanel>
      </Container>
    </Section>
  );
}
