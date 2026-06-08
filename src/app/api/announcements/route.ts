import { NextResponse } from "next/server";
import { requireAdmin, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireSession();
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        createdBy: { select: { name: true } },
      },
    });
    return NextResponse.json(announcements);
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

    const announcement = await prisma.announcement.create({
      data: {
        title: String(body.title).trim(),
        body: String(body.body).trim(),
        pinned: Boolean(body.pinned),
        createdById: session.userId,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
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