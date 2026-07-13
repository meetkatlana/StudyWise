import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/attempt")({
  component: Attempt,
});

function Attempt() {
  return <div>Quiz Attempt Page</div>;
}