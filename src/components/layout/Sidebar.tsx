import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Plane, Users, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/trips", label: "My Trips", icon: Plane },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: s => s.location.pathname });

  return (
    <aside className="w-[240px] shrink-0 border-r border-border bg-sidebar flex flex-col">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-foreground">SplitMate</div>
          <div className="text-[11px] text-muted-foreground">Trip expenses, simplified</div>
        </div>
      </div>
      <nav className="p-3 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-3 py-2">Workspace</div>
        <ul className="space-y-1">
          {items.map(item => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-[18px] h-[18px]", active && "text-primary")} />
                  <span>{item.label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100">
        <div className="text-xs font-semibold text-teal-900">Pro tip</div>
        <div className="text-[12px] text-teal-800/80 mt-1 leading-relaxed">
          Settle balances at the end of each trip to keep things simple.
        </div>
      </div>
    </aside>
  );
}
