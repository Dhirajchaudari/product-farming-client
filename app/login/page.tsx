"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";
import type { SessionUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/employees");
    }
  }, [isAuthenticated, router]);

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
      setAuth(data.loginWithPassword.email, data.loginWithPassword.role as "hr_manager" | "admin");
      pushToast("Signed in successfully.", "success");
      router.push("/employees");
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

  return (
    <div className="loginPage">
      <div className="loginBackdrop" />
      <div className="loginGrid">
        <section className="loginBrand">
          <p className="badge">PayrollPilot HR</p>
          <h1>Modern payroll operations for HR teams</h1>
          <p className="subtitle">
            Secure workforce management with PostgreSQL-backed records and lightweight Redis sessions.
          </p>
          <div className="loginPills">
            <span>Employee CRUD</span>
            <span>Salary insights</span>
            <span>Email notifications</span>
          </div>
        </section>

        <section className="loginCard card">
          <div className="loginCardHead">
            <h2>HR sign in</h2>
            <p className="muted">Enter your credentials to access the dashboard.</p>
          </div>
          <form className="loginForm" onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="fullWidth primaryBtn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
