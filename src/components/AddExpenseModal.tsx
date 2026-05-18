import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MemberAvatar } from "@/components/layout/Avatar";
import { CATEGORIES } from "@/components/CategoryIcon";
import { useStore, type Trip, type Category } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AddExpenseModal({ trip, open, onOpenChange }: { trip: Trip; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addExpense } = useStore();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [payerId, setPayerId] = useState(trip.members[0].id);
  const [splitWith, setSplitWith] = useState<string[]>(trip.members.map(m => m.id));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const toggleSplit = (id: string) => {
    setSplitWith(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const reset = () => {
    setDescription(""); setAmount(""); setCategory("food");
    setPayerId(trip.members[0].id);
    setSplitWith(trip.members.map(m => m.id));
    setDate(new Date().toISOString().slice(0, 10));
  };

  const submit = () => {
    const amt = parseFloat(amount);
    if (!description || !amt || splitWith.length === 0) return;
    addExpense(trip.id, { description, amount: amt, category, payerId, splitWith, date });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 rounded-2xl overflow-hidden gap-0">
        <DialogHeader className="p-8 pb-6 border-b border-border">
          <DialogTitle className="text-2xl font-semibold tracking-tight">Add an expense</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Log a new shared cost for <span className="font-medium text-foreground">{trip.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" placeholder="e.g. Dinner at night market"
              value={description} onChange={e => setDescription(e.target.value)} className="h-11" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (THB)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">฿</span>
                <Input id="amount" type="number" placeholder="0.00" value={amount}
                  onChange={e => setAmount(e.target.value)} className="h-11 pl-7 tabular" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={v => setCategory(v as Category)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 w-fit" />
          </div>

          <div className="space-y-3">
            <Label>Who paid?</Label>
            <div className="grid grid-cols-4 gap-2">
              {trip.members.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayerId(m.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all",
                    payerId === m.id
                      ? "border-primary bg-accent ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <MemberAvatar member={m} size={28} />
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Split with</Label>
              <button
                type="button"
                onClick={() => setSplitWith(trip.members.map(m => m.id))}
                className="text-xs text-primary hover:underline"
              >
                Select all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trip.members.map(m => {
                const checked = splitWith.includes(m.id);
                return (
                  <label key={m.id} className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                    checked ? "border-primary/60 bg-accent/60" : "border-border hover:bg-muted/50"
                  )}>
                    <Checkbox checked={checked} onCheckedChange={() => toggleSplit(m.id)} />
                    <MemberAvatar member={m} size={28} />
                    <span className="text-sm font-medium">{m.name}</span>
                  </label>
                );
              })}
            </div>
            {splitWith.length > 0 && amount && (
              <div className="text-xs text-muted-foreground pt-1">
                Each person pays <span className="font-semibold text-foreground tabular">฿{(parseFloat(amount || "0") / splitWith.length).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="px-6">Add Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
