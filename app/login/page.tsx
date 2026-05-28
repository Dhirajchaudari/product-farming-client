"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";
import type { SessionUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/employees");
    }
  }, [isAuthenticated, router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await gqlRequest<{ loginWithPassword: SessionUser }>(
        `mutation Login($email: String!, $password: String!) {
          loginWithPassword(email: $email, password: $password) { id email role }
        }`,
        { email, password }
      );
      setAuth(data.loginWithPassword.email, data.loginWithPassword.role as "hr_manager" | "admin");
      router.push("/employees");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message.includes("INVALID_CREDENTIALS") ? "Invalid email or password." : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authPage">
      <section className="authHero">
        <p className="badge">PayrollPilot HR</p>
        <h1>Salary intelligence for modern HR teams</h1>
        <p className="subtitle">
          Manage employees, compensation insights, and workforce operations from one secure dashboard.
        </p>
        <ul className="authFeatureList">
          <li>PostgreSQL-backed employee records</li>
          <li>Role-based HR access with secure sessions</li>
          <li>Country and role salary insights</li>
        </ul>
      </section>
      <section className="authPanel card">
        <h2>Sign in</h2>
        <p className="muted">Use your verified HR account credentials.</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Work email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="hr@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="fullWidth" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>
        <p className="authFooterText">
          New HR user? <Link href="/register">Create account with OTP</Link>
        </p>
      </section>
    </div>
  );
}
