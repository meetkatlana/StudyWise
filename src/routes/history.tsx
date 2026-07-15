import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  History as HistoryIcon,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  clearHistory,
  deleteAttempt,
  useHistory,
  type QuizAttempt,
} from "../lib/history-store";
import {
  DIFFICULTIES,
  SUBJECTS,
  type Difficulty,
  type Subject,
} from "../lib/quiz-data";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

type SubjectFilter = "All" | Subject;
type DifficultyFilter = "All" | Difficulty;
type ScoreFilter = "All" | "high" | "mid" | "low";
type SortOrder = "newest" | "oldest";

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryPage() {
  const navigate = useNavigate();
  const { list, hydrated } = useHistory();

  const [subjectF, setSubjectF] = useState<SubjectFilter>("All");
  const [diffF, setDiffF] = useState<DifficultyFilter>("All");
  const [scoreF, setScoreF] = useState<ScoreFilter>("All");
  const [sort, setSort] = useState<SortOrder>("newest");

  const filtered = useMemo(() => {
    const out = list.filter((a) => {
      if (subjectF !== "All" && a.subject !== subjectF) return false;
      if (diffF !== "All" && a.difficulty !== diffF) return false;
      if (scoreF === "high" && a.accuracy < 80) return false;
      if (scoreF === "mid" && (a.accuracy < 50 || a.accuracy >= 80)) return false;
      if (scoreF === "low" && a.accuracy >= 50) return false;
      return true;
    });
    out.sort((a, b) => {
      const av = new Date(a.createdAt).getTime();
      const bv = new Date(b.createdAt).getTime();
      return sort === "newest" ? bv - av : av - bv;
    });
    return out;
  }, [list, subjectF, diffF, scoreF, sort]);

  const handleClearAll = () => {
    if (list.length === 0) return;
    if (
      window.confirm(
        `Delete all ${list.length} quiz attempts? This cannot be undone.`,
      )
    ) {
      clearHistory();
    }
  };

  const handleDeleteOne = (id: string) => {
    if (window.confirm("Delete this quiz attempt? This cannot be undone.")) {
      deleteAttempt(id);
    }
  };

  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/2 -right-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-foreground/80">
              <HistoryIcon className="h-3.5 w-3.5 text-accent" />
              Your practice log
            </span>
            <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Quiz <span className="gradient-text">history</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Every attempt is saved locally. Reopen any quiz to see its
              questions, review, and AI Coach plan.
            </p>
          </div>
          {list.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-transform hover:-translate-y-0.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete all
            </button>
          )}
        </header>

        {hydrated && list.length === 0 ? (
          <EmptyState onStart={() => navigate({ to: "/quiz" })} />
        ) : (
          <>
            {/* Filters */}
            <section className="glass mt-8 rounded-[22px] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                Filters
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FilterSelect
                  label="Subject"
                  value={subjectF}
                  onChange={(v) => setSubjectF(v as SubjectFilter)}
                  options={["All", ...SUBJECTS]}
                />
                <FilterSelect
                  label="Difficulty"
                  value={diffF}
                  onChange={(v) => setDiffF(v as DifficultyFilter)}
                  options={["All", ...DIFFICULTIES]}
                />
                <FilterSelect
                  label="Score"
                  value={scoreF}
                  onChange={(v) => setScoreF(v as ScoreFilter)}
                  options={[
                    { value: "All", label: "All scores" },
                    { value: "high", label: "High (80%+)" },
                    { value: "mid", label: "Mid (50–79%)" },
                    { value: "low", label: "Low (<50%)" },
                  ]}
                />
                <FilterSelect
                  label="Sort"
                  value={sort}
                  onChange={(v) => setSort(v as SortOrder)}
                  options={[
                    { value: "newest", label: "Newest first" },
                    { value: "oldest", label: "Oldest first" },
                  ]}
                />
              </div>
            </section>

            {/* Grid */}
            {filtered.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                No attempts match these filters.
              </p>
            ) : (
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <HistoryCard attempt={a} onDelete={() => handleDeleteOne(a.id)} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function HistoryCard({
  attempt,
  onDelete,
}: {
  attempt: QuizAttempt;
  onDelete: () => void;
}) {
  const tone =
    attempt.accuracy >= 80
      ? "success"
      : attempt.accuracy >= 50
        ? "primary"
        : "destructive";
  const toneRing =
    tone === "success"
      ? "ring-success/25"
      : tone === "primary"
        ? "ring-primary/25"
        : "ring-destructive/25";
  const toneChip =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "primary"
        ? "bg-primary/15 text-primary"
        : "bg-destructive/15 text-destructive";

  return (
    <article
      className={`glass group relative flex h-full flex-col rounded-[22px] p-6 ring-1 transition-all hover:-translate-y-1 hover:shadow-glow ${toneRing}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <BookOpen className="h-3.5 w-3.5" />
            {attempt.subject}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
            {attempt.difficulty}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete attempt"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/60 bg-white/70 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold text-foreground">
          {attempt.correctCount}
        </span>
        <span className="text-sm text-muted-foreground">
          / {attempt.questions.length}
        </span>
        <span
          className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneChip}`}
        >
          {attempt.accuracy}%
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="rounded-xl border border-white/60 bg-white/60 p-2.5">
          <dt className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Correct
          </dt>
          <dd className="mt-1 font-semibold text-foreground">
            {attempt.correctCount}
          </dd>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/60 p-2.5">
          <dt className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-primary" />
            Time
          </dt>
          <dd className="mt-1 font-semibold text-foreground">
            {fmtDuration(attempt.timeTakenSec)}
          </dd>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/60 p-2.5">
          <dt className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-accent" />
            Q's
          </dt>
          <dd className="mt-1 font-semibold text-foreground">
            {attempt.questions.length}
          </dd>
        </div>
      </dl>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        {fmtDate(attempt.createdAt)}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/60 pt-4">
        <Link
          to="/result"
          search={{ id: attempt.id }}
          className="btn-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
        >
          Open
        </Link>
        <Link
          to="/review"
          search={{ id: attempt.id }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl glass px-3 py-2 text-xs font-semibold text-foreground"
        >
          Review
        </Link>
        <Link
          to="/recommendation"
          search={{ id: attempt.id }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl glass px-3 py-2 text-xs font-semibold text-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Coach
        </Link>
      </div>
    </article>
  );
}

type FilterOption = string | { value: string; label: string };

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly FilterOption[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/60 bg-white/80 px-3 py-2.5 text-sm font-medium text-foreground shadow-soft outline-none transition focus:ring-2 focus:ring-primary/40"
      >
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="glass animate-fade-up mt-10 flex flex-col items-center rounded-[24px] p-10 text-center sm:p-14">
      <div
        className="grid h-20 w-20 place-items-center rounded-3xl text-primary-foreground shadow-glow"
        style={{ backgroundImage: "var(--gradient-accent)" }}
      >
        <HistoryIcon className="h-9 w-9" strokeWidth={2.25} />
      </div>
      <h2 className="font-display mt-6 text-2xl font-bold text-foreground">
        No quiz attempts yet.
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Every quiz you complete is saved here so you can revisit questions,
        review answers, and reopen personalized AI Coach plans.
      </p>
      <button
        onClick={onStart}
        className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
      >
        Start Your First Quiz
      </button>
    </div>
  );
}
