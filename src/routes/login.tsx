import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Chrome, User } from "lucide-react";
import { AuthFormShell, TextField } from "../components/AuthFormShell";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — StudyWise" },
      { name: "description", content: "Sign in to your StudyWise account." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = () => {
    if (search.redirect) window.location.assign(search.redirect);
    else navigate({ to: "/dashboard" });
  };

  return (
    <AuthFormShell
      title="Welcome back"
      subtitle="Sign in to continue your placement prep."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setLoading(true);
          try {
            await login(email, password);
            next();
          } catch (e: any) {
            setErr(e.message ?? "Failed to sign in.");
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4"
      >
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/60 accent-primary"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        {err && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-white/70 px-3 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
            or continue with
          </span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/60" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SocialBtn icon={<Chrome className="h-4 w-4" />} label="Google" />
          <SocialBtn icon={<Github className="h-4 w-4" />} label="GitHub" />
        </div>

        <button
          type="button"
          onClick={() => {
            loginAsGuest();
            next();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-white"
        >
          <User className="h-4 w-4" />
          Continue as guest
        </button>
      </form>
    </AuthFormShell>
  );
}

function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-sm font-medium text-foreground shadow-soft transition-colors hover:bg-white"
    >
      {icon}
      {label}
    </button>
  );
}
