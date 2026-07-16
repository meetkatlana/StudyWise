import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  Target,
  Trophy,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Rocket,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "../lib/history-store";
import {
  averageAccuracy,
  bestAndWeakestSubjects,
  currentStreak,
} from "../lib/achievements";
import { RequireAuth } from "../components/RequireAuth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PrepCoach.ai" }] }),
  component: () => (
    <RequireAuth requireFull>
      <DashboardPage />
    </RequireAuth>
  ),
});

function DashboardPage() {
  const { user } = useAuth();
  const { list } = useHistory();
  const streak = currentStreak(list);
  const avg = averageAccuracy(list);
  const { best, weakest } = bestAndWeakestSubjects(list);
  const recent = list[0];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="relative bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="animate-fade-up">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <Calendar className="h-3.5 w-3.5" /> {today}
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold text-foreground sm:text-4xl">
            Welcome back, <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Here's your placement prep at a glance.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Flame className="h-5 w-5" />} label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} tint="from-orange-400 to-red-500" />
          <StatCard icon={<Target className="h-5 w-5" />} label="Average score" value={`${avg}%`} tint="from-blue-500 to-indigo-600" />
          <StatCard icon={<Trophy className="h-5 w-5" />} label="Total quizzes" value={String(list.length)} tint="from-amber-400 to-orange-500" />
          <StatCard icon={<Sparkles className="h-5 w-5" />} label="Accuracy avg" value={`${avg}%`} tint="from-violet-500 to-fuchsia-500" />
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-[22px] p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Best subject</p>
            <p className="font-display mt-2 text-xl font-semibold text-foreground">
              {best ? best.subject : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {best ? `${best.avg}% average across ${best.count} quiz${best.count === 1 ? "" : "zes"}` : "Take a quiz to see stats"}
            </p>
          </div>
          <div className="glass rounded-[22px] p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Weakest subject</p>
            <p className="font-display mt-2 text-xl font-semibold text-foreground">
              {weakest ? weakest.subject : "—"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {weakest ? `Focus here — ${weakest.avg}% average` : "Take a quiz to see stats"}
            </p>
          </div>
          <div className="glass rounded-[22px] p-6">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Recent quiz</p>
            {recent ? (
              <>
                <p className="font-display mt-2 text-xl font-semibold text-foreground">
                  {recent.subject}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {recent.difficulty} · {recent.accuracy}% · {new Date(recent.createdAt).toLocaleDateString()}
                </p>
                <Link
                  to="/result"
                  search={{ id: recent.id }}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  View result <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No quizzes yet.</p>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/quiz"
            className="glass group flex items-center justify-between rounded-[22px] p-6 transition-all hover:-translate-y-1 hover:shadow-glow"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Continue learning</p>
              <p className="font-display mt-2 text-lg font-semibold text-foreground">
                Resume where you left off
              </p>
            </div>
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              <BookOpen className="h-5 w-5" />
            </span>
          </Link>
          <Link
            to="/quiz"
            className="glass group flex items-center justify-between rounded-[22px] p-6 transition-all hover:-translate-y-1 hover:shadow-glow"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Quick start</p>
              <p className="font-display mt-2 text-lg font-semibold text-foreground">
                Start a new quiz
              </p>
            </div>
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-accent)" }}
            >
              <Rocket className="h-5 w-5" />
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="glass rounded-[22px] p-5">
      <div className={`inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-soft ${tint}`}>
        {icon}
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
