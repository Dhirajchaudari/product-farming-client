"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

interface JobTitleInsight {
  country: string;
  jobTitle: string;
  averageSalary: number;
  employeeCount: number;
}

const COUNTRY_PRESETS = ["India", "USA", "Germany", "Canada", "UK", "Singapore"];
const JOB_TITLE_PRESETS = ["Software Engineer", "HR Manager", "Product Manager", "Data Analyst"];

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, role } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);
  const [country, setCountry] = useState("India");
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [insight, setInsight] = useState<CountryInsight | null>(null);
  const [jobInsight, setJobInsight] = useState<JobTitleInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const derived = useMemo(() => {
    if (!insight || insight.employeeCount === 0) {
      return null;
    }
    const spread = insight.maximumSalary - insight.minimumSalary;
    const rangePct = insight.averageSalary > 0 ? Math.round((spread / insight.averageSalary) * 100) : 0;
    const minPos = spread > 0 ? 0 : 50;
    const avgPos = spread > 0 ? ((insight.averageSalary - insight.minimumSalary) / spread) * 100 : 50;
    const maxPos = spread > 0 ? 100 : 50;
    return { spread, rangePct, minPos, avgPos, maxPos };
  }, [insight]);

  const loadInsights = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const [countryData, jobData] = await Promise.all([
        gqlRequest<{ salaryInsightsByCountry: CountryInsight }>(
          `query CountryInsight($country: String!) {
            salaryInsightsByCountry(country: $country) {
              country employeeCount averageSalary minimumSalary maximumSalary
            }
          }`,
          { country }
        ),
        gqlRequest<{ jobTitleSalaryInsights: JobTitleInsight }>(
          `query JobInsight($input: JobTitleSalaryInsightsInput!) {
            jobTitleSalaryInsights(input: $input) {
              country jobTitle averageSalary employeeCount
            }
          }`,
          { input: { country, jobTitle } }
        )
      ]);
      setInsight(countryData.salaryInsightsByCountry);
      setJobInsight(jobData.jobTitleSalaryInsights);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load insights";
      setError(message);
      pushToast(message, "error");
      setInsight(null);
      setJobInsight(null);
    } finally {
      setLoading(false);
    }
  }, [country, jobTitle, pushToast]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role === "employee") {
      router.replace("/portal");
      return;
    }
    const timer = window.setTimeout(() => {
      void loadInsights();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, isAuthenticated, role, router, loadInsights]);

  return (
    <AppShell title="Salary insights" subtitle="Compensation analytics aggregated from your employee dataset in PostgreSQL.">
      <section className="dashboard">
        <section className="card insightsPanel">
          <div className="row">
            <div>
              <h2>Country compensation overview</h2>
              <p className="muted">Compare min, average, and max salary bands for a selected country.</p>
            </div>
            <button type="button" className="secondary" onClick={loadInsights} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh data"}
            </button>
          </div>

          <p className="filterLabel">Quick select country</p>
          <div className="chipRow">
            {COUNTRY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={preset === country ? "chip chipActive" : "chip"}
                onClick={() => setCountry(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="insightsFilters">
            <label>
              Country
              <input value={country} onChange={(event) => setCountry(event.target.value)} />
            </label>
            <label>
              Job title (role drill-down)
              <input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} />
            </label>
          </div>

          <p className="filterLabel">Common roles</p>
          <div className="chipRow">
            {JOB_TITLE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={preset === jobTitle ? "chip chipActive" : "chip"}
                onClick={() => setJobTitle(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          {error ? <p className="error">{error}</p> : null}

          {insight && derived ? (
            <>
              <div className="statsGrid insightsGrid">
                <article className="statCard statCardAccent">
                  <p>Employees in {insight.country}</p>
                  <h3>{insight.employeeCount.toLocaleString()}</h3>
                </article>
                <article className="statCard">
                  <p>Average salary</p>
                  <h3>{formatCurrency(insight.averageSalary, "INR")}</h3>
                </article>
                <article className="statCard">
                  <p>Minimum salary</p>
                  <h3>{formatCurrency(insight.minimumSalary, "INR")}</h3>
                </article>
                <article className="statCard">
                  <p>Maximum salary</p>
                  <h3>{formatCurrency(insight.maximumSalary, "INR")}</h3>
                </article>
              </div>

              <section className="insightRangeCard">
                <div className="row">
                  <div>
                    <h3>Salary distribution band</h3>
                    <p className="muted small">
                      Spread of {formatCurrency(derived.spread, "INR")} ({derived.rangePct}% of average)
                    </p>
                  </div>
                </div>
                <div className="rangeTrack">
                  <span className="rangeFill" style={{ left: `${derived.minPos}%`, width: `${derived.maxPos - derived.minPos}%` }} />
                  <span className="rangeMarker rangeMarkerMin" style={{ left: `${derived.minPos}%` }} title="Minimum" />
                  <span className="rangeMarker rangeMarkerAvg" style={{ left: `${derived.avgPos}%` }} title="Average" />
                  <span className="rangeMarker rangeMarkerMax" style={{ left: `${derived.maxPos}%` }} title="Maximum" />
                </div>
                <div className="rangeLabels">
                  <span>Min {formatCurrency(insight.minimumSalary, "INR")}</span>
                  <span>Avg {formatCurrency(insight.averageSalary, "INR")}</span>
                  <span>Max {formatCurrency(insight.maximumSalary, "INR")}</span>
                </div>
              </section>

              {jobInsight ? (
                <section className="insightRoleCard">
                  <h3>Role-level insight</h3>
                  <p className="muted">
                    {jobInsight.jobTitle} in {jobInsight.country}
                  </p>
                  <div className="statsGrid insightsRoleGrid">
                    <article className="statCard">
                      <p>Employees in role</p>
                      <h3>{jobInsight.employeeCount}</h3>
                    </article>
                    <article className="statCard">
                      <p>Role average salary</p>
                      <h3>{formatCurrency(jobInsight.averageSalary, "INR")}</h3>
                    </article>
                    <article className="statCard">
                      <p>Vs country average</p>
                      <h3>
                        {jobInsight.averageSalary >= insight.averageSalary ? "+" : ""}
                        {formatCurrency(jobInsight.averageSalary - insight.averageSalary, "INR")}
                      </h3>
                    </article>
                  </div>
                  <p className="muted small insightNote">
                    Role averages help HR benchmark offers and internal equity reviews for specific job families.
                  </p>
                </section>
              ) : null}
            </>
          ) : !loading ? (
            <p className="muted">No insight data available for the selected filters.</p>
          ) : null}
        </section>
      </section>
    </AppShell>
  );
}
