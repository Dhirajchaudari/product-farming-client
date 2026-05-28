"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { gqlRequest } from "@/lib/graphql";
import { formatCurrency } from "@/lib/format";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";

interface CountryInsight {
  country: string;
  employeeCount: number;
  averageSalary: number;
  minimumSalary: number;
  maximumSalary: number;
}

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);
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
            minimumSalary
            maximumSalary
          }
        }`,
        { country }
      );
      setInsight(data.salaryInsightsByCountry);
      pushToast(`Insights loaded for ${country}.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load insights";
      setError(message);
      pushToast(message, "error");
      setInsight(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Salary insights" subtitle="Compensation analytics computed from PostgreSQL employee data.">
      <section className="card">
        <h2>Country salary overview</h2>
        <p className="muted">Pull aggregated salary stats by country.</p>
        <label htmlFor="country">Country</label>
        <input id="country" value={country} onChange={(event) => setCountry(event.target.value)} />
        <button type="button" onClick={loadInsight} disabled={loading}>
          {loading ? "Loading..." : "Load insight"}
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
              <p>Average salary</p>
              <h3>{formatCurrency(insight.averageSalary, "INR")}</h3>
            </article>
            <article className="statCard">
              <p>Min / Max</p>
              <h3>
                {formatCurrency(insight.minimumSalary, "INR")} – {formatCurrency(insight.maximumSalary, "INR")}
              </h3>
            </article>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
