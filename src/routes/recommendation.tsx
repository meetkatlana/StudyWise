import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Home,
  PlayCircle,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAttempt } from "../lib/history-store";
import {
  buildRoadmap,
  coachNote,
  computeTopicStats,
  practiceItems,
  recommendedVideos,
  splitTopics,
} from "../lib/recommendations";
import { RequireAuth } from "../components/RequireAuth";

interface RecSearch {
  id?: string;
}

export const Route = createFileRoute("/recommendation")({
  validateSearch: (s: Record<string, unknown>): RecSearch => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: () => (
    <RequireAuth>
      <Recommendation />
    </RequireAuth>
  ),
});

function Recommendation() {
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const { attempt, hydrated } = useAttempt(id);

  useEffect(() => {
    if (hydrated && !attempt) navigate({ to: "/quiz" });
  }, [hydrated, attempt, navigate]);

  const derived = useMemo(() => {
    if (!attempt) return null;
    const stats = computeTopicStats(attempt);
    const { weak, strong } = splitTopics(stats);
    return {
      weak,
      strong,
      note: coachNote(attempt.accuracy),
      roadmap: buildRoadmap(attempt.subject, weak),
      practice: practiceItems(weak),
      videos: recommendedVideos(attempt.subject, weak),
    };
  }, [attempt]);

  if (!attempt || !derived) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          No recommendations yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete a quiz to unlock your personalized study plan.
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

  const { weak, strong, note, roadmap, practice, videos } = derived;

  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/2 -right-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="animate-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI-powered study plan
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your personalized <span className="gradient-text">roadmap</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Tailored for {attempt.subject} · {attempt.difficulty} — you scored{" "}
            {attempt.correctCount}/{attempt.questions.length} ({attempt.accuracy}%).
          </p>
        </div>

        <section className="glass mt-10 flex items-start gap-4 rounded-[22px] p-6 sm:p-7">
          <span
            className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-accent)" }}
          >
            <ThumbsUp className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Coach's note
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{note}</p>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <TopicList
            title="Weak topics"
            hint="Prioritize these this week"
            icon={<TrendingDown className="h-4 w-4" strokeWidth={2.25} />}
            tone="destructive"
            topics={weak}
          />
          <TopicList
            title="Strong topics"
            hint="Maintain with light revision"
            icon={<TrendingUp className="h-4 w-4" strokeWidth={2.25} />}
            tone="success"
            topics={strong}
          />
        </div>

        <section className="glass mt-8 rounded-[24px] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" strokeWidth={2.25} />
            <h2 className="font-display text-xl font-semibold text-foreground">
              7-day learning roadmap
            </h2>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((r, i) => (
              <li
                key={r.day}
                className="animate-fade-up rounded-2xl border border-white/60 bg-white/70 p-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-primary">
                    {r.day}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.minutes} min
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{r.focus}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="glass rounded-[24px] p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" strokeWidth={2.25} />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recommended practice
              </h2>
            </div>
            <ul className="mt-4 space-y-4">
              {practice.map((p) => (
                <li
                  key={p.topic}
                  className="rounded-2xl border border-white/60 bg-white/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <BookOpen className="h-4 w-4 text-primary" />
                      {p.topic}
                    </span>
                    <Link
                      to="/quiz"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Practice →
                    </Link>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {p.drills.map((d) => (
                      <li
                        key={d}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass rounded-[24px] p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" strokeWidth={2.25} />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recommended videos
              </h2>
            </div>
            <ul className="mt-4 space-y-3">
              {videos.map((v) => (
                <li key={v.url}>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-white/60 bg-white/70 p-3 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
                  >
                    <span
                      className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl text-primary-foreground"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      <PlayCircle className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {v.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {v.subtitle}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Link
            to="/result"
            search={{ id: attempt.id }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Link>
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function TopicList({
  title,
  hint,
  icon,
  tone,
  topics,
}: {
  title: string;
  hint: string;
  icon: React.ReactNode;
  tone: "success" | "destructive";
  topics: string[];
}) {
  const chipCls =
    tone === "success"
      ? "bg-success/10 text-success ring-success/20"
      : "bg-destructive/10 text-destructive ring-destructive/20";
  return (
    <section className="glass rounded-[22px] p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-foreground">
          {icon}
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {topics.length === 0 ? (
          <span className="text-sm text-muted-foreground">Nothing here yet.</span>
        ) : (
          topics.map((t) => (
            <span
              key={t}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${chipCls}`}
            >
              {t}
            </span>
          ))
        )}
      </div>
    </section>
  );
}
