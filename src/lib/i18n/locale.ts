import { cookies } from "next/headers";
import type { Locale } from "./dictionaries";

export const LOCALE_COOKIE = "dive_locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "zh" ? "zh" : "en";
}