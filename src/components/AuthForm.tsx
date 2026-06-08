"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-400">
      <div className="h-px flex-1 bg-slate-200" />
      <span>{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function LoginForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpName, setOtpName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "wechat") {
      setError(dict.auth.wechatError);
    }
    if (searchParams.get("pending") === "1") {
      setError(dict.auth.wechatPending);
    }
    if (searchParams.get("error") === "wechat_config") {
      setError(dict.auth.wechatDemoHint);
    }
  }, [searchParams, dict]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/trips");
      router.refresh();
      return;
    }

    const data = await res.json();
    if (data.error === "PENDING_APPROVAL") {
      setError(dict.auth.pendingApproval);
    } else {
      setError(dict.auth.invalidCredentials);
    }
  }

  async function sendOtp() {
    setOtpLoading(true);
    setError("");
    setDevCode("");

    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: otpEmail }),
    });

    setOtpLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(
        data.error === "INVALID_ICLOUD_EMAIL"
          ? dict.auth.invalidIcloud
          : dict.common.error,
      );
      return;
    }

    setOtpSent(true);
    if (data.devCode) setDevCode(data.devCode);
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setOtpLoading(true);
    setError("");

    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: otpEmail,
        code: otpCode,
        name: otpName,
      }),
    });

    setOtpLoading(false);
    const data = await res.json();

    if (res.ok) {
      router.push("/trips");
      router.refresh();
      return;
    }

    if (data.error === "PENDING_APPROVAL") {
      setError(dict.auth.pendingApproval);
    } else if (data.error === "NAME_REQUIRED") {
      setError(dict.auth.nameRequired);
    } else if (data.error === "INVALID_OTP") {
      setError(dict.auth.invalidOtp);
    } else {
      setError(dict.common.error);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <form onSubmit={onSubmit} className="card space-y-4">
        <h1 className="text-xl font-semibold text-ocean-900">{dict.auth.loginTitle}</h1>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label className="label" htmlFor="email">
            {dict.auth.email}
          </label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">
            {dict.auth.password}
          </label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {dict.auth.loginButton}
        </button>
        <p className="text-center text-sm text-slate-600">
          {dict.auth.noAccount}{" "}
          <Link href="/register" className="font-medium text-ocean-700">
            {dict.nav.register}
          </Link>
        </p>
      </form>

      <AuthDivider label={dict.auth.or} />

      <div className="card space-y-3">
        <a href="/api/auth/wechat" className="btn-primary block w-full text-center">
          {dict.auth.wechatLogin}
        </a>
        <p className="text-center text-xs text-slate-500">{dict.auth.wechatDemoHint}</p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-ocean-900">{dict.auth.icloudOtpTitle}</h2>
        <p className="text-xs text-slate-500">{dict.auth.icloudHint}</p>

        {!otpSent ? (
          <div className="space-y-3">
            <div>
              <label className="label" htmlFor="icloud-email">
                {dict.auth.icloudEmail}
              </label>
              <input
                className="input"
                id="icloud-email"
                type="email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                placeholder="you@icloud.com"
              />
            </div>
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={sendOtp}
              disabled={otpLoading || !otpEmail}
            >
              {dict.auth.sendOtp}
            </button>
          </div>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-3">
            <p className="text-sm text-green-700">{dict.auth.otpSent}</p>
            {devCode && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {dict.auth.otpDev} <strong>{devCode}</strong>
              </p>
            )}
            <div>
              <label className="label" htmlFor="otp-name">
                {dict.auth.name}
              </label>
              <input
                className="input"
                id="otp-name"
                value={otpName}
                onChange={(e) => setOtpName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="otp-code">
                {dict.auth.otpCode}
              </label>
              <input
                className="input"
                id="otp-code"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary w-full" disabled={otpLoading}>
              {dict.auth.verifyOtp}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function RegisterForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (res.status === 409) {
      setError(dict.auth.emailTaken);
      return;
    }

    if (data.pendingApproval) {
      setInfo(dict.auth.pendingApproval);
      return;
    }

    if (res.ok) {
      router.push("/trips");
      router.refresh();
      return;
    }

    setError(dict.common.error);
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold text-ocean-900">{dict.auth.registerTitle}</h1>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {info && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{info}</p>
      )}
      <div>
        <label className="label" htmlFor="name">
          {dict.auth.name}
        </label>
        <input className="input" id="name" name="name" required />
      </div>
      <div>
        <label className="label" htmlFor="email">
          {dict.auth.email}
        </label>
        <input className="input" id="email" name="email" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          {dict.auth.password}
        </label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
        />
      </div>
      <button className="btn-primary w-full" disabled={loading}>
        {dict.auth.registerButton}
      </button>
      <p className="text-center text-sm text-slate-600">
        {dict.auth.hasAccount}{" "}
        <Link href="/login" className="font-medium text-ocean-700">
          {dict.nav.login}
        </Link>
      </p>
    </form>
  );
}