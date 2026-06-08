import { NextResponse } from "next/server";
import type { CertLevel, TripType } from "@/generated/prisma/client";
import { requireAdmin, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireSession();
    const trips = await prisma.trip.findMany({
      orderBy: { date: "asc" },
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
    });
    return NextResponse.json(trips);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const date = new Date(`${body.date}T${body.time || "08:00"}`);
    const trip = await prisma.trip.create({
      data: {
        title: String(body.title).trim(),
        site: String(body.site).trim(),
        date,
        type: body.type as TripType,
        maxParticipants: Number(body.maxParticipants),
        minCert: body.minCert as CertLevel,
        notes: body.notes ? String(body.notes).trim() : null,
        createdById: session.userId,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}