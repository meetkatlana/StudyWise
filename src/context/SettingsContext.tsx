import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Difficulty, Subject } from "../lib/quiz-data";

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

const KEY = "StudyWise.settings.v1";

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(settings));
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
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
