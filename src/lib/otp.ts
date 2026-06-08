import { prisma } from "@/lib/db";

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp(email: string) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpCode.deleteMany({ where: { email } });
  await prisma.otpCode.create({
    data: { email, code, expiresAt },
  });

  return { code, expiresAt };
}

export async function verifyOtp(email: string, code: string) {
  const record = await prisma.otpCode.findFirst({
    where: { email, code },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;
  if (record.expiresAt < new Date()) {
    await prisma.otpCode.delete({ where: { id: record.id } });
    return false;
  }

  await prisma.otpCode.delete({ where: { id: record.id } });
  return true;
}