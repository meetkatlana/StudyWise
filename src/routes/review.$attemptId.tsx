import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Home,
  Info,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "../components/RequireAuth";
import { api, ApiError } from "../lib/api";

interface ReviewQuestion {
  index: number;
  id: string;
  question: string;
  options: string[];
  topic: string | null;
  selectedAnswer: number | null;
  correctAnswer: number | null;
  isCorrect: boolean;
  explanation: string;
}

interface ReviewPayload {
  attemptId: string;
  subject: string;
  difficulty: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  completionDate: string;
  questions: ReviewQuestion[];
}

export const Route = createFileRoute("/review/$attemptId")({
  component: () => (
    <RequireAuth requireFull>
      <ReviewPage />
    </RequireAuth>
  ),
});

function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function performanceMessage(acc: number) {
  if (acc >= 80) return { label: "Excellent", tone: "success" as const };
  if (acc >= 50) return { label: "Good", tone: "primary" as const };
  return { label: "Needs Improvement", tone: "destructive" as const };
}

function ReviewPage() {
  const { attemptId } = Route.useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [current, setCurrent] = useState(0);
  const [openExplanations, setOpenExplanations] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api<{ status: string; review: ReviewPayload }>(
      `/attempts/${attemptId}/review`,
    )
      .then((res) => {
        if (cancelled) return;
        setData(res.review);
        setCurrent(0);
      })
      .catch((e: ApiError | Error) => {
        if (cancelled) return;
        const msg =
          e instanceof ApiError && e.status === 404
            ? "This quiz attempt could not be found."
            : e.message || "Failed to load review.";
        setError(msg);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attemptId, reloadKey]);

  const perf = useMemo(
    () => (data ? performanceMessage(data.accuracy) : null),
    [data],
  );

  if (loading) return <ReviewSkeleton />;
  if (error)
    return (
      <ReviewError
        message={error}
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  if (!data) return null;

  const q = data.questions[current];
  const total = data.questions.length;
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
  const goNext = () => setCurrent((c) => Math.min(total - 1, c + 1));
  const toggleExpl = (i: number) =>
    setOpenExplanations((s) => ({ ...s, [i]: !s[i] }));

  const retakeUrl = "/quiz";

  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/2 -right-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* Header */}
        <header className="animate-fade-up">
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to history
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Quiz <span className="gradient-text">Review</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {data.subject} · {data.difficulty} · {fmtDate(data.completionDate)}
              </p>
            </div>
            {perf && (
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
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="glass animate-fade-up mt-8 rounded-[24px] p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SummaryTile
              icon={Trophy}
              tone="accent"
              label="Final Score"
              value={`${data.score}%`}
            />
            <SummaryTile
              icon={Target}
              tone="primary"
              label="Accuracy"
              value={`${data.accuracy}%`}
            />
            <SummaryTile
              icon={Check}
              tone="success"
              label="Correct"
              value={data.correctCount}
            />
            <SummaryTile
              icon={X}
              tone="destructive"
              label="Wrong"
              value={data.wrongCount}
            />
            <SummaryTile
              icon={Clock}
              tone="primary"
              label="Time Taken"
              value={fmtDuration(data.timeTaken)}
            />
          </div>
        </section>

        {/* Progress + jump */}
        <section className="glass animate-fade-up mt-6 rounded-[22px] p-5 sm:p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">
              Question {current + 1} of {total}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}% reviewed
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundImage: "var(--gradient-accent)",
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {data.questions.map((qq, i) => {
              const active = i === current;
              const tone = qq.isCorrect
                ? "bg-success/15 text-success ring-success/30"
                : "bg-destructive/15 text-destructive ring-destructive/30";
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Jump to question ${i + 1}`}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold ring-1 transition-transform hover:-translate-y-0.5 ${tone} ${
                    active ? "outline outline-2 outline-primary" : ""
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </section>

        {/* Question card */}
        {q && (
          <article
            key={q.index}
            className={`glass animate-fade-up mt-6 rounded-[24px] p-6 ring-1 sm:p-8 ${
              q.isCorrect ? "ring-success/40" : "ring-destructive/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-0.5">
                  Q{q.index + 1}
                </span>
                {q.topic && (
                  <span className="rounded-md bg-white/70 px-2 py-0.5 text-foreground">
                    {q.topic}
                  </span>
                )}
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  q.isCorrect
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {q.isCorrect ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                )}
                {q.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>

            <h2 className="font-display mt-4 text-lg font-semibold text-foreground sm:text-xl">
              {q.question}
            </h2>

            <ul className="mt-5 space-y-2">
              {q.options.map((opt, oi) => {
                const isSel = q.selectedAnswer === oi;
                const isAns = q.correctAnswer === oi;
                const cls = isAns
                  ? "border-success/40 bg-success/10 text-foreground"
                  : isSel
                    ? "border-destructive/40 bg-destructive/10 text-foreground"
                    : "border-white/60 bg-white/60 text-muted-foreground";
                return (
                  <li
                    key={oi}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition ${cls}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-semibold">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span>{opt}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      {isAns && (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          Correct
                        </span>
                      )}
                      {isSel && !isAns && (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <X className="h-3.5 w-3.5" strokeWidth={3} />
                          Your pick
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
              {q.selectedAnswer === null && (
                <li className="rounded-xl border border-white/60 bg-white/60 px-4 py-2 text-xs italic text-muted-foreground">
                  You did not answer this question.
                </li>
              )}
            </ul>

            {q.explanation && (
              <div className="mt-5">
                <button
                  onClick={() => toggleExpl(q.index)}
                  className="flex w-full items-center justify-between rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/10"
                  aria-expanded={!!openExplanations[q.index]}
                >
                  <span className="inline-flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Explanation
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-primary transition-transform ${
                      openExplanations[q.index] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openExplanations[q.index] && (
                  <div className="animate-fade-up mt-2 rounded-2xl border border-primary/15 bg-white/70 px-4 py-3 text-sm text-foreground">
                    {q.explanation}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                disabled={current === 0}
                className="inline-flex items-center gap-1.5 rounded-xl glass px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={goNext}
                disabled={current >= total - 1}
                className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold disabled:pointer-events-none disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        )}

        {/* Bottom action buttons */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
          <button
            onClick={() => navigate({ to: retakeUrl })}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Retake Quiz
          </button>
          <Link
            to="/quiz"
            search={{ subject: data.subject, difficulty: data.difficulty } as never}
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4 text-accent" />
            Generate Similar Quiz
          </Link>
        </div>
      </div>
    </main>
  );
}

function SummaryTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Trophy;
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
      <div className="font-display mt-3 text-2xl font-bold text-foreground">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <main className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="h-4 w-32 animate-pulse rounded bg-white/70" />
        <div className="mt-4 h-10 w-72 animate-pulse rounded-xl bg-white/70" />
        <div className="glass mt-8 rounded-[24px] p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-white/70"
              />
            ))}
          </div>
        </div>
        <div className="glass mt-6 h-24 animate-pulse rounded-[22px]" />
        <div className="glass mt-6 h-80 animate-pulse rounded-[24px]" />
      </div>
    </main>
  );
}

function ReviewError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-destructive/15 text-destructive">
        <X className="h-7 w-7" strokeWidth={2.5} />
      </div>
      <h1 className="font-display mt-5 text-2xl font-bold text-foreground">
        Couldn't load review
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onRetry}
          className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 rounded-2xl glass px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to history
        </Link>
      </div>
    </main>
  );
}