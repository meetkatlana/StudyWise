import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quiz")({
  component: QuizConfig,
});

function QuizConfig() {
  return <div>Quiz Configuration Page</div>;
}