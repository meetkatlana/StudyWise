import type { ReactNode } from "react";
import { BrainCircuit, Clock, Trophy } from "lucide-react";

interface QuizCardProps {
  topic?: string;
  title?: string;
  duration?: string;
  points?: number;
  progress?: number; // 0-100
  score?: string;
  children?: ReactNode;
}

/**
 * Reusable premium glass quiz card.
 * Pure presentational — no state, no logic.
 */
export function QuizCard({
  topic = "Data Structures",
  title = "Practice Set 01",
  duration = "10 min",
  points = 50,
  progress = 30,
  score,
  children,
}: QuizCardProps) {
  return (
    <article className="glass group relative rounded-[22px] p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
      <header className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
          {topic}
        </span>
        {score && (
          <span className="gradient-text font-display text-sm font-bold">
            {score}
          </span>
        )}
      </header>

      <h3 className="font-display mt-4 text-lg font-semibold text-foreground">
        {title}
      </h3>

      {/* Progress */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, progress))}%`,
            backgroundImage: "var(--gradient-accent)",
          }}
        />
      </div>

      {children && <div className="mt-5">{children}</div>}

      <footer className="mt-5 flex items-center justify-between border-t border-white/60 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          +{points} XP
        </span>
      </footer>
    </article>
  );
}