import { useEffect, useState, useCallback } from "react";
import { api, ApiError, tokenStore } from "./api";
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

/**
 * History store — backed by the Express + PostgreSQL backend.
 * A small in-memory cache is shared across hook instances so that add/delete
 * updates render immediately without a round-trip.
 */

const EVT = "StudyWise:history-change";

let cache: QuizAttempt[] | null = null;
let inflight: Promise<QuizAttempt[]> | null = null;

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

async function fetchHistory(): Promise<QuizAttempt[]> {
  if (!tokenStore.access) {
    cache = [];
    return cache;
  }
  const res = await api<{ status: string; attempts: QuizAttempt[] }>(
    "/history",
  );
  cache = res.attempts ?? [];
  return cache;
}

function ensureLoaded(): Promise<QuizAttempt[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchHistory().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export async function getHistory(): Promise<QuizAttempt[]> {
  return ensureLoaded();
}

export async function getAttempt(
  id: string | undefined,
): Promise<QuizAttempt | undefined> {
  if (!id) return undefined;
  const list = await ensureLoaded();
  const local = list.find((a) => a.id === id);
  if (local) return local;
  try {
    const res = await api<{ status: string; attempt: QuizAttempt }>(
      `/attempts/${id}`,
    );
    return res.attempt;
  } catch {
    return undefined;
  }
}

export async function addAttempt(
  data: Omit<QuizAttempt, "id" | "createdAt">,
): Promise<QuizAttempt> {
  const res = await api<{ status: string; attempt: QuizAttempt }>(
    "/attempts/snapshot",
    {
      method: "POST",
      body: {
        subject: data.subject,
        difficulty: data.difficulty,
        questions: data.questions,
        answers: data.answers,
        timeTakenSec: data.timeTakenSec,
      },
    },
  );
  const attempt = res.attempt;
  cache = [attempt, ...(cache ?? [])];
  emit();
  return attempt;
}

export async function deleteAttempt(id: string): Promise<void> {
  await api(`/attempts/${id}`, { method: "DELETE" });
  cache = (cache ?? []).filter((a) => a.id !== id);
  emit();
}

export async function clearHistory(): Promise<void> {
  await api("/history", { method: "DELETE" });
  cache = [];
  emit();
}

/**
 * Invalidate the in-memory cache — used on sign in / sign out so the next
 * consumer refetches with the new session.
 */
export function invalidateHistory() {
  cache = null;
  emit();
}

/**
 * Reactive hook — components re-render on add / delete / clear.
 */
export function useHistory() {
  const [list, setList] = useState<QuizAttempt[]>(cache ?? []);
  const [hydrated, setHydrated] = useState(cache !== null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await ensureLoaded();
        if (!cancelled) {
          setList(data);
          setHydrated(true);
        }
      } catch {
        if (!cancelled) {
          setList([]);
          setHydrated(true);
        }
      }
    };
    load();
    const refresh = () => {
      if (cache === null) {
        setHydrated(false);
        load();
      } else {
        setList(cache);
      }
    };
    window.addEventListener(EVT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(EVT, refresh);
    };
  }, []);

  const refresh = useCallback(async () => {
    cache = null;
    const data = await ensureLoaded();
    setList(data);
  }, []);

  return { list, hydrated, refresh };
}

/** Reactive single-attempt lookup by id. */
export function useAttempt(id: string | undefined) {
  const { list, hydrated } = useHistory();
  const [remote, setRemote] = useState<QuizAttempt | undefined>(undefined);

  const local = id ? list.find((a) => a.id === id) : undefined;

  useEffect(() => {
    if (!id || local || !hydrated) return;
    let cancelled = false;
    getAttempt(id).then((a) => {
      if (!cancelled) setRemote(a);
    });
    return () => { cancelled = true; };
  }, [id, local, hydrated]);

  return { attempt: local ?? remote, hydrated };
}

// Suppress unused import when not referenced in the compiled output.
export type { ApiError };
