import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, BrainCircuit, Target, Trophy } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Powered by Generative AI
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Ace Your Placements with your{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Prep Coach
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            Generate personalized quizzes, get instant explanations, and receive
            smart study recommendations tailored to your goals — all in one place.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/quiz"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 sm:w-auto"
            >
              Start Practicing Now
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/recommendation"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent sm:w-auto"
            >
              Explore AI Coach
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border/60 pt-6 text-center lg:text-left">
            {[
              { k: "10k+", v: "Questions" },
              { k: "50+", v: "Topics" },
              { k: "95%", v: "Success rate" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-bold text-foreground">{s.k}</dt>
                <dd className="text-xs text-muted-foreground sm:text-sm">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-lg lg:mx-0">
          <div className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-primary/10">
            {/* Mock quiz card */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <BrainCircuit className="h-3.5 w-3.5" aria-hidden="true" />
                Data Structures
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Q 3 / 10
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-foreground">
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
                  className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                    opt.ok
                      ? "border-primary/40 bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <span>{opt.t}</span>
                  {opt.ok && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.58l7.3-7.3a1 1 0 011.4 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Adaptive difficulty
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                +50 XP
              </span>
            </div>
          </div>

          {/* Floating chips */}
          <div className="absolute -top-4 -right-4 hidden rounded-2xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-lg sm:block">
            <span className="text-primary">AI</span> Explanation ready
          </div>
          <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-lg sm:block">
            Score: <span className="text-primary">9 / 10</span>
          </div>
        </div>
      </div>
    </section>
  );
}