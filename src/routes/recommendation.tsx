import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Home,
  PlayCircle,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useQuiz } from "../context/QuizContext";

export const Route = createFileRoute("/recommendation")({
  component: Recommendation,
});

// Static 7-day roadmap template — the day labels are filled with the user's subject.
const ROADMAP = [
  { day: "Day 1", focus: "Foundational concepts revision", minutes: 45 },
  { day: "Day 2", focus: "Weak topic deep dive", minutes: 60 },
  { day: "Day 3", focus: "Timed practice set (Easy)", minutes: 30 },
  { day: "Day 4", focus: "Mixed-topic MCQs", minutes: 45 },
  { day: "Day 5", focus: "Interview-style problems", minutes: 60 },
  { day: "Day 6", focus: "Mock quiz (Medium)", minutes: 45 },
  { day: "Day 7", focus: "Final review & reflection", minutes: 30 },
];

const DUMMY_VIDEOS = [
  { title: "Crack Placement MCQs in 10 Minutes", author: "PrepCast", length: "12:04" },
  { title: "Top 20 Interview Concepts Explained", author: "CS Compass", length: "18:22" },
  { title: "Speed Round: Weak-Topic Booster", author: "Coach AI", length: "08:47" },
];

function Recommendation() {
  const { questions, answers, subject, accuracy } = useQuiz();

  // Split topics into strong (>= 60%) and weak (< 60%) buckets.
  const { weak, strong } = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      const cur = map.get(q.topic) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (answers[i] === q.correctIndex) cur.correct += 1;
      map.set(q.topic, cur);
    });
    const w: string[] = [];
    const s: string[] = [];
    for (const [topic, v] of map) {
      const pct = (v.correct / v.total) * 100;
      (pct >= 60 ? s : w).push(topic);
    }
    // Fallback dummy content when the user hasn't taken a quiz yet.
    if (map.size === 0) {
      return {
        weak: ["Time Complexity", "Normalization", "TCP/IP"],
        strong: ["Basic Syntax", "Percentages", "Joins"],
      };
    }
    return { weak: w, strong: s };
  }, [questions, answers]);

  const message =
    accuracy >= 80
      ? "You're placement-ready — keep the momentum with harder sets."
      : accuracy >= 50
        ? "Solid base. A focused week on weak topics will unlock the next level."
        : "Every expert was once a beginner. Start small, stay consistent, and you'll level up fast.";

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
            {subject ? `Tailored for ${subject}` : "Sample recommendations"} —
            follow the plan below to sharpen weak areas and reinforce strengths.
          </p>
        </div>

        {/* Motivational banner */}
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
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </section>

        {/* Weak / Strong */}
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

        {/* 7-day roadmap */}
        <section className="glass mt-8 rounded-[24px] p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" strokeWidth={2.25} />
            <h2 className="font-display text-xl font-semibold text-foreground">
              7-day learning roadmap
            </h2>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROADMAP.map((r, i) => (
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
                <p className="mt-2 text-sm font-medium text-foreground">
                  {r.focus}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Recommended practice + videos */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="glass rounded-[24px] p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" strokeWidth={2.25} />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recommended practice
              </h2>
            </div>
            <ul className="mt-4 space-y-3">
              {(weak.length ? weak : ["Mixed practice"]).slice(0, 4).map((t) => (
                <li
                  key={t}
                  className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {t}
                  </span>
                  <Link
                    to="/quiz"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Practice →
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
              {DUMMY_VIDEOS.map((v) => (
                <li
                  key={v.title}
                  className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/70 p-3"
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
                    <p className="text-xs text-muted-foreground">
                      {v.author} · {v.length}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Link
            to="/result"
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
