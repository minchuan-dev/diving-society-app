import { NextResponse } from "next/server";
import { isICloudEmail, normalizeEmail } from "@/lib/icloud";
import { sendICloudOtp } from "@/lib/mail";
import { createOtp } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!email || !isICloudEmail(email)) {
      return NextResponse.json({ error: "INVALID_ICLOUD_EMAIL" }, { status: 400 });
    }

    const { code } = await createOtp(email);
    const mailResult = await sendICloudOtp({ email, code });

    return NextResponse.json({
      ok: true,
      message: mailResult.delivered
        ? "OTP_SENT"
        : "OTP_DEV_MODE",
      devCode: mailResult.devCode,
    });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}