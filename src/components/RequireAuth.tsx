import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";

/**
 * Client-side route guard. When `requireFull` is true, guest sessions are
 * also redirected to /login. Renders children only when access is allowed.
 */
export function RequireAuth({
  children,
  requireFull = false,
}: {
  children: ReactNode;
  requireFull?: boolean;
}) {
  const { user, hydrated, isGuest } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const blocked = hydrated && (!user || (requireFull && isGuest));

  useEffect(() => {
    if (blocked) {
      navigate({
        to: "/login",
        search: { redirect: pathname },
      });
    }
  }, [blocked, navigate, pathname]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (blocked) return null;
  return <>{children}</>;
}
