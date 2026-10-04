import Link from "next/link";
import { TripSignupButton } from "@/components/TripSignupButton";
import { formatCert } from "@/lib/cert";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTripDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { meetsCertRequirement } from "@/lib/trips";

export default async function TripsPage() {
  const session = await getSession();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const [trips, user] = await Promise.all([
    prisma.trip.findMany({
      where: { date: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } },
      orderBy: { date: "asc" },
      include: {
        signups: {
          where: { status: { in: ["CONFIRMED", "WAITLIST"] } },
        },
      },
    }),
    session
      ? prisma.user.findUnique({ where: { id: session.userId } })
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-ocean-900">{dict.trips.title}</h1>

      {trips.length === 0 ? (
        <p className="card text-slate-600">{dict.trips.empty}</p>
      ) : (
        trips.map((trip) => {
          const confirmed = trip.signups.filter((s) => s.status === "CONFIRMED").length;
          const spotsLeft = Math.max(trip.maxParticipants - confirmed, 0);
          const mySignup = trip.signups.find((s) => s.userId === session?.userId);
          const canSignUp =
            !!user && meetsCertRequirement(user.certLevel, trip.minCert);

          return (
            <article key={trip.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{trip.title}</h2>
                  <p className="text-sm text-slate-600">{trip.site}</p>
                  <p className="mt-1 text-sm font-medium text-ocean-800">
                    {formatTripDate(trip.date, locale)}
                  </p>
                </div>
                <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-medium text-ocean-800">
                  {dict.trips.types[trip.type]}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <span>
                  {confirmed}/{trip.maxParticipants} {dict.trips.participants.toLowerCase()}
                  {spotsLeft > 0 && ` · ${spotsLeft} ${dict.trips.spotsLeft}`}
                  {spotsLeft === 0 && ` · ${dict.trips.full}`}
                </span>
                <span>
                  {dict.trips.requirements}: {formatCert(trip.minCert, dict)}+
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <TripSignupButton
                  tripId={trip.id}
                  status={
                    mySignup?.status === "CONFIRMED" || mySignup?.status === "WAITLIST"
                      ? mySignup.status
                      : "none"
                  }
                  canSignUp={canSignUp}
                  dict={dict}
                />
                <Link href={`/trips/${trip.id}`} className="text-sm font-medium text-ocean-700">
                  {dict.trips.viewDetails}
                </Link>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}