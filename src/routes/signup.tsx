import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Chrome, Github } from "lucide-react";
import { AuthFormShell, TextField } from "../components/AuthFormShell";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — StudyWise" },
      { name: "description", content: "Create your StudyWise account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthFormShell
      title="Create your account"
      subtitle="Start your personalized placement journey."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          if (password.length < 6) {
            setErr("Password must be at least 6 characters.");
            return;
          }
          if (password !== confirm) {
            setErr("Passwords do not match.");
            return;
          }
          setLoading(true);
          try {
            await signup(name, email, password);
            navigate({ to: "/dashboard" });
          } catch (e: any) {
            setErr(e.message ?? "Failed to create account.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <TextField
          label="Full name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
        />
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        <TextField
          label="Confirm password"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
        />
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
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-white/70 px-3 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
            or sign up with
          </span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/60" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SocialBtn provider="google" icon={<Chrome className="h-4 w-4" />} label="Google" />
          <SocialBtn provider="github" icon={<Github className="h-4 w-4" />} label="GitHub" />
        </div>
      </form>
    </AuthFormShell>
  );
}

function SocialBtn({
  provider,
  icon,
  label,
}: {
  provider: "google" | "github";
  icon: React.ReactNode;
  label: string;
}) {
  const start = () => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };
  return (
    <button
      type="button"
      onClick={start}
      className="flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-sm font-medium text-foreground shadow-soft transition-colors hover:bg-white"
    >
      {icon}
      {label}
    </button>
  );
}
