import { useEffect, useState, useCallback } from "react";
import type { Difficulty, Question, Subject } from "./quiz-data";

export interface QuizAttempt {
  id: string;
  subject: Subject;
  difficulty: Difficulty;
  count: number;
  questions: Question[];
  answers: (number | null)[];
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  timeTakenSec: number;
  createdAt: string; // ISO
}

const KEY = "prepcoach.history.v1";
const EVT = "prepcoach:history-change";

function read(): QuizAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
  } catch {
    return [];
  }
}

function write(list: QuizAttempt[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getHistory(): QuizAttempt[] {
  return read();
}

export function getAttempt(id: string | undefined): QuizAttempt | undefined {
  if (!id) return undefined;
  return read().find((a) => a.id === id);
}

export function addAttempt(
  data: Omit<QuizAttempt, "id" | "createdAt">,
): QuizAttempt {
  const attempt: QuizAttempt = {
    ...data,
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const list = read();
  list.unshift(attempt);
  write(list);
  return attempt;
}

export function deleteAttempt(id: string) {
  write(read().filter((a) => a.id !== id));
}

export function clearHistory() {
  write([]);
}

/**
 * Reactive hook — components using this re-render when history changes
 * (add, delete, or clear), even from another tab.
 */
export function useHistory() {
  const [list, setList] = useState<QuizAttempt[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setList(read());
    setHydrated(true);
    const refresh = () => setList(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) refresh();
    };
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const refresh = useCallback(() => setList(read()), []);
  return { list, hydrated, refresh };
}

/** Reactive single-attempt lookup by id. */
export function useAttempt(id: string | undefined) {
  const { list, hydrated } = useHistory();
  const attempt = id ? list.find((a) => a.id === id) : undefined;
  return { attempt, hydrated };
}
