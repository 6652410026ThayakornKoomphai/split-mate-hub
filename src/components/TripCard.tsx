import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AvatarStack } from "@/components/layout/Avatar";
import { type Trip, formatTHB, tripTotals, useStore } from "@/lib/store";

export function TripCard({ trip }: { trip: Trip }) {
  const { total } = tripTotals(trip);
  const { deleteTrip } = useStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      <div className={`h-32 bg-gradient-to-br ${trip.cover} relative`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)]" />
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/15 backdrop-blur px-2.5 py-1 rounded-full">
          <MapPin className="w-3 h-3" />
          {trip.location}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          aria-label="Delete trip"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-rose-600 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Total spend
            </div>
            <div className="text-2xl font-semibold tabular mt-0.5">{formatTHB(total)}</div>
          </div>
          <AvatarStack members={trip.members} />
        </div>

        <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="mt-auto">
          <Button
            variant="outline"
            className="w-full justify-between group-hover:border-primary/40 group-hover:text-primary"
          >
            Open Trip <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{trip.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the trip and all its expenses. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTrip(trip.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
