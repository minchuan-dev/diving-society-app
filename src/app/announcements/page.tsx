import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function AnnouncementsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-ocean-900">{dict.announcements.title}</h1>

      {announcements.length === 0 ? (
        <p className="card text-slate-600">{dict.announcements.empty}</p>
      ) : (
        announcements.map((item) => (
          <article key={item.id} className="card space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              {item.pinned && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  {dict.announcements.pinned}
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{item.body}</p>
            <p className="text-xs text-slate-500">
              {item.createdBy.name} ·{" "}
              {format(item.createdAt, "PP", {
                locale: locale === "zh" ? zhCN : enUS,
              })}
            </p>
          </article>
        ))
      )}
    </div>
  );
}