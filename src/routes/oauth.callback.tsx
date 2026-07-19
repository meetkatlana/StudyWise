import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { tokenStore } from "../lib/api";

interface OAuthCallbackSearch {
  accessToken?: string;
  refreshToken?: string;
  oauth_error?: string;
}

export const Route = createFileRoute("/oauth/callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — StudyWise" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): OAuthCallbackSearch => ({
    accessToken:  typeof s.accessToken  === "string" ? s.accessToken  : undefined,
    refreshToken: typeof s.refreshToken === "string" ? s.refreshToken : undefined,
    oauth_error:  typeof s.oauth_error  === "string" ? s.oauth_error  : undefined,
  }),
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { accessToken, refreshToken, oauth_error } = Route.useSearch();
  const [err, setErr] = useState<string | null>(oauth_error ?? null);

  useEffect(() => {
    if (oauth_error) return;
    if (!accessToken) {
      setErr("Missing access token in OAuth response");
      return;
    }
    tokenStore.set(accessToken, refreshToken ?? null);
    // Hard reload so AuthProvider re-hydrates the user from /auth/me
    // and the app boots into an authenticated state.
    window.location.replace("/dashboard");
  }, [accessToken, refreshToken, oauth_error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      {err ? (
        <>
          <h1 className="font-display text-2xl font-bold text-destructive">
            Sign-in failed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{err}</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="btn-primary mt-6 rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Back to login
          </button>
        </>
      ) : (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            Completing sign-in…
          </p>
        </>
      )}
    </main>
  );
}