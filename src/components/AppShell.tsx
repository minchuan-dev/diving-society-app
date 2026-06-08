import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoutButton } from "./LogoutButton";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const session = await getSession();

  const navItems: { href: string; label: string }[] = [
    { href: "/trips", label: dict.nav.trips },
    { href: "/announcements", label: dict.nav.announcements },
    { href: "/profile", label: dict.nav.profile },
  ];

  if (session?.role === "ADMIN") {
    navItems.push({ href: "/admin", label: dict.nav.admin });
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="bg-gradient-to-r from-ocean-800 to-ocean-600 text-white shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-lg font-semibold">{dict.appName}</p>
            <p className="text-xs text-white/80">{dict.tagline}</p>
          </div>
          <LanguageSwitcher locale={locale} label={dict.common.language} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>

      <nav className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
          {session ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ocean-800 hover:bg-ocean-50"
                >
                  {item.label}
                </Link>
              ))}
              <LogoutButton label={dict.nav.logout} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ocean-800"
              >
                {dict.nav.login}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-ocean-700 px-3 py-2 text-sm font-medium text-white"
              >
                {dict.nav.register}
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}