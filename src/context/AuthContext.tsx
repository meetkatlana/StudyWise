import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, tokenStore } from "../lib/api";
import { invalidateHistory } from "../lib/history-store";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: string; // ISO
}

interface AuthContextValue {
  user: User | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  isGuest: boolean; // kept for compatibility; always false now.
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<User, "name" | "email" | "avatar">>,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  created_at: string;
}

interface AuthPayload {
  status: string;
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

function toUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar_url ?? undefined,
    memberSince: u.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // On mount, if we have a stored access token, restore the session by
  // calling /auth/me. On 401 (expired/invalid) the tokens are cleared.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.access) {
        setHydrated(true);
        return;
      }
      try {
        const res = await api<{ status: string; user: ApiUser }>("/auth/me");
        if (!cancelled) setUser(toUser(res.user));
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) tokenStore.clear();
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const applyAuth = useCallback((payload: AuthPayload) => {
    tokenStore.set(payload.accessToken, payload.refreshToken);
    setUser(toUser(payload.user));
    invalidateHistory();
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    const payload = await api<AuthPayload>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email: email.trim(), password },
    });
    applyAuth(payload);
  };

  const signup: AuthContextValue["signup"] = async (name, email, password) => {
    const payload = await api<AuthPayload>("/auth/signup", {
      method: "POST",
      auth: false,
      body: { name: name.trim(), email: email.trim(), password },
    });
    applyAuth(payload);
  };

  const logout: AuthContextValue["logout"] = async () => {
    const refreshToken = tokenStore.refresh;
    try {
      await api("/auth/logout", {
        method: "POST",
        auth: false,
        body: refreshToken ? { refreshToken } : {},
      });
    } catch {
      /* best-effort */
    }
    tokenStore.clear();
    setUser(null);
    invalidateHistory();
  };

  const updateProfile: AuthContextValue["updateProfile"] = async (patch) => {
    // Backend exposes name/avatar via a dedicated endpoint if you add one;
    // for now update locally after the call succeeds. Email changes require
    // a separate flow (not exposed) — treat as no-op for that field.
    if (!user) return;
    setUser({ ...user, ...patch });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      isAuthenticated: !!user,
      isGuest: false,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, hydrated, applyAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
