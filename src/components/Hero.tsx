import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  BrainCircuit,
  Target,
  Trophy,
  Check,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-[110px]" />
        <div className="absolute top-1/3 -right-32 h-[26rem] w-[26rem] rounded-full bg-accent/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 10%, transparent) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
      </div>

      {/* HERO */}
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-16 pb-24 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pt-28 lg:pb-32">
        {/* Copy */}
        <div className="animate-fade-up text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-foreground/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Powered by Generative AI
          </span>

          <h1 className="font-display mt-6 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]">
            Ace placements with your{" "}
            <span className="gradient-text">AI Prep Coach</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            Generate personalized quizzes, get instant AI explanations, and follow
            a smart study plan tuned to your goals — everything in one calm,
            focused workspace.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/quiz"
              className="btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold sm:w-auto"
            >
              Start Practicing Free
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/recommendation"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              Explore AI Coach
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground lg:justify-start">
            {["No credit card", "Adaptive difficulty", "Instant explanations"].map(
              (t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-lg lg:mx-0">
          {/* Halo */}
          <div
            aria-hidden="true"
            className="absolute -inset-8 -z-10 rounded-[3rem] opacity-70 blur-2xl"
            style={{ backgroundImage: "var(--gradient-accent)" }}
          />

          <div className="glass relative rounded-[24px] p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
                Data Structures
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Question 3 / 10
              </span>
            </div>

            {/* Progress */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: "30%", backgroundImage: "var(--gradient-accent)" }}
              />
            </div>

            <h3 className="font-display mt-5 text-lg font-semibold text-foreground sm:text-xl">
              What is the time complexity of binary search?
            </h3>

            <ul className="mt-5 space-y-2.5">
              {[
                { t: "O(n)", ok: false },
                { t: "O(log n)", ok: true },
                { t: "O(n²)", ok: false },
                { t: "O(1)", ok: false },
              ].map((opt) => (
                <li
                  key={opt.t}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all ${
                    opt.ok
                      ? "border-transparent bg-white text-foreground shadow-soft ring-2 ring-primary/25"
                      : "border-white/60 bg-white/60 text-muted-foreground hover:bg-white"
                  }`}
                >
                  <span className="font-medium">{opt.t}</span>
                  {opt.ok && (
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full text-primary-foreground"
                      style={{ backgroundImage: "var(--gradient-primary)" }}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-white/50 pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Adaptive difficulty
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                +50 XP
              </span>
            </div>
          </div>

          {/* Floating chips */}
          <div className="animate-float glass absolute -top-5 -right-4 hidden rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-foreground sm:flex sm:items-center sm:gap-2">
            <span
              className="grid h-6 w-6 place-items-center rounded-lg text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-accent)" }}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            AI Explanation ready
          </div>
          <div className="animate-float-slow glass absolute -bottom-6 -left-4 hidden rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-foreground sm:flex sm:items-center sm:gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-success text-success-foreground">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            Score: <span className="gradient-text">9 / 10</span>
          </div>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="relative border-t border-white/40 bg-section/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Trusted worldwide
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Numbers that speak for themselves
            </h2>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {[
              { icon: BookOpen, k: "10k+", v: "Practice questions" },
              { icon: Target, k: "50+", v: "Placement topics" },
              { icon: Users, k: "25k+", v: "Students prepping" },
              { icon: TrendingUp, k: "95%", v: "Success rate" },
            ].map((s, i) => (
              <div
                key={s.v}
                className="glass group animate-fade-up rounded-[20px] p-6 transition-transform hover:-translate-y-1 hover:shadow-glow"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-glow"
                  style={{ backgroundImage: "var(--gradient-accent)" }}
                >
                  <s.icon className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
                </span>
                <dt className="font-display mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {s.k}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}