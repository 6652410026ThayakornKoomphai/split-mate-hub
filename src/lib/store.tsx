import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Member = { id: string; name: string; color: string };
export type Category = "food" | "lodging" | "transport" | "activity" | "coffee" | "other";

export type Expense = {
  id: string;
  date: string; // ISO
  description: string;
  category: Category;
  amount: number;
  payerId: string;
  splitWith: string[]; // member ids
};

export type Trip = {
  id: string;
  name: string;
  location: string;
  dateRange: string;
  cover: string; // tailwind gradient
  budget: number;
  members: Member[];
  expenses: Expense[];
};

export const CURRENT_USER_ID = "m1";

const seedMembers: Member[] = [
  { id: "m1", name: "Alex", color: "from-teal-400 to-cyan-500" },
  { id: "m2", name: "Bob", color: "from-amber-400 to-orange-500" },
  { id: "m3", name: "Priya", color: "from-fuchsia-400 to-pink-500" },
  { id: "m4", name: "Mei", color: "from-indigo-400 to-violet-500" },
];

const seedTrips: Trip[] = [
  {
    id: "t1",
    name: "Chiang Mai Trip",
    location: "Chiang Mai, Thailand",
    dateRange: "Nov 12 – 18, 2025",
    cover: "from-teal-300 via-emerald-300 to-amber-200",
    budget: 40000,
    members: seedMembers,
    expenses: [
      { id: "e1", date: "2025-11-12", description: "Airport taxi", category: "transport", amount: 800, payerId: "m1", splitWith: ["m1","m2","m3","m4"] },
      { id: "e2", date: "2025-11-12", description: "Hotel night 1", category: "lodging", amount: 4500, payerId: "m2", splitWith: ["m1","m2","m3","m4"] },
      { id: "e3", date: "2025-11-13", description: "Street food dinner", category: "food", amount: 1200, payerId: "m3", splitWith: ["m1","m2","m3","m4"] },
      { id: "e4", date: "2025-11-14", description: "Temple tour", category: "activity", amount: 2400, payerId: "m4", splitWith: ["m1","m2","m3","m4"] },
      { id: "e5", date: "2025-11-15", description: "Coffee & cake", category: "coffee", amount: 520, payerId: "m1", splitWith: ["m1","m3"] },
    ],
  },
  {
    id: "t2",
    name: "Tokyo Weekend",
    location: "Tokyo, Japan",
    dateRange: "Sep 5 – 8, 2025",
    cover: "from-rose-300 via-pink-200 to-indigo-200",
    budget: 60000,
    members: seedMembers.slice(0, 3),
    expenses: [
      { id: "e6", date: "2025-09-05", description: "Shinkansen", category: "transport", amount: 14200, payerId: "m1", splitWith: ["m1","m2","m3"] },
    ],
  },
  {
    id: "t3",
    name: "Bali Retreat",
    location: "Ubud, Bali",
    dateRange: "Mar 2 – 9, 2026",
    cover: "from-emerald-300 via-teal-200 to-sky-200",
    budget: 50000,
    members: seedMembers,
    expenses: [],
  },
];

type Store = {
  trips: Trip[];
  addExpense: (tripId: string, e: Omit<Expense, "id">) => void;
  settleUp: (tripId: string, fromId: string, toId: string, amount: number) => void;
  createTrip: (name: string, location: string) => string;
  deleteTrip: (tripId: string) => void;
};

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(seedTrips);

  const value = useMemo<Store>(() => ({
    trips,
    addExpense: (tripId, e) => {
      setTrips(prev => prev.map(t => t.id === tripId
        ? { ...t, expenses: [...t.expenses, { ...e, id: `e${Date.now()}` }] }
        : t));
    },
    settleUp: (tripId, fromId, toId, amount) => {
      // Record settlement as an expense paid by `from` only split with `from`,
      // offset by the same amount paid by `to` only split with `to`.
      // Simpler: record a virtual transfer expense.
      setTrips(prev => prev.map(t => {
        if (t.id !== tripId) return t;
        const transfer: Expense = {
          id: `s${Date.now()}`,
          date: new Date().toISOString().slice(0,10),
          description: "Settlement",
          category: "other",
          amount,
          payerId: fromId,
          splitWith: [toId],
        };
        return { ...t, expenses: [...t.expenses, transfer] };
      }));
    },
    createTrip: (name, location) => {
      const id = `t${Date.now()}`;
      setTrips(prev => [...prev, {
        id, name, location,
        dateRange: "TBD",
        cover: "from-sky-300 via-teal-200 to-emerald-200",
        budget: 20000,
        members: seedMembers,
        expenses: [],
      }]);
      return id;
    },
  }), [trips]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}

// Selectors
export function tripTotals(trip: Trip) {
  const total = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const paidBy: Record<string, number> = {};
  const owes: Record<string, number> = {};
  for (const m of trip.members) { paidBy[m.id] = 0; owes[m.id] = 0; }
  for (const e of trip.expenses) {
    paidBy[e.payerId] = (paidBy[e.payerId] ?? 0) + e.amount;
    const share = e.amount / e.splitWith.length;
    for (const sid of e.splitWith) owes[sid] = (owes[sid] ?? 0) + share;
  }
  const net: Record<string, number> = {};
  for (const m of trip.members) net[m.id] = (paidBy[m.id] ?? 0) - (owes[m.id] ?? 0);
  return { total, paidBy, owes, net };
}

export function suggestSettlements(trip: Trip) {
  const { net } = tripTotals(trip);
  const creditors = Object.entries(net).filter(([,v]) => v > 0.5).map(([id,v]) => ({ id, v }));
  const debtors = Object.entries(net).filter(([,v]) => v < -0.5).map(([id,v]) => ({ id, v: -v }));
  creditors.sort((a,b) => b.v - a.v);
  debtors.sort((a,b) => b.v - a.v);
  const out: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].v, creditors[j].v);
    out.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(pay) });
    debtors[i].v -= pay; creditors[j].v -= pay;
    if (debtors[i].v < 0.5) i++;
    if (creditors[j].v < 0.5) j++;
  }
  return out;
}

export function formatTHB(n: number) {
  return "฿" + Math.round(n).toLocaleString("en-US");
}
