import type { CertLevel, SignupStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const CERT_RANK: Record<CertLevel, number> = {
  OW: 1,
  AOW: 2,
  RESCUE: 3,
  DM: 4,
  INSTRUCTOR: 5,
};

export function meetsCertRequirement(
  userCert: CertLevel,
  minCert: CertLevel,
): boolean {
  return CERT_RANK[userCert] >= CERT_RANK[minCert];
}

export async function getConfirmedCount(tripId: string) {
  return prisma.tripSignup.count({
    where: { tripId, status: "CONFIRMED" },
  });
}

export async function getNextWaitlistOrder(tripId: string) {
  const last = await prisma.tripSignup.findFirst({
    where: { tripId, status: "WAITLIST" },
    orderBy: { waitlistOrder: "desc" },
  });
  return (last?.waitlistOrder ?? 0) + 1;
}

export async function promoteFromWaitlist(tripId: string, maxParticipants: number) {
  const confirmed = await getConfirmedCount(tripId);
  const slots = maxParticipants - confirmed;
  if (slots <= 0) return;

  const waitlisted = await prisma.tripSignup.findMany({
    where: { tripId, status: "WAITLIST" },
    orderBy: { waitlistOrder: "asc" },
    take: slots,
  });

  for (const signup of waitlisted) {
    await prisma.tripSignup.update({
      where: { id: signup.id },
      data: { status: "CONFIRMED" as SignupStatus, waitlistOrder: null },
    });
  }
}