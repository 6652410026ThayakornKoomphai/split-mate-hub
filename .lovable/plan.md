# SplitMate — Desktop Trip Expense Splitter

A premium, desktop-only SaaS dashboard for splitting trip expenses. Soft palette (white, light grey, soft teal), generous whitespace, mock state only — no backend.

## Scope

- Desktop-optimized widescreen layout (min ~1280px). No mobile patterns.
- Fully mocked data + state (React `useState` / context). No persistence.
- Seeded with "Chiang Mai Trip", 4 members, 5 expenses.

## Design System

- Palette: background `#F7F8FA`, surface white, border `#E6E8EC`, text `#0F172A`, muted `#64748B`, accent soft teal `#14B8A6` (active/CTA), success teal-tinted.
- Typography: Inter (or system sans), tight hierarchy — 28/600 page titles, 16/500 section, 14/400 body, 12/500 muted labels.
- Tokens added to `src/styles.css` as oklch design tokens (`--primary` → teal). All Shadcn components inherit.
- Cards: `rounded-2xl`, `shadow-sm`, `p-6`–`p-8`, hairline borders.

## Routes (TanStack Start)

```text
src/routes/
  __root.tsx              # sidebar + header shell
  index.tsx               # Dashboard (summary + trips grid)
  trips.index.tsx         # My Trips (same grid, no summary)
  trips.$tripId.tsx       # Trip Detail split-pane
  friends.tsx             # Friends list
  settings.tsx            # Settings
```

## Layout

- **Sidebar** (240px, fixed): logo, nav items (Dashboard, My Trips, Friends, Settings) with Lucide icons; active item = teal pill background + teal text.
- **Header** (64px): breadcrumbs (left), global search (center, ~420px), user avatar dropdown (right).
- **Main**: `bg-[#F7F8FA]`, `p-8`, max-width container.

## Views

### 1. Dashboard
- 4 summary widgets in a grid: Total You Owe, Total Owed to You, Active Trips, This Month Spend. Each = label + big number + tiny delta + icon.
- "Your Trips" section header with **+ Create New Trip** button (teal, right-aligned).
- Trip cards grid (3 per row): cover image placeholder (gradient), title, date range, overlapping member avatars, total expense, **Open Trip** button.

### 2. Trip Detail (`/trips/$tripId`)
Split-pane: `grid-cols-[60%_40%] gap-6`.

- **Left — Expenses**
  - Header: trip name, member avatars, **+ Add Expense** button.
  - Shadcn `Table`: Date · Category icon · Description · Payer (avatar+name) · Split (avatar stack) · Amount (right-aligned, mono). Row hover = soft teal tint.
- **Right — Balances & Settlement** (sticky `top-6`)
  - "Who paid what" list with per-member bar.
  - Budget progress bar (mocked budget vs spent).
  - "Suggested Settlements" — minimized debt list ("Alex owes Bob ฿350") each with **Settle Up** button (updates mock state).

### 3. Add Expense Modal
- Shadcn `Dialog`, `max-w-2xl`, `rounded-2xl`, `p-8`.
- Grid form: Description (full), Amount + Category (2-col), Paid by (avatar chips, single-select), Split with (avatar checkboxes grid, equal split), Date.
- Footer: Cancel · **Add Expense** (teal).

### 4. Friends / Settings
- Friends: table of people with net balance.
- Settings: simple profile + currency placeholder card.

## State (mock)

`src/lib/store.ts` — Zustand-free, plain React context:
```text
trips: Trip[]            # id, name, cover, dateRange, members[], budget, expenses[]
addExpense, settleUp     # mutators
```
Derived selectors compute per-member balances and minimized settlements (greedy debt-simplification).

Seed:
- Trip: "Chiang Mai Trip", Nov 12–18, 2025, budget ฿40,000.
- Members: Alex, Bob, Priya, Mei.
- Expenses: Airport taxi ฿800 (Alex, split 4), Hotel night 1 ฿4,500 (Bob, split 4), Street food dinner ฿1,200 (Priya, split 4), Temple tour ฿2,400 (Mei, split 4), Coffee & cake ฿520 (Alex, split Alex+Priya).

## Technical Notes

- Currency formatter `฿#,###` (THB).
- Lucide icons: `LayoutDashboard`, `Plane`, `Users`, `Settings`, `Plus`, `Search`, `UtensilsCrossed`, `Hotel`, `Car`, `Ticket`, `Coffee`.
- Debt simplification: build net balance per member, then greedy match max creditor with max debtor until zero.
- No routing to mobile; viewport hint via existing meta only.
- Replace `src/routes/index.tsx` placeholder.

## Out of Scope

- Backend, auth, persistence, real images (gradient placeholders only), mobile/tablet layouts, multi-currency conversion.
