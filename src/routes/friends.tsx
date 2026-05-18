import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MemberAvatar } from "@/components/layout/Avatar";
import { useStore, formatTHB, tripTotals, CURRENT_USER_ID } from "@/lib/store";

export const Route = createFileRoute("/friends")({
  head: () => ({ meta: [{ title: "Friends — SplitMate" }] }),
  component: FriendsPage,
});

function FriendsPage() {
  const { trips } = useStore();
  // Aggregate net balance per friend across all trips, from current user's POV.
  const balances = new Map<
    string,
    { member: (typeof trips)[0]["members"][0]; net: number; trips: number }
  >();
  for (const t of trips) {
    const { net } = tripTotals(t);
    const mine = net[CURRENT_USER_ID] ?? 0;
    const others = t.members.filter((m) => m.id !== CURRENT_USER_ID);
    // Distribute proportionally based on opposite-sign nets
    const opp = others.filter(
      (m) => Math.sign(net[m.id] ?? 0) !== Math.sign(mine) && net[m.id] !== 0,
    );
    const totalOpp = opp.reduce((s, m) => s + Math.abs(net[m.id]), 0) || 1;
    for (const m of others) {
      const cur = balances.get(m.id) ?? { member: m, net: 0, trips: 0 };
      const share = opp.includes(m) ? (Math.abs(net[m.id]) / totalOpp) * mine : 0;
      cur.net += share;
      cur.trips += 1;
      balances.set(m.id, cur);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Friends</h1>
          <p className="text-muted-foreground mt-1">People you've shared expenses with.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Add Friend
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-6">Friend</TableHead>
              <TableHead>Shared Trips</TableHead>
              <TableHead className="text-right pr-6">Net Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...balances.values()].map((b) => (
              <TableRow key={b.member.id} className="border-border hover:bg-accent/30">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <MemberAvatar member={b.member} />
                    <span className="font-medium">{b.member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{b.trips}</TableCell>
                <TableCell
                  className={`text-right pr-6 font-semibold tabular ${b.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {b.net >= 0 ? "+" : "−"}
                  {formatTHB(Math.abs(b.net))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
