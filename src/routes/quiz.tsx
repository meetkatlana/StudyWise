import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Coffee,
  Database,
  Server,
  Wifi,
  Calculator,
  Code2,
  Layers,
  Sparkles,
  ArrowRight,
  Gauge,
  Hash,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import {
  DIFFICULTIES,
  QUESTION_COUNTS,
  SUBJECTS,
  generateQuiz,
  type Difficulty,
  type Subject,
} from "../lib/quiz-data";

export const Route = createFileRoute("/quiz")({
  validateSearch: (s: Record<string, unknown>) => ({
    subject: typeof s.subject === "string" ? (s.subject as string) : undefined,
    topic: typeof s.topic === "string" ? (s.topic as string) : undefined,
    difficulty:
      typeof s.difficulty === "string" ? (s.difficulty as string) : undefined,
    autostart: s.autostart === "1" || s.autostart === true ? true : undefined,
  }),
  component: QuizConfig,
});

// Icon mapping keeps the config page visually rich without needing images.
const SUBJECT_ICONS: Record<Subject, LucideIcon> = {
  Java: Coffee,
  "Data Structures & Algorithms": Layers,
  DBMS: Database,
  SQL: Server,
  "Operating System": Code2,
  "Computer Networks": Wifi,
  Aptitude: Calculator,
};

const DIFFICULTY_META: Record<Difficulty, { hint: string; dots: number }> = {
  Easy: { hint: "Warm up with fundamentals", dots: 1 },
  Medium: { hint: "Balanced placement level", dots: 2 },
  Hard: { hint: "Interview-grade challenge", dots: 3 },
};

function QuizConfig() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const {
    subject,
    difficulty,
    count,
    topic,
    setSubject,
    setDifficulty,
    setCount,
    setTopic,
    startQuiz,
  } = useQuiz();

  const ready = subject && difficulty && count;
  const [poolError, setPoolError] = useState<string | null>(null);

  // Preselect from URL (coach "Practice now").
  const appliedRef = useRef(false);
  useEffect(() => {
    if (appliedRef.current) return;
    if (search.subject && (SUBJECTS as readonly string[]).includes(search.subject)) {
      setSubject(search.subject as Subject);
    }
    if (
      search.difficulty &&
      (DIFFICULTIES as string[]).includes(search.difficulty)
    ) {
      setDifficulty(search.difficulty as Difficulty);
    }
    setTopic(search.topic ?? null);
    appliedRef.current = true;
  }, [search, setSubject, setDifficulty, setTopic]);

  // Autostart when arriving from Coach with subject+topic+difficulty ready.
  useEffect(() => {
    if (!search.autostart) return;
    if (!subject || !difficulty || !count) return;
    // Only run once per mount.
    if (appliedRef.current !== true) return;
    const preview = generateQuiz(subject, difficulty, count, topic);
    if (preview.length === 0) {
      setPoolError(
        topic
          ? `We don't have enough ${topic} questions in ${subject} (${difficulty}) yet. Try another difficulty or topic.`
          : `We don't have enough ${subject} (${difficulty}) questions yet.`,
      );
      return;
    }
    const picked = startQuiz();
    if (picked > 0) navigate({ to: "/attempt" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, difficulty, count, topic, search.autostart]);

  const handleGenerate = () => {
    if (!ready) return;
    setPoolError(null);
    const preview = generateQuiz(subject!, difficulty!, count!, topic);
    if (preview.length === 0) {
      setPoolError(
        topic
          ? `We don't have enough ${topic} questions in ${subject} (${difficulty}) yet. Try another difficulty or topic.`
          : `We don't have enough ${subject} (${difficulty}) questions yet.`,
      );
      return;
    }
    startQuiz();
    navigate({ to: "/attempt" });
  };

  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/2 -right-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <header className="animate-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Configure your practice session
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Build your <span className="gradient-text">personalized quiz</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Pick a subject, difficulty, and length. We'll generate a focused set
            of questions tuned to placement interviews.
          </p>
        </header>

        <div className="glass mt-10 rounded-[24px] p-6 sm:p-8 lg:p-10">
          {/* Step 1: Subject */}
          <Section step={1} icon={BookOpen} title="Choose a subject">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SUBJECTS.map((s) => {
                const Icon = SUBJECT_ICONS[s];
                const active = subject === s;
                return (
                  <SelectableCard
                    key={s}
                    active={active}
                    onClick={() => setSubject(s)}
                    ariaLabel={`Subject: ${s}`}
                  >
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl text-primary-foreground transition-transform ${
                        active ? "scale-105" : ""
                      }`}
                      style={{ backgroundImage: "var(--gradient-accent)" }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.25} />
                    </span>
                    <span className="mt-3 block font-semibold text-foreground">
                      {s}
                    </span>
                  </SelectableCard>
                );
              })}
            </div>
          </Section>

          {/* Step 2: Difficulty */}
          <Section step={2} icon={Gauge} title="Select difficulty">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DIFFICULTIES.map((d) => {
                const meta = DIFFICULTY_META[d];
                const active = difficulty === d;
                return (
                  <SelectableCard
                    key={d}
                    active={active}
                    onClick={() => setDifficulty(d)}
                    ariaLabel={`Difficulty: ${d}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-6 rounded-full ${
                            i < meta.dots
                              ? "bg-gradient-to-r from-primary to-accent"
                              : "bg-muted"
                          }`}
                          style={
                            i < meta.dots
                              ? { backgroundImage: "var(--gradient-accent)" }
                              : undefined
                          }
                        />
                      ))}
                    </div>
                    <span className="mt-3 block font-semibold text-foreground">
                      {d}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {meta.hint}
                    </span>
                  </SelectableCard>
                );
              })}
            </div>
          </Section>

          {/* Step 3: Count */}
          <Section step={3} icon={Hash} title="How many questions?">
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_COUNTS.map((n) => {
                const active = count === n;
                return (
                  <SelectableCard
                    key={n}
                    active={active}
                    onClick={() => setCount(n)}
                    ariaLabel={`${n} questions`}
                  >
                    <span className="font-display block text-3xl font-bold text-foreground">
                      {n}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      questions
                    </span>
                  </SelectableCard>
                );
              })}
            </div>
          </Section>

          {/* Action */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {ready
                ? `Ready: ${subject}${topic ? ` · ${topic}` : ""} · ${difficulty} · ${count} questions`
                : "Complete all three steps to continue"}
            </p>
            <button
              onClick={handleGenerate}
              disabled={!ready}
              className="btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
            >
              Generate Quiz
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          {poolError && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{poolError}</span>
            </div>
          )}
          {topic && !poolError && (
            <p className="mt-3 text-xs text-muted-foreground">
              Focused practice: only <strong>{topic}</strong> questions will be
              included.{" "}
              <button
                type="button"
                onClick={() => setTopic(null)}
                className="font-semibold text-primary hover:underline"
              >
                Clear topic
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

// Reusable step section with numbered header.
function Section({
  step,
  icon: Icon,
  title,
  children,
}: {
  step: number;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          {step}
        </span>
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-foreground">
          <Icon className="h-4 w-4 text-primary" strokeWidth={2.25} />
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// Selectable card used across all three steps.
function SelectableCard({
  active,
  onClick,
  ariaLabel,
  children,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`group relative rounded-2xl border p-4 text-left transition-all ${
        active
          ? "border-transparent bg-white shadow-glow ring-2 ring-primary/40"
          : "border-white/60 bg-white/60 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
      }`}
    >
      {children}
    </button>
  );
}
