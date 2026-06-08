import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getConfirmedCount,
  getNextWaitlistOrder,
  meetsCertRequirement,
} from "@/lib/trips";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id: tripId } = await params;

    const [trip, user, existing] = await Promise.all([
      prisma.trip.findUnique({ where: { id: tripId } }),
      prisma.user.findUnique({ where: { id: session.userId } }),
      prisma.tripSignup.findUnique({
        where: { tripId_userId: { tripId, userId: session.userId } },
      }),
    ]);

    if (!trip || !user) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    if (!meetsCertRequirement(user.certLevel, trip.minCert)) {
      return NextResponse.json({ error: "CERT_TOO_LOW" }, { status: 400 });
    }

    if (existing && existing.status !== "CANCELLED") {
      return NextResponse.json({ error: "ALREADY_SIGNED_UP" }, { status: 409 });
    }

    const confirmed = await getConfirmedCount(tripId);
    const status = confirmed < trip.maxParticipants ? "CONFIRMED" : "WAITLIST";
    const waitlistOrder =
      status === "WAITLIST" ? await getNextWaitlistOrder(tripId) : null;

    const signup = await prisma.tripSignup.upsert({
      where: { tripId_userId: { tripId, userId: session.userId } },
      create: {
        tripId,
        userId: session.userId,
        status,
        waitlistOrder,
      },
      update: {
        status,
        waitlistOrder,
      },
    });

    return NextResponse.json(signup);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id: tripId } = await params;

    const [trip, signup] = await Promise.all([
      prisma.trip.findUnique({ where: { id: tripId } }),
      prisma.tripSignup.findUnique({
        where: { tripId_userId: { tripId, userId: session.userId } },
      }),
    ]);

    if (!trip || !signup || signup.status === "CANCELLED") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const wasConfirmed = signup.status === "CONFIRMED";

    await prisma.tripSignup.update({
      where: { id: signup.id },
      data: { status: "CANCELLED", waitlistOrder: null },
    });

    if (wasConfirmed) {
      const next = await prisma.tripSignup.findFirst({
        where: { tripId, status: "WAITLIST" },
        orderBy: { waitlistOrder: "asc" },
      });
      if (next) {
        await prisma.tripSignup.update({
          where: { id: next.id },
          data: { status: "CONFIRMED", waitlistOrder: null },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}