"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
    >
      {label}
    </button>
  );
}