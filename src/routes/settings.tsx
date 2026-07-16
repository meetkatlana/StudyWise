import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Timer, Volume2, Sparkles, Save } from "lucide-react";
import { useState } from "react";
import { RequireAuth } from "../components/RequireAuth";
import { useSettings } from "../context/SettingsContext";
import { DIFFICULTIES, SUBJECTS } from "../lib/quiz-data";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — PrepCoach.ai" }] }),
  component: () => (
    <RequireAuth requireFull>
      <SettingsPage />
    </RequireAuth>
  ),
});

function SettingsPage() {
  const { settings, update } = useSettings();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  return (
    <main className="bg-hero">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Preferences
        </h1>
        <p className="mt-2 text-muted-foreground">Customize your experience. Everything saves locally.</p>

        <section className="glass mt-8 rounded-[22px] p-6">
          <p className="font-display text-sm font-semibold text-foreground">Appearance</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <ThemeCard
              active={settings.theme === "light"}
              onClick={() => update({ theme: "light" })}
              icon={<Sun className="h-4 w-4" />}
              label="Light"
            />
            <ThemeCard
              active={settings.theme === "dark"}
              onClick={() => update({ theme: "dark" })}
              icon={<Moon className="h-4 w-4" />}
              label="Dark"
            />
          </div>
        </section>

        <section className="glass mt-6 rounded-[22px] p-6">
          <p className="font-display text-sm font-semibold text-foreground">Quiz behavior</p>
          <div className="mt-4 space-y-3">
            <Toggle icon={<Timer className="h-4 w-4" />} label="Enable timer during quiz" checked={settings.timer} onChange={(v) => update({ timer: v })} />
            <Toggle icon={<Volume2 className="h-4 w-4" />} label="Enable sound effects" checked={settings.sounds} onChange={(v) => update({ sounds: v })} />
            <Toggle icon={<Sparkles className="h-4 w-4" />} label="Enable animations" checked={settings.animations} onChange={(v) => update({ animations: v })} />
          </div>
        </section>

        <section className="glass mt-6 rounded-[22px] p-6">
          <p className="font-display text-sm font-semibold text-foreground">Defaults</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Default subject</span>
              <select
                value={settings.defaultSubject}
                onChange={(e) => update({ defaultSubject: e.target.value as any })}
                className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm shadow-soft outline-none focus:border-primary/50"
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block font-medium text-foreground">Default difficulty</span>
              <select
                value={settings.defaultDifficulty}
                onChange={(e) => update({ defaultDifficulty: e.target.value as any })}
                className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm shadow-soft outline-none focus:border-primary/50"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setSavedAt(Date.now())}
            className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <Save className="h-4 w-4" /> Save preferences
          </button>
          {savedAt && (
            <span className="text-xs text-success">Preferences saved ✓</span>
          )}
        </div>
      </div>
    </main>
  );
}

function ThemeCard({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
        active
          ? "border-primary/40 bg-white shadow-glow"
          : "border-white/60 bg-white/60 hover:bg-white"
      }`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white">
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </button>
  );
}

function Toggle({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/60 bg-white/60 px-4 py-3">
      <span className="flex items-center gap-2.5 text-sm text-foreground">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary shadow-soft">{icon}</span>
        {label}
      </span>
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </label>
  );
}
