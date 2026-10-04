import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/trips");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const members = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      approved: true,
      certLevel: true,
      diveCount: true,
      phone: true,
    },
  });

  return <AdminPanel dict={dict} members={members} />;
}