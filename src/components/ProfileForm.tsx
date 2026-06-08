"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CertLevel } from "@/generated/prisma/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Profile = {
  email: string | null;
  name: string;
  phone: string | null;
  role: string;
  approved: boolean;
  certLevel: CertLevel;
  diveCount: number;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
};

const CERT_LEVELS: CertLevel[] = ["OW", "AOW", "RESCUE", "DM", "INSTRUCTOR"];

export function ProfileForm({
  profile,
  dict,
}: {
  profile: Profile;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [form, setForm] = useState(profile);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      setMessage(dict.profile.saved);
      router.refresh();
    } else {
      setMessage(dict.common.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h1 className="text-2xl font-semibold text-ocean-900">{dict.profile.title}</h1>

      <div className="grid gap-3 rounded-xl bg-slate-50 p-3 text-sm">
        <p>
          <span className="text-slate-500">{dict.auth.email}:</span>{" "}
          {form.email ?? "—"}
        </p>
        <p>
          <span className="text-slate-500">{dict.profile.role}:</span> {form.role}
        </p>
        <p>
          <span className="text-slate-500">{dict.profile.status}:</span>{" "}
          {form.approved ? dict.profile.approved : dict.profile.pending}
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
      )}

      <div>
        <label className="label">{dict.auth.name}</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="label">{dict.profile.phone}</label>
        <input
          className="input"
          value={form.phone ?? ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="label">{dict.profile.certLevel}</label>
        <select
          className="input"
          value={form.certLevel}
          onChange={(e) =>
            setForm({ ...form, certLevel: e.target.value as CertLevel })
          }
        >
          {CERT_LEVELS.map((level) => (
            <option key={level} value={level}>
              {dict.trips.certs[level]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{dict.profile.diveCount}</label>
        <input
          className="input"
          type="number"
          min={0}
          value={form.diveCount}
          onChange={(e) => setForm({ ...form, diveCount: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="label">{dict.profile.emergencyContact}</label>
        <input
          className="input"
          value={form.emergencyContactName ?? ""}
          onChange={(e) =>
            setForm({ ...form, emergencyContactName: e.target.value })
          }
        />
      </div>

      <div>
        <label className="label">{dict.profile.emergencyPhone}</label>
        <input
          className="input"
          value={form.emergencyContactPhone ?? ""}
          onChange={(e) =>
            setForm({ ...form, emergencyContactPhone: e.target.value })
          }
        />
      </div>

      <button className="btn-primary" disabled={loading}>
        {dict.profile.save}
      </button>
    </form>
  );
}