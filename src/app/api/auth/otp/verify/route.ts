import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { normalizeEmail } from "@/lib/icloud";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { createUserFromOAuth, toSessionPayload } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const code = String(body.code ?? "").trim();
    const name = String(body.name ?? "").trim();

    if (!email || !code) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const valid = await verifyOtp(email, code);
    if (!valid) {
      return NextResponse.json({ error: "INVALID_OTP" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      if (!name) {
        return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
      }
      user = await createUserFromOAuth({ name, email });
    }

    if (!user.approved) {
      return NextResponse.json({ error: "PENDING_APPROVAL" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { authProvider: "ICLOUD_OTP" },
    });

    await createSession(toSessionPayload(user));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}