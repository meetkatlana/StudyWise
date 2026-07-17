import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Sparkles } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-28 h-96 w-96 rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-28 h-88 w-88 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <header className="mx-auto max-w-2xl text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Contact StudyWise
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            We'd love to hear from you
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Share your feedback, questions, or suggestions. This form currently provides UI only.
          </p>
        </header>

        <div className="glass mt-10 animate-fade-up rounded-[24px] p-6 sm:p-8 lg:p-10">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-foreground">
                Name
                <input
                  type="text"
                  name="name"
                  className="mt-2 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                  placeholder="Your name"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Email
                <input
                  type="email"
                  name="email"
                  className="mt-2 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-foreground">
              Subject
              <input
                type="text"
                name="subject"
                className="mt-2 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                placeholder="How can we help?"
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Message
              <textarea
                name="message"
                rows={5}
                className="mt-2 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-foreground outline-none transition-colors"
                placeholder="Write your message"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Frontend-only form for now
              </p>
              <button
                type="submit"
                className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
