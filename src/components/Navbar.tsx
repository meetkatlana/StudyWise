import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Sparkles } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/quiz", label: "Quiz" },
  { to: "/result", label: "Results" },
  { to: "/recommendation", label: "AI Coach" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base sm:text-lg">
            AI Placement <span className="text-primary">Prep</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-lg px-3 py-2 text-sm font-medium text-foreground bg-accent",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex">
          <Link
            to="/quiz"
            className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md"
          >
            Start Practice
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 py-3 sm:px-6">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{
                  className:
                    "block rounded-lg px-3 py-2 text-sm font-medium text-foreground bg-accent",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link
              to="/quiz"
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90"
            >
              Start Practice
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}