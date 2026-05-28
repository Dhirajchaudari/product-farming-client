"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { LoginAuthCard } from "@/components/LoginAuthCard";
import { PayrollPilotLogo } from "@/components/PayrollPilotLogo";
import { LoginHeroPanel } from "@/components/LoginHeroPanel";
import { gqlRequest } from "@/lib/graphql";
import { useToastStore } from "@/store/toast.store";

export default function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pushToast = useToastStore((state) => state.push);
  const email = searchParams.get("email") ?? "";
  const otp = searchParams.get("otp") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const hasInviteParams = useMemo(() => Boolean(email && otp), [email, otp]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (password.length < 8) {
      pushToast("Password must be at least 8 characters.", "error");
      return;
    }
    if (password !== confirmPassword) {
      pushToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await gqlRequest<{ setupPassword: { success: boolean; message: string } }>(
        `mutation SetupPassword($email: String!, $otp: String!, $password: String!) {
          setupPassword(email: $email, otp: $otp, password: $password) { success message }
        }`,
        { email, otp, password }
      );
      if (!data.setupPassword.success) {
        pushToast("Invalid or expired setup link. Ask HR to resend your welcome email.", "error");
        return;
      }
      pushToast("Password set successfully. You can sign in now.", "success");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to set password";
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginSplit loginSplitModern">
      <aside className="loginHero loginHeroAlt loginAnimLeft">
        <div className="loginHeroOverlay" />
        <LoginHeroPanel variant="setup" />
      </aside>

      <main className="loginPanel loginAnimRight">
        <div className="loginPanelInner">
          <div className="loginPanelBrandMobile">
            <PayrollPilotLogo size="sm" />
            <span>PayrollPilot</span>
          </div>

          <LoginAuthCard
          title="Create password"
          subtitle="Finish activating your employee account."
          footer={
            <p className="loginAuthHint muted small">
              Already set up? <Link href="/login">Sign in</Link>
            </p>
          }
        >
          {!hasInviteParams ? (
            <p className="error">Invalid setup link. Please use the full URL from your welcome email.</p>
          ) : (
            <form className="loginForm loginFormCard" onSubmit={handleSubmit}>
              <label htmlFor="email">Work email</label>
              <input id="email" type="email" value={email} readOnly className="inputReadonly" />
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className="fullWidth primaryBtn loginSubmitBtn" disabled={loading}>
                {loading ? (
                  <span className="btnLoading">
                    <span className="spinner" />
                    Activating...
                  </span>
                ) : (
                  "Activate account"
                )}
              </button>
            </form>
          )}
          </LoginAuthCard>
        </div>
      </main>
    </div>
  );
}
