import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function AuthFormShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-hero">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 py-14 sm:px-6">
        <div className="w-full max-w-md">
          <div className="glass rounded-[24px] p-7 sm:p-9 animate-fade-up">
            <Link to="/" className="mb-6 inline-flex items-center gap-2.5">
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
            <h1 className="font-display text-2xl font-bold text-foreground">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
            {footer && (
              <div className="mt-6 border-t border-white/60 pt-5 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export function TextField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm text-foreground shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
      />
    </label>
  );
}
