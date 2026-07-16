import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "quiz" | "badge" | "reminder" | "roadmap";
  createdAt: string;
  read: boolean;
}

const KEY = "prepcoach.notifications.v1";

function read(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
function write(list: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

interface Ctx {
  notifications: AppNotification[];
  unread: number;
  push: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  clear: () => void;
}

const NotificationsContext = createContext<Ctx | null>(null);

const SEED: AppNotification[] = [
  {
    id: "seed_1",
    title: "Welcome to PrepCoach.ai",
    message: "Take your first quiz to unlock personalized recommendations.",
    type: "reminder",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "seed_2",
    title: "New study roadmap available",
    message: "Complete a quiz to generate a 7-day custom roadmap.",
    type: "roadmap",
    createdAt: new Date().toISOString(),
    read: false,
  },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<AppNotification[]>([]);

  useEffect(() => {
    const initial = read();
    if (initial.length === 0) {
      write(SEED);
      setList(SEED);
    } else {
      setList(initial);
    }
  }, []);

  const push = useCallback<Ctx["push"]>((n) => {
    setList((cur) => {
      const next: AppNotification[] = [
        {
          ...n,
          id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...cur,
      ].slice(0, 30);
      write(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setList((cur) => {
      const next = cur.map((n) => ({ ...n, read: true }));
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setList([]);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      notifications: list,
      unread: list.filter((n) => !n.read).length,
      push,
      markAllRead,
      clear,
    }),
    [list, push, markAllRead, clear],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
