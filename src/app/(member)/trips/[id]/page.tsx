import Link from "next/link";
import { notFound } from "next/navigation";
import { TripSignupButton } from "@/components/TripSignupButton";
import { formatCert } from "@/lib/cert";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatTripDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { meetsCertRequirement } from "@/lib/trips";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const [trip, user] = await Promise.all([
    prisma.trip.findUnique({
      where: { id },
      include: {
        signups: {
          where: { status: { in: ["CONFIRMED", "WAITLIST"] } },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                certLevel: true,
                phone: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
              },
            },
          },
          orderBy: [{ status: "asc" }, { waitlistOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    session
      ? prisma.user.findUnique({ where: { id: session.userId } })
      : Promise.resolve(null),
  ]);

  if (!trip) notFound();

  const confirmed = trip.signups.filter((s) => s.status === "CONFIRMED");
  const waitlisted = trip.signups.filter((s) => s.status === "WAITLIST");
  const mySignup = trip.signups.find((s) => s.userId === session?.userId);
  const isAdmin = session?.role === "ADMIN";
  const canSignUp = !!user && meetsCertRequirement(user.certLevel, trip.minCert);

  return (
    <div className="space-y-4">
      <Link href="/trips" className="text-sm font-medium text-ocean-700">
        ← {dict.common.back}
      </Link>

      <section className="card space-y-3">
        <h1 className="text-2xl font-semibold text-ocean-900">{trip.title}</h1>
        <p className="text-slate-600">{trip.site}</p>
        <p className="font-medium text-ocean-800">{formatTripDate(trip.date, locale)}</p>
        <p className="text-sm text-slate-600">
          {dict.trips.types[trip.type]} · {dict.trips.requirements}:{" "}
          {formatCert(trip.minCert, dict)}+
        </p>
        {trip.notes && <p className="rounded-xl bg-slate-50 p-3 text-sm">{trip.notes}</p>}

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
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold text-slate-900">
          {dict.trips.participants} ({confirmed.length}/{trip.maxParticipants})
        </h2>
        {confirmed.length === 0 ? (
          <p className="text-sm text-slate-500">—</p>
        ) : (
          <ul className="space-y-2">
            {confirmed.map((signup) => (
              <li key={signup.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                <p className="font-medium">{signup.user.name}</p>
                <p className="text-slate-600">{formatCert(signup.user.certLevel, dict)}</p>
                {isAdmin && (
                  <p className="mt-1 text-xs text-slate-500">
                    {signup.user.phone || "—"} · {signup.user.emergencyContactName || "—"} (
                    {signup.user.emergencyContactPhone || "—"})
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {waitlisted.length > 0 && (
        <section className="card space-y-3">
          <h2 className="font-semibold text-slate-900">{dict.trips.waitlistSection}</h2>
          <ul className="space-y-2">
            {waitlisted.map((signup, index) => (
              <li key={signup.id} className="text-sm text-slate-700">
                {index + 1}. {signup.user.name} ({formatCert(signup.user.certLevel, dict)})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}