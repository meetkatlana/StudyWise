import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ExternalLink,
  FileText,
  Home,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { RequireAuth } from "../components/RequireAuth";

export const Route = createFileRoute("/recommendation")({
  component: () => (
    <RequireAuth>
      <Recommendation />
    </RequireAuth>
  ),
});

interface TopicScore { topic: string; accuracy: number; subject?: string }
interface RoadmapDay { day: number; title: string; duration: string }
interface PracticeItem {
  title: string;
  subject?: string;
  topic?: string;
  difficulty: string;
  practiceTopic?: string;
  practiceSubject?: string;
  practiceDifficulty?: string;
}
interface VideoItem {
  title: string;
  subtitle?: string;
  url: string;
  videoUrl?: string;
  subject?: string;
  topic?: string;
}
interface ResourceItem {
  title: string;
  type: string;
  subject?: string;
  topic?: string;
  notesUrl?: string;
  available?: boolean;
}

interface CoachData {
  empty: boolean;
  coachNote?: string;
  overallPerformance?: string;
  averageScore?: number;
  totalAttempts?: number;
  weakTopics?: TopicScore[];
  strongTopics?: TopicScore[];
  roadmap?: RoadmapDay[];
  recommendedPractice?: PracticeItem[];
  recommendedVideos?: VideoItem[];
  recommendedResources?: ResourceItem[];
}

function Recommendation() {
  const [data, setData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ status: string; coach: CoachData }>("/coach");
      setData(res.coach);
    } catch (e: any) {
      setError(e?.message || "Failed to load your AI Coach data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <CoachSkeleton />;
  if (error) return <CoachError message={error} onRetry={load} />;
  if (!data || data.empty) return <CoachEmpty />;

  const {
    coachNote = "",
    overallPerformance = "",
    averageScore = 0,
    totalAttempts = 0,
    weakTopics = [],
    strongTopics = [],
    roadmap = [],
    recommendedPractice = [],
    recommendedVideos = [],
    recommendedResources = [],
  } = data;

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
            Based on {totalAttempts} completed {totalAttempts === 1 ? "quiz" : "quizzes"} · Average score {averageScore}% · Overall: {overallPerformance}
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
            <p className="mt-1 text-sm text-muted-foreground">{coachNote}</p>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <TopicList
            title="Weak topics"
            hint="Prioritize these this week"
            icon={<TrendingDown className="h-4 w-4" strokeWidth={2.25} />}
            tone="destructive"
            topics={weakTopics}
          />
          <TopicList
            title="Strong topics"
            hint="Maintain with light revision"
            icon={<TrendingUp className="h-4 w-4" strokeWidth={2.25} />}
            tone="success"
            topics={strongTopics}
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
                    Day {r.day}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.duration}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{r.title}</p>
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
            <ul className="mt-4 space-y-3">
              {recommendedPractice.length === 0 && (
                <li className="text-sm text-muted-foreground">No practice suggestions yet.</li>
              )}
              {recommendedPractice.map((p, i) => (
                <li
                  key={`${p.title}-${i}`}
                  className="rounded-2xl border border-white/60 bg-white/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <BookOpen className="h-4 w-4 text-primary" />
                      {p.title}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {p.difficulty}
                    </span>
                  </div>
                  {p.subject && (
                    <p className="mt-1 text-xs text-muted-foreground">{p.subject}</p>
                  )}
                  <Link
                    to="/quiz"
                    search={{
                      subject: p.practiceSubject ?? p.subject,
                      topic: p.practiceTopic ?? p.topic,
                      difficulty: p.practiceDifficulty ?? p.difficulty,
                      autostart: "1",
                    }}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Practice now →
                  </Link>
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
              {recommendedVideos.length === 0 && (
                <li className="text-sm text-muted-foreground">No video suggestions yet.</li>
              )}
              {recommendedVideos.map((v) => (
                <li key={v.videoUrl ?? v.url}>
                  <a
                    href={v.videoUrl ?? v.url}
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
                      {v.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">
                          {v.subtitle}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {recommendedResources.length > 0 && (
          <section className="glass mt-8 rounded-[24px] p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" strokeWidth={2.25} />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recommended resources
              </h2>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedResources.map((r, i) => (
                <li
                  key={`${r.title}-${i}`}
                  className="rounded-2xl border border-white/60 bg-white/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{r.title}</span>
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                      {r.type}
                    </span>
                  </div>
                  {r.subject && (
                    <p className="mt-1 text-xs text-muted-foreground">{r.subject}</p>
                  )}
                  {r.available && r.notesUrl ? (
                    <a
                      href={r.notesUrl}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open notes →
                    </a>
                  ) : r.topic ? (
                    <Link
                      to="/notes/$topic"
                      params={{ topic: r.topic }}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open notes →
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="mt-3 inline-flex cursor-not-allowed items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      Coming Soon
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Link
            to="/history"
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
          >
            View history
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

function CoachSkeleton() {
  return (
    <main className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto h-6 w-52 animate-pulse rounded-full bg-white/60" />
        <div className="mx-auto mt-5 h-10 w-3/4 animate-pulse rounded-2xl bg-white/60 sm:h-12" />
        <div className="mx-auto mt-4 h-4 w-2/3 animate-pulse rounded-full bg-white/50" />
        <div className="mt-10 h-28 animate-pulse rounded-[22px] bg-white/60" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="h-40 animate-pulse rounded-[22px] bg-white/60" />
          <div className="h-40 animate-pulse rounded-[22px] bg-white/60" />
        </div>
        <div className="mt-8 h-64 animate-pulse rounded-[24px] bg-white/60" />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="h-60 animate-pulse rounded-[24px] bg-white/60" />
          <div className="h-60 animate-pulse rounded-[24px] bg-white/60" />
        </div>
      </div>
    </main>
  );
}

function CoachError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="font-display mt-4 text-2xl font-bold text-foreground">
        Couldn't load your AI Coach
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </button>
    </main>
  );
}

function CoachEmpty() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </span>
      <h1 className="font-display mt-4 text-2xl font-bold text-foreground">
        No quiz history yet
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Complete your first quiz to receive a personalized AI study plan.
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
  topics: TopicScore[];
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
              key={t.topic}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${chipCls}`}
              title={t.subject ? `${t.subject} · ${t.accuracy}%` : `${t.accuracy}%`}
            >
              {t.topic} · {t.accuracy}%
            </span>
          ))
        )}
      </div>
    </section>
  );
}
