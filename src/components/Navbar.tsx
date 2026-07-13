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
    <header className="sticky top-0 z-50 w-full glass-nav">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
        >
          <span
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-glow transition-transform group-hover:scale-105"
            style={{ backgroundImage: "var(--gradient-accent)" }}
          >
            <Sparkles className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={2.25} />
          </span>
          <span className="font-display text-base sm:text-[17px]">
            PrepCoach<span className="gradient-text">.ai</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-0.5 rounded-full border border-white/50 bg-white/50 px-1.5 py-1 backdrop-blur-md md:flex">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-full px-3.5 py-1.5 text-sm font-semibold text-foreground bg-white shadow-soft",
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
            className="btn-primary inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-foreground shadow-soft transition-colors hover:bg-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden border-t border-white/40 bg-white/70 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-[26rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                activeProps={{
                  className:
                    "block rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground bg-white shadow-soft",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-3">
            <Link
              to="/quiz"
              onClick={() => setOpen(false)}
              className="btn-primary block rounded-2xl px-4 py-2.5 text-center text-sm font-semibold"
            >
              Start Practice
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}