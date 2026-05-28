"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LoginHeroPanel } from "@/components/LoginHeroPanel";
import { PageLoader } from "@/components/PageLoader";
import { gqlRequest } from "@/lib/graphql";
import { homeRouteForRole } from "@/lib/routing";
import type { SessionUser, UserRole } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16v12H4V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, role, setAuth } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(homeRouteForRole(role));
    }
  }, [hydrated, isAuthenticated, role, router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await gqlRequest<{ loginWithPassword: SessionUser }>(
        `mutation Login($email: String!, $password: String!) {
          loginWithPassword(email: $email, password: $password) { id email role }
        }`,
        { email, password }
      );
      const userRole = data.loginWithPassword.role as UserRole;
      setAuth(data.loginWithPassword.email, userRole);
      pushToast("Signed in successfully.", "success");
      router.push(homeRouteForRole(userRole));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      pushToast(
        message.includes("INVALID_CREDENTIALS") ? "Invalid email or password." : message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return <PageLoader label="Preparing sign in..." fullScreen />;
  }

  return (
    <div className="loginSplit loginSplitModern">
      <aside className="loginHero loginAnimLeft">
        <div className="loginHeroOverlay" />
        <LoginHeroPanel variant="login" />
      </aside>

      <main className="loginPanel loginAnimRight">
        <div className="loginPanelInner">
          <div className="loginPanelBrandMobile">
            <span className="brandMark">PP</span>
            <span>PayrollPilot</span>
          </div>
          <h2>Sign in</h2>

          <form className="loginForm loginFormMinimal" onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <div className="inputWithIcon">
              <MailIcon />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <label htmlFor="password">Password</label>
            <div className="inputWithIcon">
              <LockIcon />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="fullWidth primaryBtn loginSubmitBtn" disabled={loading}>
              {loading ? (
                <span className="btnLoading">
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
