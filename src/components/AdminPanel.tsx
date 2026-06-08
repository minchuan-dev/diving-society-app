"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CertLevel, TripType } from "@/generated/prisma/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Member = {
  id: string;
  name: string;
  email: string | null;
  approved: boolean;
  certLevel: CertLevel;
  diveCount: number;
  phone: string | null;
};

const CERT_LEVELS: CertLevel[] = ["OW", "AOW", "RESCUE", "DM", "INSTRUCTOR"];
const TRIP_TYPES: TripType[] = ["FUN", "TRAINING"];

export function AdminPanel({
  dict,
  members,
}: {
  dict: Dictionary;
  members: Member[];
}) {
  const router = useRouter();
  const [tripForm, setTripForm] = useState({
    title: "",
    site: "",
    date: "",
    time: "08:00",
    type: "FUN" as TripType,
    maxParticipants: 12,
    minCert: "OW" as CertLevel,
    notes: "",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    body: "",
    pinned: false,
  });
  const [message, setMessage] = useState("");

  async function createTrip(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tripForm),
    });
    if (res.ok) {
      setMessage("Trip created");
      setTripForm({ ...tripForm, title: "", site: "", notes: "" });
      router.refresh();
    } else {
      setMessage(dict.common.error);
    }
  }

  async function createAnnouncement(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(announcementForm),
    });
    if (res.ok) {
      setMessage("Announcement posted");
      setAnnouncementForm({ title: "", body: "", pinned: false });
      router.refresh();
    } else {
      setMessage(dict.common.error);
    }
  }

  async function approveMember(id: string) {
    await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ocean-900">{dict.admin.title}</h1>
      {message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
      )}

      <section className="card space-y-3">
        <h2 className="font-semibold">{dict.admin.newTrip}</h2>
        <form onSubmit={createTrip} className="grid gap-3">
          <input
            className="input"
            placeholder={dict.admin.tripTitle}
            value={tripForm.title}
            onChange={(e) => setTripForm({ ...tripForm, title: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder={dict.admin.site}
            value={tripForm.site}
            onChange={(e) => setTripForm({ ...tripForm, site: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              type="date"
              value={tripForm.date}
              onChange={(e) => setTripForm({ ...tripForm, date: e.target.value })}
              required
            />
            <input
              className="input"
              type="time"
              value={tripForm.time}
              onChange={(e) => setTripForm({ ...tripForm, time: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={tripForm.type}
              onChange={(e) =>
                setTripForm({ ...tripForm, type: e.target.value as TripType })
              }
            >
              {TRIP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {dict.trips.types[type]}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              min={1}
              value={tripForm.maxParticipants}
              onChange={(e) =>
                setTripForm({
                  ...tripForm,
                  maxParticipants: Number(e.target.value),
                })
              }
            />
          </div>
          <select
            className="input"
            value={tripForm.minCert}
            onChange={(e) =>
              setTripForm({ ...tripForm, minCert: e.target.value as CertLevel })
            }
          >
            {CERT_LEVELS.map((level) => (
              <option key={level} value={level}>
                {dict.trips.certs[level]}
              </option>
            ))}
          </select>
          <textarea
            className="input min-h-20"
            placeholder={dict.admin.notes}
            value={tripForm.notes}
            onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
          />
          <button className="btn-primary">{dict.admin.create}</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">{dict.admin.createAnnouncement}</h2>
        <form onSubmit={createAnnouncement} className="grid gap-3">
          <input
            className="input"
            placeholder={dict.admin.announcementTitle}
            value={announcementForm.title}
            onChange={(e) =>
              setAnnouncementForm({ ...announcementForm, title: e.target.value })
            }
            required
          />
          <textarea
            className="input min-h-24"
            placeholder={dict.admin.body}
            value={announcementForm.body}
            onChange={(e) =>
              setAnnouncementForm({ ...announcementForm, body: e.target.value })
            }
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={announcementForm.pinned}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  pinned: e.target.checked,
                })
              }
            />
            {dict.admin.pin}
          </label>
          <button className="btn-primary">{dict.admin.post}</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">{dict.admin.members}</h2>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 text-sm"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-slate-600">
                  {member.email ?? "WeChat"} · {dict.trips.certs[member.certLevel]} ·{" "}
                  {member.diveCount} dives
                </p>
              </div>
              {!member.approved ? (
                <button className="btn-primary" onClick={() => approveMember(member.id)}>
                  {dict.admin.approve}
                </button>
              ) : (
                <span className="text-xs text-green-700">{dict.profile.approved}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}