import { NextResponse } from "next/server";
import { requireAdmin, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
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
    });

    if (!trip) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json(trip);
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
    await requireAdmin();
    const { id } = await params;
    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ ok: true });
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