import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/dictionaries";

export async function POST(request: Request) {
  const { locale } = (await request.json()) as { locale: Locale };
  const response = NextResponse.json({ ok: true });
  response.cookies.set(LOCALE_COOKIE, locale === "zh" ? "zh" : "en", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}