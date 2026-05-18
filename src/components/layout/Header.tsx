import { useRouterState, Link } from "@tanstack/react-router";
import { Search, ChevronDown, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useStore, CURRENT_USER_ID } from "@/lib/store";

function useBreadcrumbs() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const { trips } = useStore();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; to?: string }[] = [{ label: "Home", to: "/" }];
  if (parts[0] === "trips") {
    crumbs.push({ label: "My Trips", to: "/trips" });
    if (parts[1]) {
      const t = trips.find(x => x.id === parts[1]);
      crumbs.push({ label: t?.name ?? parts[1] });
    }
  } else if (parts[0]) {
    crumbs.push({ label: parts[0][0].toUpperCase() + parts[0].slice(1) });
  }
  return crumbs;
}

export function Header() {
  const crumbs = useBreadcrumbs();
  const { trips } = useStore();
  const me = trips[0]?.members.find(m => m.id === CURRENT_USER_ID);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center px-8 gap-6 sticky top-0 z-20">
      <nav className="flex items-center gap-2 text-sm">
        {crumbs.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground/60">/</span>}
            {c.to ? (
              <Link to={c.to} className="text-muted-foreground hover:text-foreground transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{c.label}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative w-[380px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trips, expenses, friends…"
            className="pl-9 h-10 bg-muted/60 border-transparent focus-visible:bg-card"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 h-5 text-[10px] font-medium text-muted-foreground bg-card border border-border rounded absolute right-3 top-1/2 -translate-y-1/2">
            ⌘K
          </kbd>
        </div>

        <button className="w-10 h-10 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
              {me?.name[0] ?? "A"}
            </div>
            <span className="text-sm font-medium">{me?.name ?? "Alex"}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
