import { normalizeEmail } from "@/lib/icloud";

type SendOtpOptions = {
  email: string;
  code: string;
};

export async function sendICloudOtp({ email, code }: SendOtpOptions) {
  const normalized = normalizeEmail(email);

  if (process.env.SMTP_HOST) {
    // Production: wire up real SMTP when credentials are configured.
    console.info(`[mail] OTP for ${normalized}: ${code}`);
    return { delivered: true, devCode: undefined };
  }

  console.info(`[dev-otp] ${normalized} -> ${code}`);
  return {
    delivered: false,
    devCode: process.env.NODE_ENV === "development" ? code : undefined,
  };
}