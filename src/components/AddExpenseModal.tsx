import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MemberAvatar } from "@/components/layout/Avatar";
import { CATEGORIES } from "@/components/CategoryIcon";
import { useStore, type Trip, type Category } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Camera, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CURRENCIES = [
  { code: "THB", label: "THB (฿)", rate: 1, symbol: "฿" },
  { code: "JPY", label: "JPY (¥)", rate: 0.22, symbol: "¥" },
  { code: "KRW", label: "KRW (₩)", rate: 0.024, symbol: "₩" },
  { code: "USD", label: "USD ($)", rate: 34.5, symbol: "$" },
];

export function AddExpenseModal({
  trip,
  open,
  onOpenChange,
}: {
  trip: Trip;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addExpense } = useStore();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("THB");
  const [category, setCategory] = useState<Category>("food");
  const [payerId, setPayerId] = useState(trip.members[0].id);
  const [splitWith, setSplitWith] = useState<string[]>(trip.members.map((m) => m.id));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // New State for Exact Splits
  const [splitMethod, setSplitMethod] = useState<"equal" | "exact">("equal");
  const [exactSplits, setExactSplits] = useState<Record<string, string>>({});

  // OCR State
  const [isScanning, setIsScanning] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>();

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const handleScanReceipt = () => {
    setIsScanning(true);
    // Mock network delay and AI OCR processing
    setTimeout(() => {
      setDescription("Sushi Omakase Dinner");
      setAmount("15000");
      setCurrency("JPY");
      setCategory("food");
      setReceiptUrl(
        "https://images.unsplash.com/photo-1559132104-e593fc0c5f0d?auto=format&fit=crop&q=80&w=200",
      );
      setIsScanning(false);
    }, 1500);
  };

  const toggleSplit = (id: string) => {
    setSplitWith((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const reset = () => {
    setDescription("");
    setAmount("");
    setCurrency("THB");
    setCategory("food");
    setPayerId(trip.members[0].id);
    setSplitWith(trip.members.map((m) => m.id));
    setSplitMethod("equal");
    setExactSplits({});
    setReceiptUrl(undefined);
    setDate(new Date().toISOString().slice(0, 10));
  };

  const submit = () => {
    const amt = parseFloat(amount);
    if (!description || !amt || (splitMethod === "equal" && splitWith.length === 0)) return;

    const thbAmount = amt * selectedCurrency.rate;

    let parsedExactSplits: Record<string, number> | undefined;

    if (splitMethod === "exact") {
      parsedExactSplits = {};
      let totalExact = 0;
      for (const id of splitWith) {
        const val = parseFloat(exactSplits[id] || "0");
        parsedExactSplits[id] = val * selectedCurrency.rate; // Store exact splits in THB
        totalExact += val;
      }
      // Simple validation: Ensure exact splits sum matches the total entered amount
      if (Math.abs(totalExact - amt) > 0.01) {
        alert(`Exact splits total (${totalExact}) does not match expense amount (${amt})`);
        return;
      }
    }

    addExpense(trip.id, {
      description,
      amount: thbAmount,
      localAmount: currency !== "THB" ? amt : undefined,
      currency: currency !== "THB" ? currency : undefined,
      category,
      payerId,
      splitWith,
      exactSplits: parsedExactSplits,
      receiptUrl,
      date,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-2xl p-0 rounded-2xl overflow-hidden gap-0">
        <DialogHeader className="p-8 pb-6 border-b border-border flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Add an expense
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Log a new shared cost for{" "}
              <span className="font-medium text-foreground">{trip.name}</span>.
            </DialogDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScanReceipt}
            disabled={isScanning}
            className="gap-2 shrink-0"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {isScanning ? "Scanning..." : "Scan Receipt"}
          </Button>
        </DialogHeader>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {receiptUrl && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
              <img
                src={receiptUrl}
                alt="Receipt preview"
                className="w-12 h-12 object-cover rounded-md"
              />
              <div className="text-sm">
                <p className="font-medium">Receipt attached</p>
                <p className="text-muted-foreground text-xs">Scanned successfully via AI</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              placeholder="e.g. Dinner at night market"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-11 pl-7 tabular"
                  />
                </div>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[100px] h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currency !== "THB" && amount && (
                <p className="text-xs text-muted-foreground mt-1 tabular">
                  ≈ ฿
                  {(parseFloat(amount) * selectedCurrency.rate).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 w-fit"
            />
          </div>

          <div className="space-y-3">
            <Label>Who paid?</Label>
            <div className="grid grid-cols-4 gap-2">
              {trip.members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayerId(m.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all",
                    payerId === m.id
                      ? "border-primary bg-accent ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                  )}
                >
                  <MemberAvatar member={m} size={28} />
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <Label>How to split?</Label>
              <button
                type="button"
                onClick={() => setSplitWith(trip.members.map((m) => m.id))}
                className="text-xs text-primary hover:underline"
              >
                Select all
              </button>
            </div>

            <Tabs
              value={splitMethod}
              onValueChange={(v) => setSplitMethod(v as "equal" | "exact")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="equal">Split Equally</TabsTrigger>
                <TabsTrigger value="exact">Exact Amounts</TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  {trip.members.map((m) => {
                    const checked = splitWith.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                          checked
                            ? "border-primary/60 bg-accent/60"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleSplit(m.id)} />
                        <MemberAvatar member={m} size={28} />
                        <span className="text-sm font-medium">{m.name}</span>
                      </label>
                    );
                  })}
                </div>
                {splitWith.length > 0 && amount && (
                  <div className="text-xs text-muted-foreground pt-3">
                    Each person pays{" "}
                    <span className="font-semibold text-foreground tabular">
                      {selectedCurrency.symbol}
                      {(parseFloat(amount || "0") / splitWith.length).toFixed(2)}
                    </span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="exact" className="mt-0 space-y-2">
                {trip.members.map((m) => {
                  const isIncluded = splitWith.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl border border-border"
                    >
                      <Checkbox checked={isIncluded} onCheckedChange={() => toggleSplit(m.id)} />
                      <MemberAvatar member={m} size={28} />
                      <span className="text-sm font-medium flex-1">{m.name}</span>
                      {isIncluded && (
                        <div className="relative w-24">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                            {selectedCurrency.symbol}
                          </span>
                          <Input
                            type="number"
                            className="h-9 pl-6 text-right tabular"
                            placeholder="0"
                            value={exactSplits[m.id] || ""}
                            onChange={(e) =>
                              setExactSplits((prev) => ({ ...prev, [m.id]: e.target.value }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="px-6">
            Add Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
