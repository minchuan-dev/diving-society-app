import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  return (
    <ProfileForm
      dict={dict}
      profile={{
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        approved: user.approved,
        certLevel: user.certLevel,
        diveCount: user.diveCount,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
      }}
    />
  );
}