"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";
import { useAuthStore } from "@/store/auth.store";

interface SessionUser {
  id: string;
  email: string;
  role: "hr_manager" | "admin";
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, email: savedEmail, setAuth } = useAuthStore();
  const [email, setEmail] = useState(savedEmail || "hr@product-farming.test");
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
      const data = await gqlRequest<{ login: SessionUser }>(
        `mutation Login($email: String!, $role: UserRole!) {
          login(email: $email, role: $role) { id email role }
        }`,
        { email, role: "hr_manager" }
      );
      setAuth(data.login.email, data.login.role);
      router.push("/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <div>
          <p className="badge">PayrollPilot HR</p>
          <h1>Sign in</h1>
          <p className="subtitle">Authenticate to access employees and salary insights.</p>
        </div>
      </header>
      <form className="card authCard" onSubmit={handleLogin}>
        <h2>Welcome back</h2>
        <p className="muted">Use your HR manager account.</p>
        <label htmlFor="email">Email</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in as HR Manager"}</button>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </main>
  );
}
