import { UtensilsCrossed, Hotel, Car, Ticket, Coffee, Receipt } from "lucide-react";
import type { Category } from "@/lib/store";
import { cn } from "@/lib/utils";

const map = {
  food: { icon: UtensilsCrossed, bg: "bg-amber-100", fg: "text-amber-700", label: "Food" },
  lodging: { icon: Hotel, bg: "bg-indigo-100", fg: "text-indigo-700", label: "Lodging" },
  transport: { icon: Car, bg: "bg-sky-100", fg: "text-sky-700", label: "Transport" },
  activity: { icon: Ticket, bg: "bg-fuchsia-100", fg: "text-fuchsia-700", label: "Activity" },
  coffee: { icon: Coffee, bg: "bg-orange-100", fg: "text-orange-700", label: "Coffee" },
  other: { icon: Receipt, bg: "bg-slate-100", fg: "text-slate-700", label: "Other" },
} as const;

export const CATEGORIES = Object.entries(map).map(([id, v]) => ({ id: id as Category, label: v.label }));

export function CategoryIcon({ category, size = 36 }: { category: Category; size?: number }) {
  const cfg = map[category];
  const Icon = cfg.icon;
  return (
    <div
      className={cn("rounded-lg flex items-center justify-center", cfg.bg, cfg.fg)}
      style={{ width: size, height: size }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}

export function categoryLabel(c: Category) { return map[c].label; }
