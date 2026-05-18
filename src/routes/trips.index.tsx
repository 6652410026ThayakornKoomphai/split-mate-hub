import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/TripCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/trips/")({
  head: () => ({ meta: [{ title: "My Trips — SplitMate" }] }),
  component: TripsPage,
});

function TripsPage() {
  const { trips, createTrip } = useStore();
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-1">All your shared adventures, in one place.</p>
        </div>
        <Button onClick={() => createTrip("New Trip", "Somewhere")} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Trip
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {trips.map(t => <TripCard key={t.id} trip={t} />)}
      </div>
    </div>
  );
}
