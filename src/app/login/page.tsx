import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/trips");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <Suspense fallback={<div className="card mx-auto max-w-md p-4">{dict.common.loading}</div>}>
      <LoginForm dict={dict} />
    </Suspense>
  );
}