import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createUserFromOAuth, toSessionPayload } from "@/lib/users";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_WECHAT_DEMO !== "true") {
    return NextResponse.redirect(new URL("/login?error=wechat_config", request.url));
  }

  const demoOpenId = "demo_wechat_user";

  let user = await prisma.user.findUnique({
    where: { wechatOpenId: demoOpenId },
  });

  if (!user) {
    user = await createUserFromOAuth({
      name: "WeChat Demo User",
      wechatOpenId: demoOpenId,
    });
  }

  if (!user.approved) {
    return NextResponse.redirect(new URL("/login?pending=1", request.url));
  }

  await createSession(toSessionPayload(user));
  return NextResponse.redirect(new URL("/trips", request.url));
}