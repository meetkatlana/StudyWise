import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  Clock,
  Eye,
  Home,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useQuiz } from "../context/QuizContext";
import { useAttempt } from "../lib/history-store";
import { computeTopicStats } from "../lib/recommendations";

interface ResultSearch {
  id?: string;
}

export const Route = createFileRoute("/result")({
  validateSearch: (s: Record<string, unknown>): ResultSearch => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: Result,
});

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function performanceMessage(acc: number) {
  if (acc >= 80) return { label: "Excellent", tone: "success" as const };
  if (acc >= 50) return { label: "Good", tone: "primary" as const };
  return { label: "Needs Improvement", tone: "destructive" as const };
}

function Result() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { attempt, hydrated } = useAttempt(id);
  const { resetQuiz } = useQuiz();

  // Route protection: no id or attempt missing → redirect to quiz config.
  useEffect(() => {
    if (hydrated && !attempt) navigate({ to: "/quiz" });
  }, [hydrated, attempt, navigate]);

  const topicStats = useMemo(
    () => (attempt ? computeTopicStats(attempt) : []),
    [attempt],
  );

  if (!attempt) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          No results yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Take a quiz to see your results here.
        </p>
        <Link
          to="/quiz"
          className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
        >
          Start a quiz
        </Link>
      </main>
    );
  }

  const {
    questions,
    correctCount,
    wrongCount,
    accuracy,
    timeTakenSec,
    subject,
    difficulty,
  } = attempt;

  const perf = performanceMessage(accuracy);
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const dash = (accuracy / 100) * CIRC;

  const handleRetake = () => {
    resetQuiz();
    navigate({ to: "/quiz" });
  };

  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/2 -right-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <section className="glass animate-fade-up rounded-[28px] p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-foreground/80">
                <Award className="h-3.5 w-3.5 text-accent" />
                Quiz completed
              </span>
              <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                You scored{" "}
                <span className="gradient-text">
                  {correctCount}/{questions.length}
                </span>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                {subject} · {difficulty} · finished in {fmtTime(timeTakenSec)}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    perf.tone === "success"
                      ? "bg-success/15 text-success"
                      : perf.tone === "primary"
                        ? "bg-primary/15 text-primary"
                        : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {perf.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground">
                  {accuracy}% accuracy
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width="180" height="180" viewBox="0 0 120 120" className="-rotate-90">
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="oklch(0.55 0.22 264)" />
                      <stop offset="100%" stopColor="oklch(0.62 0.22 293)" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r={R} fill="none" stroke="oklch(0.92 0.012 255)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r={R}
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${CIRC}`}
                    style={{ transition: "stroke-dasharray 900ms ease" }}
                  />
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-bold text-foreground">
                    {accuracy}%
                  </span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground">
                    Accuracy
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={CheckCircle2} tone="success" label="Correct" value={correctCount} />
            <StatTile icon={XCircle} tone="destructive" label="Wrong" value={wrongCount} />
            <StatTile icon={Clock} tone="primary" label="Time" value={fmtTime(timeTakenSec)} />
            <StatTile icon={Award} tone="accent" label="XP earned" value={`+${correctCount * 10}`} />
          </div>
        </section>

        <section className="glass mt-8 rounded-[24px] p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Topic-wise analysis
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See which sub-topics you crushed and where to focus next.
          </p>

          <ul className="mt-5 space-y-4">
            {topicStats.map((t) => (
              <li key={t.topic}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{t.topic}</span>
                  <span className="text-muted-foreground">
                    {t.correct}/{t.total} · {t.pct}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${t.pct}%`, backgroundImage: "var(--gradient-accent)" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/review"
            search={{ id: attempt.id }}
            className="btn-primary group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            <Eye className="h-4 w-4" />
            Review Answers
          </Link>
          <button
            onClick={handleRetake}
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <RefreshCw className="h-4 w-4" />
            Retake Quiz
          </button>
          <Link
            to="/recommendation"
            search={{ id: attempt.id }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            AI Recommendation
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Award;
  tone: "success" | "destructive" | "primary" | "accent";
  label: string;
  value: string | number;
}) {
  const toneClass =
    tone === "success"
      ? "text-success bg-success/15"
      : tone === "destructive"
        ? "text-destructive bg-destructive/15"
        : tone === "primary"
          ? "text-primary bg-primary/15"
          : "text-accent bg-accent/15";
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass}`}>
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <div className="font-display mt-3 text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
