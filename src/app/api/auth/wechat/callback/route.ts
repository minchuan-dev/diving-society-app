import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createUserFromOAuth, toSessionPayload } from "@/lib/users";
import { exchangeWeChatCode } from "@/lib/wechat";

const STATE_COOKIE = "wechat_oauth_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get(STATE_COOKIE)?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=wechat", request.url));
  }

  try {
    const profile = await exchangeWeChatCode(code);

    let user = await prisma.user.findUnique({
      where: { wechatOpenId: profile.openId },
    });

    if (!user) {
      user = await createUserFromOAuth({
        name: profile.nickname,
        wechatOpenId: profile.openId,
      });
    }

    const response = user.approved
      ? NextResponse.redirect(new URL("/trips", request.url))
      : NextResponse.redirect(new URL("/login?pending=1", request.url));

    if (user.approved) {
      await createSession(toSessionPayload(user));
    }

    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=wechat", request.url));
  }
}