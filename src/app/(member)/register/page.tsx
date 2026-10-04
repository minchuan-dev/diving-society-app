import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/trips");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return <RegisterForm dict={dict} />;
}