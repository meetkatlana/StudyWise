import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthFormShell, TextField } from "../components/AuthFormShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — PrepCoach.ai" },
      { name: "description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthFormShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-5 text-center">
          <MailCheck className="mx-auto h-8 w-8 text-success" />
          <p className="mt-2 font-semibold text-foreground">Reset link sent</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check your inbox at <strong>{email}</strong> for reset instructions.
          </p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button
            type="submit"
            className="btn-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold"
          >
            Send reset link
          </button>
        </form>
      )}
    </AuthFormShell>
  );
}
