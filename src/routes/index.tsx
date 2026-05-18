import { createFileRoute } from "@tanstack/react-router";
import { Plus, TrendingDown, TrendingUp, Plane, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { useStore, CURRENT_USER_ID, formatTHB, tripTotals } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — SplitMate" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { trips, createTrip } = useStore();

  let youOwe = 0, owedToYou = 0, monthSpend = 0;
  for (const t of trips) {
    const { net, total } = tripTotals(t);
    const n = net[CURRENT_USER_ID] ?? 0;
    if (n < 0) youOwe += -n; else owedToYou += n;
    monthSpend += total;
  }

  const widgets = [
    { label: "Total You Owe", value: formatTHB(youOwe), delta: "−2.4%", icon: TrendingDown, tone: "rose" },
    { label: "Owed to You", value: formatTHB(owedToYou), delta: "+18%", icon: TrendingUp, tone: "teal" },
    { label: "Active Trips", value: String(trips.length), delta: "Current", icon: Plane, tone: "indigo" },
    { label: "Total Spend", value: formatTHB(monthSpend), delta: "All trips", icon: Wallet, tone: "amber" },
  ] as const;

  const toneStyles: Record<string, string> = {
    rose: "bg-rose-50 text-rose-600",
    teal: "bg-teal-50 text-teal-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Good evening, Alex</h1>
        <p className="text-muted-foreground mt-1">Here's how your shared spending is looking today.</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {widgets.map(w => {
          const Icon = w.icon;
          return (
            <div key={w.label} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{w.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneStyles[w.tone]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 text-3xl font-semibold tabular">{w.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{w.delta}</div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Your Trips</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Continue tracking shared expenses with your groups.</p>
          </div>
          <Button onClick={() => createTrip("New Trip", "Somewhere")} className="gap-2">
            <Plus className="w-4 h-4" /> Create New Trip
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {trips.map(t => <TripCard key={t.id} trip={t} />)}
        </div>
      </div>
    </div>
  );
}
