import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import type { Locale } from "@/lib/i18n/dictionaries";

export function formatTripDate(date: Date, locale: Locale) {
  return format(date, "PPp", { locale: locale === "zh" ? zhCN : enUS });
}