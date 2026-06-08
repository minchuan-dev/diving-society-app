"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const router = useRouter();

  async function setLocale(next: Locale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 text-xs">
      <span className="px-2 text-white/70">{label}</span>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={`rounded-full px-2 py-1 ${locale === "zh" ? "bg-white text-ocean-900" : "text-white"}`}
      >
        中文
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-2 py-1 ${locale === "en" ? "bg-white text-ocean-900" : "text-white"}`}
      >
        EN
      </button>
    </div>
  );
}