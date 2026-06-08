import { NextResponse } from "next/server";
import type { CertLevel } from "@/generated/prisma/client";
import { getSession, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    approved: user.approved,
    certLevel: user.certLevel,
    diveCount: user.diveCount,
    emergencyContactName: user.emergencyContactName,
    emergencyContactPhone: user.emergencyContactPhone,
  });
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: body.name ? String(body.name).trim() : undefined,
        phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
        certLevel: body.certLevel as CertLevel | undefined,
        diveCount:
          body.diveCount !== undefined ? Number(body.diveCount) : undefined,
        emergencyContactName:
          body.emergencyContactName !== undefined
            ? String(body.emergencyContactName).trim()
            : undefined,
        emergencyContactPhone:
          body.emergencyContactPhone !== undefined
            ? String(body.emergencyContactPhone).trim()
            : undefined,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      certLevel: user.certLevel,
      diveCount: user.diveCount,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
    });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}