"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";
import { useAuthStore } from "@/store/auth.store";

interface CountryInsight {
  country: string;
  employeeCount: number;
  averageSalary: number;
  currency: string;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [country, setCountry] = useState("India");
  const [insight, setInsight] = useState<CountryInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  async function loadInsight(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const data = await gqlRequest<{ salaryInsightsByCountry: CountryInsight }>(
        `query CountryInsight($country: String!) {
          salaryInsightsByCountry(country: $country) {
            country
            employeeCount
            averageSalary
            currency
          }
        }`,
        { country }
      );
      setInsight(data.salaryInsightsByCountry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
      setInsight(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <div>
          <p className="badge">PayrollPilot HR</p>
          <h1>Salary Insights</h1>
          <p className="subtitle">Analyze compensation benchmarks by country.</p>
        </div>
      </header>

      <nav className="tabs">
        <Link href="/employees" className="tab">Employees</Link>
        <Link href="/insights" className="tab active">Insights</Link>
      </nav>

      <section className="card">
        <div className="row">
          <div>
            <h2>Country Salary Overview</h2>
            <p className="muted">Pull aggregated salary stats by country.</p>
          </div>
        </div>
        <label htmlFor="country">Country</label>
        <input id="country" value={country} onChange={(event) => setCountry(event.target.value)} />
        <button onClick={loadInsight} disabled={loading}>
          {loading ? "Loading..." : "Load Insight"}
        </button>
        {error ? <p className="error">{error}</p> : null}
        {insight ? (
          <div className="statsGrid insightsGrid">
            <article className="statCard">
              <p>Country</p>
              <h3>{insight.country}</h3>
            </article>
            <article className="statCard">
              <p>Employees</p>
              <h3>{insight.employeeCount}</h3>
            </article>
            <article className="statCard">
              <p>Average Salary</p>
              <h3>{formatCurrency(insight.averageSalary, insight.currency)}</h3>
            </article>
          </div>
        ) : null}
      </section>
    </main>
  );
}
