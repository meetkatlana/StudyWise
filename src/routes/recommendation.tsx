import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/recommendation")({
  component: Recommendation,
});

function Recommendation() {
  return <div>AI Recommendation Page</div>;
}