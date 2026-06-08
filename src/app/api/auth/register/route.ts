import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }

    const userCount = await prisma.user.count();
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        approved: userCount === 0,
        role: userCount === 0 ? "ADMIN" : "MEMBER",
      },
    });

    if (!user.approved) {
      return NextResponse.json({ pendingApproval: true });
    }

    const { toSessionPayload } = await import("@/lib/users");
    await createSession(toSessionPayload(user));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}