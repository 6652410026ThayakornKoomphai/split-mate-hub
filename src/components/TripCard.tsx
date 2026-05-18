import { Link } from "@tanstack/react-router";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarStack } from "@/components/layout/Avatar";
import { type Trip, formatTHB, tripTotals } from "@/lib/store";

export function TripCard({ trip }: { trip: Trip }) {
  const { total } = tripTotals(trip);
  return (
    <div className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className={`h-32 bg-gradient-to-br ${trip.cover} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/15 backdrop-blur px-2.5 py-1 rounded-full">
          <MapPin className="w-3 h-3" />
          {trip.location}
        </div>
      </div>
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{trip.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Calendar className="w-3.5 h-3.5" />
            {trip.dateRange}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total spend</div>
            <div className="text-2xl font-semibold tabular mt-0.5">{formatTHB(total)}</div>
          </div>
          <AvatarStack members={trip.members} />
        </div>

        <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="mt-auto">
          <Button variant="outline" className="w-full justify-between group-hover:border-primary/40 group-hover:text-primary">
            Open Trip <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
