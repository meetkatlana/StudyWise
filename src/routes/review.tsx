import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Info, X } from "lucide-react";
import { useQuiz } from "../context/QuizContext";

export const Route = createFileRoute("/review")({
  component: Review,
});

function Review() {
  const { questions, answers } = useQuiz();

  if (questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Nothing to review
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Take a quiz to see answer explanations.
        </p>
        <Link
          to="/quiz"
          className="btn-primary mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold"
        >
          Start a quiz
        </Link>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[26rem] w-[26rem] rounded-full bg-secondary/20 blur-[110px]" />
        <div className="absolute top-1/2 -right-32 h-[24rem] w-[24rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="animate-fade-up">
          <Link
            to="/result"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Link>
          <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Review your <span className="gradient-text">answers</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Green means you nailed it. Red means it's worth a second look.
          </p>
        </div>

        <ol className="mt-10 space-y-5">
          {questions.map((q, qi) => {
            const selected = answers[qi];
            const isCorrect = selected === q.correctIndex;
            return (
              <li
                key={q.id}
                className={`glass animate-fade-up rounded-[22px] p-6 sm:p-7 ${
                  isCorrect
                    ? "ring-1 ring-success/40"
                    : "ring-1 ring-destructive/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-0.5">
                      Q{qi + 1}
                    </span>
                    <span className="rounded-md bg-white/70 px-2 py-0.5 text-foreground">
                      {q.topic}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isCorrect
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {isCorrect ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                    {isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>

                <h2 className="font-display mt-3 text-lg font-semibold text-foreground">
                  {q.question}
                </h2>

                <ul className="mt-4 space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSel = selected === oi;
                    const isAns = q.correctIndex === oi;
                    const cls = isAns
                      ? "border-success/40 bg-success/10 text-foreground"
                      : isSel
                        ? "border-destructive/40 bg-destructive/10 text-foreground"
                        : "border-white/60 bg-white/60 text-muted-foreground";
                    return (
                      <li
                        key={oi}
                        className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${cls}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="font-semibold">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <span>{opt}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          {isAns && (
                            <span className="inline-flex items-center gap-1 text-success">
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              Correct
                            </span>
                          )}
                          {isSel && !isAns && (
                            <span className="inline-flex items-center gap-1 text-destructive">
                              <X className="h-3.5 w-3.5" strokeWidth={3} />
                              Your pick
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-foreground">
                  <Info className="h-4 w-4 flex-shrink-0 text-primary" />
                  <p>
                    <span className="font-semibold">Explanation: </span>
                    {q.explanation}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
