import { useEffect, useRef, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";

export function NotificationBell() {
  const { notifications, unread, markAllRead, clear } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) markAllRead();
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-foreground shadow-soft transition-colors hover:bg-white"
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="glass absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl p-0 shadow-glow">
          <div className="flex items-center justify-between border-b border-white/60 px-4 py-3">
            <p className="font-display text-sm font-semibold text-foreground">
              Notifications
            </p>
            <button
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <ul className="max-h-80 overflow-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                You're all caught up ✨
              </li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className="border-b border-white/40 px-4 py-3 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.message}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
