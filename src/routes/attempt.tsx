import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Flag,
  Trophy,
} from "lucide-react";
import { useQuiz } from "../context/QuizContext";
import { addAttempt } from "../lib/history-store";

export const Route = createFileRoute("/attempt")({
  component: Attempt,
});

// Format seconds as mm:ss for the running timer.
function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function Attempt() {
  const navigate = useNavigate();
  const {
    questions,
    answers,
    selectAnswer,
    submitQuiz,
    subject,
    difficulty,
    count,
    correctCount,
    wrongCount,
    accuracy,
  } = useQuiz();

  // Elapsed time tracker (increments every second while on this page).
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());
  useEffect(() => {
    startRef.current = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const [idx, setIdx] = useState(0);

  // Guard: if there's no active quiz, send the user back to the config page.
  if (questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          No active quiz
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure a quiz to start practicing.
        </p>
        <Link
          to="/quiz"
          className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
        >
          Configure quiz
          <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  const q = questions[idx];
  const selected = answers[idx];
  const isLast = idx === questions.length - 1;
  const progress = ((idx + 1) / questions.length) * 100;

  const handleSubmit = () => {
    submitQuiz(elapsed);
    if (!subject || !difficulty) {
      navigate({ to: "/quiz" });
      return;
    }
    // Persist this attempt to localStorage so it appears in History
    // and so Result/Review/Recommendation can look it up by id.
    const saved = addAttempt({
      subject,
      difficulty,
      count: count ?? questions.length,
      questions,
      answers,
      correctCount,
      wrongCount,
      accuracy,
      timeTakenSec: elapsed,
    });
    navigate({ to: "/result", search: { id: saved.id } });
  };

  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/2 -right-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Top status bar */}
        <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              {subject}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
              {difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {fmt(elapsed)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-accent" />
              Score {correctCount}/{questions.length}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              Question {idx + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundImage: "var(--gradient-accent)",
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <article
          key={q.id}
          className="glass animate-fade-up mt-6 rounded-[24px] p-6 sm:p-8"
        >
          <h2 className="font-display text-xl font-semibold leading-snug text-foreground sm:text-2xl">
            {q.question}
          </h2>

          <ul className="mt-6 space-y-3">
            {q.options.map((opt, i) => {
              const active = selected === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => selectAnswer(idx, i)}
                    aria-pressed={active}
                    className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm transition-all sm:text-base ${
                      active
                        ? "border-transparent bg-white text-foreground shadow-glow ring-2 ring-primary/40"
                        : "border-white/60 bg-white/60 text-foreground hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold transition-colors ${
                          active
                            ? "text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-white"
                        }`}
                        style={
                          active
                            ? { backgroundImage: "var(--gradient-primary)" }
                            : undefined
                        }
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-medium">{opt}</span>
                    </span>
                    {active && (
                      <span
                        className="grid h-6 w-6 place-items-center rounded-full text-primary-foreground"
                        style={{ backgroundImage: "var(--gradient-primary)" }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </article>

        {/* Navigation buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {/* Question dots for quick navigation */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {questions.map((_, i) => {
              const answered = answers[i] !== null;
              const current = i === idx;
              return (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to question ${i + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    current
                      ? "w-6 bg-primary"
                      : answered
                        ? "bg-accent"
                        : "bg-muted"
                  }`}
                />
              );
            })}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmit}
              className="btn-primary group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
            >
              <Flag className="h-4 w-4" />
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
              className="btn-primary group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
            >
              Next
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
