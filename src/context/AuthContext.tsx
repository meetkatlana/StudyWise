import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: string; // ISO
  isGuest: boolean;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  memberSince: string;
}

interface AuthContextValue {
  user: User | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "avatar">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "prepcoach.user.v1";
const ACCOUNTS_KEY = "prepcoach.accounts.v1";

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeAccounts(list: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    const accounts = readAccounts();
    const found = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!found) throw new Error("No account found with that email.");
    if (found.password !== password) throw new Error("Incorrect password.");
    persist({
      id: found.id,
      name: found.name,
      email: found.email,
      avatar: found.avatar,
      memberSince: found.memberSince,
      isGuest: false,
    });
  };

  const signup: AuthContextValue["signup"] = async (name, email, password) => {
    const accounts = readAccounts();
    const normalizedEmail = email.trim().toLowerCase();
    if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail))
      throw new Error("An account with this email already exists.");
    const account: StoredAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      email: email.trim(),
      password,
      memberSince: new Date().toISOString(),
    };
    writeAccounts([...accounts, account]);
    persist({
      id: account.id,
      name: account.name,
      email: account.email,
      memberSince: account.memberSince,
      isGuest: false,
    });
  };

  const loginAsGuest = () => {
    persist({
      id: "guest",
      name: "Guest",
      email: "guest@prepcoach.ai",
      memberSince: new Date().toISOString(),
      isGuest: true,
    });
  };

  const logout = () => persist(null);

  const updateProfile: AuthContextValue["updateProfile"] = (patch) => {
    if (!user) return;
    const next = { ...user, ...patch };
    persist(next);
    if (!user.isGuest) {
      const accounts = readAccounts().map((a) =>
        a.id === user.id
          ? { ...a, name: next.name, email: next.email, avatar: next.avatar }
          : a,
      );
      writeAccounts(accounts);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      isAuthenticated: !!user,
      isGuest: !!user?.isGuest,
      login,
      signup,
      loginAsGuest,
      logout,
      updateProfile,
    }),
    [user, hydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
