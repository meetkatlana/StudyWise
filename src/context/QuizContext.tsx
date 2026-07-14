import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { generateQuiz, type Difficulty, type Question, type Subject } from "../lib/quiz-data";

/**
 * QuizContext holds all quiz-flow state so it persists across route
 * navigations (config -> attempt -> result -> review -> recommendation)
 * without any backend. Everything is in-memory React state.
 */
interface QuizState {
  subject: Subject | null;
  difficulty: Difficulty | null;
  count: number | null;
  questions: Question[];
  // answers[i] = index of chosen option for question i, or null if unanswered.
  answers: (number | null)[];
  timeTakenSec: number;
  submitted: boolean;
}

interface QuizContextValue extends QuizState {
  setSubject: (s: Subject) => void;
  setDifficulty: (d: Difficulty) => void;
  setCount: (n: number) => void;
  startQuiz: () => void;
  selectAnswer: (questionIndex: number, optionIndex: number) => void;
  submitQuiz: (timeTakenSec: number) => void;
  resetQuiz: () => void;
  // Derived helpers
  correctCount: number;
  wrongCount: number;
  accuracy: number; // 0-100
}

const QuizContext = createContext<QuizContextValue | null>(null);

const initialState: QuizState = {
  subject: null,
  difficulty: null,
  count: null,
  questions: [],
  answers: [],
  timeTakenSec: 0,
  submitted: false,
};

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>(initialState);

  const value = useMemo<QuizContextValue>(() => {
    const correctCount = state.questions.reduce(
      (acc, q, i) => acc + (state.answers[i] === q.correctIndex ? 1 : 0),
      0,
    );
    const answered = state.answers.filter((a) => a !== null).length;
    const wrongCount = answered - correctCount;
    const accuracy = state.questions.length
      ? Math.round((correctCount / state.questions.length) * 100)
      : 0;

    return {
      ...state,
      correctCount,
      wrongCount,
      accuracy,
      setSubject: (s) => setState((p) => ({ ...p, subject: s })),
      setDifficulty: (d) => setState((p) => ({ ...p, difficulty: d })),
      setCount: (n) => setState((p) => ({ ...p, count: n })),
      startQuiz: () =>
        setState((p) => {
          if (!p.subject || !p.difficulty || !p.count) return p;
          const qs = generateQuiz(p.subject, p.difficulty, p.count);
          return {
            ...p,
            questions: qs,
            answers: new Array(qs.length).fill(null),
            submitted: false,
            timeTakenSec: 0,
          };
        }),
      selectAnswer: (qi, oi) =>
        setState((p) => {
          const next = [...p.answers];
          next[qi] = oi;
          return { ...p, answers: next };
        }),
      submitQuiz: (timeTakenSec) =>
        setState((p) => ({ ...p, submitted: true, timeTakenSec })),
      resetQuiz: () => setState(initialState),
    };
  }, [state]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
