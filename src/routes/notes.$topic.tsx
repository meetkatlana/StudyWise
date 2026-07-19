import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ExternalLink, Sparkles } from "lucide-react";

export const Route = createFileRoute("/notes/$topic")({
  component: NotesPage,
});

function NotesPage() {
  const { topic } = Route.useParams();
  const decoded = decodeURIComponent(topic);
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${decoded} placement notes`,
  )}`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${decoded} tutorial`,
  )}`;

  return (
    <main className="relative overflow-hidden bg-hero">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Link
          to="/recommendation"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to AI Coach
        </Link>

        <div className="glass mt-6 rounded-[24px] p-6 sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Notes
          </span>
          <h1 className="font-display mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            {decoded}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            Notes for this topic are coming soon.
          </p>

          <p className="mt-6 text-sm text-foreground/80">
            While our curated notes are being prepared, here are quick starting
            points for <strong>{decoded}</strong>:
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Search reference articles
                </p>
                <p className="text-xs text-muted-foreground">Curated web results</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-soft"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Watch a tutorial</p>
                <p className="text-xs text-muted-foreground">YouTube results</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/quiz"
              search={{ topic: decoded }}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Practice {decoded} now
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center justify-center gap-2 rounded-2xl glass px-5 py-3 text-sm font-semibold text-foreground hover:-translate-y-0.5"
            >
              Browse all resources
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}