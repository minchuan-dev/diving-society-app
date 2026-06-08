import type { User } from "@/generated/prisma/client";
import type { SessionPayload } from "@/lib/auth";

export function sessionEmailForUser(user: User) {
  return user.email ?? `wechat:${user.wechatOpenId ?? user.id}`;
}

export function toSessionPayload(user: User): SessionPayload {
  return {
    userId: user.id,
    email: sessionEmailForUser(user),
    role: user.role,
    name: user.name,
  };
}

export async function createUserFromOAuth({
  name,
  wechatOpenId,
  email,
}: {
  name: string;
  wechatOpenId?: string;
  email?: string;
}) {
  const { prisma } = await import("@/lib/db");
  const userCount = await prisma.user.count();

  return prisma.user.create({
    data: {
      name,
      email: email ?? null,
      wechatOpenId: wechatOpenId ?? null,
      authProvider: wechatOpenId ? "WECHAT" : email ? "ICLOUD_OTP" : "EMAIL",
      approved: userCount === 0,
      role: userCount === 0 ? "ADMIN" : "MEMBER",
    },
  });
}