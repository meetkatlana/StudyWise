import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/Hero";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
    </main>
  );
}
