import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user)
    return (
      <Link
        to="/login"
        className="btn-primary inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
      >
        Sign in
      </Link>
    );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-primary-foreground shadow-glow ring-2 ring-white/70"
        style={{ backgroundImage: "var(--gradient-accent)" }}
        aria-label="Profile menu"
      >
        {initials(user.name || "?")}
      </button>
      {open && (
        <div className="glass absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-glow">
          <div className="border-b border-white/60 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            {user.isGuest && (
              <span className="mt-1 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                Guest mode
              </span>
            )}
          </div>
          <MenuItem to="/dashboard" onClick={() => setOpen(false)} icon={<LayoutDashboard className="h-4 w-4" />}>Dashboard</MenuItem>
          <MenuItem to="/profile" onClick={() => setOpen(false)} icon={<User className="h-4 w-4" />}>Profile</MenuItem>
          <MenuItem to="/settings" onClick={() => setOpen(false)} icon={<SettingsIcon className="h-4 w-4" />}>Settings</MenuItem>
          <button
            onClick={() => {
              logout();
              setOpen(false);
              navigate({ to: "/login" });
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-white"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  to,
  onClick,
  icon,
  children,
}: {
  to: "/dashboard" | "/profile" | "/settings";
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-white"
    >
      {icon}
      {children}
    </Link>
  );
}
