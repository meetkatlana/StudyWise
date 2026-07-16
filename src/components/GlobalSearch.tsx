import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useHistory } from "../lib/history-store";
import { SUBJECTS } from "../lib/quiz-data";
import { computeAchievements } from "../lib/achievements";

const RESOURCES = SUBJECTS.map((s) => ({ label: s, to: "/resources" as const }));

export function GlobalSearch() {
  const { list } = useHistory();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const achievements = useMemo(() => computeAchievements(list), [list]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: { label: string; group: string; to: string; params?: Record<string, string> }[] = [];
    SUBJECTS.forEach((s) => {
      if (s.toLowerCase().includes(term))
        out.push({ label: s, group: "Subject", to: "/quiz" });
    });
    RESOURCES.forEach((r) => {
      if (r.label.toLowerCase().includes(term))
        out.push({ label: `${r.label} — resources`, group: "Resources", to: "/resources" });
    });
    list.forEach((h) => {
      const line = `${h.subject} ${h.difficulty}`;
      if (line.toLowerCase().includes(term))
        out.push({
          label: `${h.subject} · ${h.difficulty} · ${h.accuracy}%`,
          group: "History",
          to: `/result?id=${h.id}`,
        });
    });
    achievements.forEach((a) => {
      if (a.title.toLowerCase().includes(term))
        out.push({ label: `${a.emoji} ${a.title}`, group: "Achievement", to: "/profile" });
    });
    return out.slice(0, 10);
  }, [q, list, achievements]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative w-full max-w-xs" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          placeholder="Search anything…"
          className="w-full rounded-full border border-white/60 bg-white/70 py-2 pl-9 pr-3 text-sm text-foreground shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
        />
      </div>
      {open && q && (
        <div className="glass absolute left-0 right-0 top-full mt-2 max-h-80 overflow-auto rounded-2xl p-2 shadow-glow">
          {results.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No results
            </p>
          )}
          {results.map((r, i) => (
            <Link
              key={i}
              to={r.to}
              onClick={() => {
                setOpen(false);
                setQ("");
              }}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white"
            >
              <span className="text-foreground">{r.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {r.group}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
