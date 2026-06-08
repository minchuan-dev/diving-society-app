import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { buildWeChatAuthUrl, isWeChatConfigured } from "@/lib/wechat";

const STATE_COOKIE = "wechat_oauth_state";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isWeChatConfigured()) {
    return NextResponse.redirect(new URL("/api/auth/wechat/demo", request.url));
  }

  const state = randomBytes(16).toString("hex");
  const authUrl = buildWeChatAuthUrl(state, origin);
  const response = NextResponse.redirect(authUrl);

  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}