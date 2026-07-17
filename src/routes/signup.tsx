import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormShell, TextField } from "../components/AuthFormShell";
import { useAuth } from "../context/AuthContext";

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
      </form>
    </AuthFormShell>
  );
}
