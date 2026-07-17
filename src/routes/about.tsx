import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BrainCircuit, Target, BarChart3, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-28 h-88 w-88 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <header className="mx-auto max-w-3xl text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            About StudyWise
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Smarter placement preparation, built for consistency
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            StudyWise is a placement preparation platform designed to help students practice with purpose. It combines personalized quizzes, AI-powered explanations, weak-topic identification, and analytics so every session moves you closer to interview readiness.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Target,
              title: "Personalized Placement Quizzes",
              description:
                "Create targeted quiz sessions by subject, difficulty, and question count to match your current preparation stage.",
            },
            {
              icon: BrainCircuit,
              title: "AI-Powered Explanations",
              description:
                "Get clear explanations that help you understand why an answer works, not just what the answer is.",
            },
            {
              icon: BarChart3,
              title: "Weak-Topic Identification",
              description:
                "Track recurring mistakes and topic-level performance to prioritize what to revise next.",
            },
            {
              icon: Sparkles,
              title: "Placement-Focused Preparation",
              description:
                "Practice in a structured flow designed for campus placements with measurable progress over time.",
            },
          ].map((item, idx) => (
            <article
              key={item.title}
              className="glass animate-fade-up rounded-4xl p-6 transition-transform hover:-translate-y-1 hover:shadow-glow"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-glow"
                style={{ backgroundImage: "var(--gradient-accent)" }}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
              </span>
              <h2 className="font-display mt-4 text-xl font-semibold tracking-tight text-foreground">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/quiz"
            className="btn-primary group inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-semibold"
          >
            Start Practicing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
