import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Pencil, Check, X } from "lucide-react";
import { RequireAuth } from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "../lib/history-store";
import { averageAccuracy, computeAchievements } from "../lib/achievements";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — PrepCoach.ai" }] }),
  component: () => (
    <RequireAuth requireFull>
      <ProfilePage />
    </RequireAuth>
  ),
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const { list } = useHistory();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const achievements = computeAchievements(list);
  const unlocked = achievements.filter((a) => a.unlocked);

  if (!user) return null;

  return (
    <main className="bg-hero">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="glass rounded-[24px] p-7 sm:p-9">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div
              className="grid h-20 w-20 place-items-center rounded-full text-2xl font-bold text-primary-foreground shadow-glow ring-4 ring-white/70"
              style={{ backgroundImage: "var(--gradient-accent)" }}
            >
              {initials(user.name)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-lg font-semibold text-foreground shadow-soft outline-none focus:border-primary/50"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-foreground shadow-soft outline-none focus:border-primary/50"
                  />
                </div>
              ) : (
                <>
                  <h1 className="font-display text-2xl font-bold text-foreground">{user.name}</h1>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Member since {new Date(user.memberSince).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      updateProfile({ name, email });
                      setEditing(false);
                    }}
                    className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
                  >
                    <Check className="h-4 w-4" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setName(user.name);
                      setEmail(user.email);
                      setEditing(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-foreground"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-white"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatBox label="Total quizzes" value={String(list.length)} />
            <StatBox label="Average accuracy" value={`${averageAccuracy(list)}%`} />
            <StatBox label="Achievements" value={`${unlocked.length}/${achievements.length}`} />
          </div>

          <div className="mt-8">
            <p className="font-display text-sm font-semibold text-foreground">Achievements</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    a.unlocked
                      ? "border-white/60 bg-white/70 shadow-soft"
                      : "border-dashed border-white/50 bg-white/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{a.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                  {a.progress && (
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {a.progress} {a.unlocked && "· Unlocked"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/60 pt-6">
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-soft">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
