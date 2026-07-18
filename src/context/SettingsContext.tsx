import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Difficulty, Subject } from "../lib/quiz-data";
import { api, tokenStore } from "../lib/api";

export interface Settings {
  theme: "light" | "dark";
  timer: boolean;
  sounds: boolean;
  animations: boolean;
  defaultDifficulty: Difficulty;
  defaultSubject: Subject;
}

const DEFAULTS: Settings = {
  theme: "light",
  timer: true,
  sounds: true,
  animations: true,
  defaultDifficulty: "Medium",
  defaultSubject: "Java",
};


interface Ctx {
  settings: Settings;
  hydrated: boolean;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const skipNextSave = useRef(true);

  // Load settings from the backend on mount when a session exists.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.access) {
        setHydrated(true);
        return;
      }
      try {
        const res = await api<{ status: string; settings: Partial<Settings> }>(
          "/settings",
        );
        if (!cancelled && res.settings) {
          setSettings({ ...DEFAULTS, ...res.settings });
        }
      } catch {
        /* fall back to defaults */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist to backend on change (debounced by React batching). Apply theme
  // side effect either way.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (!tokenStore.access) return;
    api("/settings", { method: "PUT", body: { settings } }).catch(() => {
      /* ignore transient save failures */
    });
  }, [settings, hydrated]);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      hydrated,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      reset: () => setSettings(DEFAULTS),
    }),
    [settings, hydrated],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
