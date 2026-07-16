import { Link } from "@tanstack/react-router";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Quiz", to: "/quiz" as const },
      { label: "Dashboard", to: "/dashboard" as const },
      { label: "Analytics", to: "/analytics" as const },
      { label: "AI Coach", to: "/recommendation" as const },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/" as const },
      { label: "Contact", to: "/" as const },
      { label: "Privacy Policy", to: "/" as const },
      { label: "Terms", to: "/" as const },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Study Resources", to: "/resources" as const },
      { label: "History", to: "/history" as const },
      { label: "Profile", to: "/profile" as const },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/40 bg-section">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-glow"
                style={{ backgroundImage: "var(--gradient-accent)" }}
              >
                <Sparkles className="h-4.5 w-4.5" strokeWidth={2.25} />
              </span>
              <span className="font-display text-[17px] font-semibold text-foreground">
                PrepCoach<span className="gradient-text">.ai</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Your AI-powered study companion for placement preparation.
              Personalized, adaptive, and always ready.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Github, label: "GitHub" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/60 bg-white/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-primary hover:shadow-soft"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} PrepCoach.ai — All rights reserved.</p>
          <p>Built for the IBM SkillsBuild Gen AI Internship.</p>
        </div>
      </div>
    </footer>
  );
}