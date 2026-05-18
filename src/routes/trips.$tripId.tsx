import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowLeftRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MemberAvatar, AvatarStack } from "@/components/layout/Avatar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { useStore, formatTHB, tripTotals, suggestSettlements } from "@/lib/store";

export const Route = createFileRoute("/trips/$tripId")({
  head: () => ({ meta: [{ title: "Trip — SplitMate" }] }),
  component: TripDetail,
});

function TripDetail() {
  const { tripId } = Route.useParams();
  const { trips, settleUp } = useStore();
  const trip = trips.find(t => t.id === tripId);
  const [open, setOpen] = useState(false);

  if (!trip) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h2 className="text-xl font-semibold">Trip not found</h2>
        <Link to="/trips" className="text-primary hover:underline mt-2 inline-block">Back to trips</Link>
      </div>
    );
  }

  const { total, paidBy, net } = tripTotals(trip);
  const settlements = suggestSettlements(trip);
  const memberById = (id: string) => trip.members.find(m => m.id === id)!;
  const sorted = [...trip.expenses].sort((a, b) => b.date.localeCompare(a.date));
  const budgetPct = Math.min(100, (total / trip.budget) * 100);

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Trip header */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className={`h-28 bg-gradient-to-br ${trip.cover} relative`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_60%)]" />
        </div>
        <div className="px-8 py-6 flex items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{trip.name}</h1>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{trip.location}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{trip.dateRange}</span>
            </div>
          </div>
          <AvatarStack members={trip.members} size={36} />
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
            <div className="text-2xl font-semibold tabular">{formatTHB(total)}</div>
          </div>
        </div>
      </div>

      {/* Split-pane */}
      <div className="grid grid-cols-[3fr_2fr] gap-6 items-start">
        {/* Left: Expenses */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div>
              <h2 className="font-semibold">Expenses</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{trip.expenses.length} entries</p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="pl-6 w-[110px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Split</TableHead>
                <TableHead className="text-right pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(e => {
                const payer = memberById(e.payerId);
                const splitters = e.splitWith.map(memberById);
                return (
                  <TableRow key={e.id} className="border-border hover:bg-accent/30 transition-colors">
                    <TableCell className="pl-6 text-muted-foreground text-sm tabular">
                      {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={e.category} />
                        <span className="font-medium">{e.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MemberAvatar member={payer} size={26} />
                        <span className="text-sm">{payer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><AvatarStack members={splitters} size={24} max={4} /></TableCell>
                    <TableCell className="text-right pr-6 font-semibold tabular">{formatTHB(e.amount)}</TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  No expenses yet. Add the first one to get started.
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right: Balances */}
        <div className="space-y-6 sticky top-24">
          {/* Budget */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Trip Budget</h3>
              <span className="text-xs text-muted-foreground tabular">{formatTHB(total)} / {formatTHB(trip.budget)}</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all"
                style={{ width: `${budgetPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {budgetPct < 100
                ? `${(100 - budgetPct).toFixed(0)}% remaining — you're on track.`
                : `Over budget by ${formatTHB(total - trip.budget)}.`}
            </p>
          </div>

          {/* Who paid */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-semibold">Who paid what</h3>
            <div className="mt-5 space-y-4">
              {trip.members.map(m => {
                const paid = paidBy[m.id] ?? 0;
                const pct = total > 0 ? (paid / total) * 100 : 0;
                return (
                  <div key={m.id}>
                    <div className="flex items-center gap-3">
                      <MemberAvatar member={m} size={28} />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{m.name}</span>
                        <span className="text-sm tabular text-muted-foreground">{formatTHB(paid)}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden ml-10">
                      <div className="h-full bg-primary/70 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settlements */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Suggested Settlements</h3>
              <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            </div>
            {settlements.length === 0 ? (
              <div className="mt-6 text-center py-6">
                <div className="text-2xl">🎉</div>
                <p className="text-sm text-muted-foreground mt-2">Everyone is settled up!</p>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {settlements.map((s, i) => {
                  const from = memberById(s.from);
                  const to = memberById(s.to);
                  return (
                    <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <MemberAvatar member={from} size={28} />
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{from.name}</span>
                        <span className="text-muted-foreground"> owes </span>
                        <span className="font-medium">{to.name}</span>
                        <div className="font-semibold tabular text-foreground mt-0.5">{formatTHB(s.amount)}</div>
                      </div>
                      <MemberAvatar member={to} size={28} />
                      <Button size="sm" variant="outline" className="ml-2"
                        onClick={() => settleUp(trip.id, s.from, s.to, s.amount)}>
                        Settle
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-5 pt-5 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Net balance</div>
              <div className="grid grid-cols-2 gap-2">
                {trip.members.map(m => {
                  const n = net[m.id] ?? 0;
                  const pos = n >= 0;
                  return (
                    <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg">
                      <MemberAvatar member={m} size={22} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground truncate">{m.name}</div>
                        <div className={`text-sm font-semibold tabular ${pos ? "text-emerald-600" : "text-rose-600"}`}>
                          {pos ? "+" : "−"}{formatTHB(Math.abs(n))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal trip={trip} open={open} onOpenChange={setOpen} />
    </div>
  );
}
