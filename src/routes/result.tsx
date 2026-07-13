import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/result")({
  component: Result,
});

function Result() {
  return <div>Result Page</div>;
}