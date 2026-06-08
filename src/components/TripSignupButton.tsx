"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function TripSignupButton({
  tripId,
  status,
  canSignUp,
  dict,
}: {
  tripId: string;
  status: "none" | "CONFIRMED" | "WAITLIST";
  canSignUp: boolean;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    await fetch(`/api/trips/${tripId}/signup`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  async function cancel() {
    setLoading(true);
    await fetch(`/api/trips/${tripId}/signup`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  if (status === "CONFIRMED") {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          {dict.trips.confirmed}
        </span>
        <button className="btn-secondary" onClick={cancel} disabled={loading}>
          {dict.trips.cancel}
        </button>
      </div>
    );
  }

  if (status === "WAITLIST") {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          {dict.trips.onWaitlist}
        </span>
        <button className="btn-secondary" onClick={cancel} disabled={loading}>
          {dict.trips.cancel}
        </button>
      </div>
    );
  }

  if (!canSignUp) return null;

  return (
    <button className="btn-primary" onClick={signUp} disabled={loading}>
      {dict.trips.signUp}
    </button>
  );
}