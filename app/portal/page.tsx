"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageLoader } from "@/components/PageLoader";
import { PayrollPilotLogo } from "@/components/PayrollPilotLogo";
import { UserAvatar } from "@/components/UserAvatar";
import { PayslipList } from "@/components/PayslipList";
import { gqlRequest } from "@/lib/graphql";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Employee, Payslip } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";

export default function PortalPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, role, email, resetAuth } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);
  const [profile, setProfile] = useState<Employee | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortal = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ myEmployeeProfile: Employee | null; myPayslips: Payslip[] }>(
        `query Portal {
          myEmployeeProfile {
            id fullName email employeeCode jobTitle department country salary currency dateOfJoining status
          }
          myPayslips {
            id periodLabel periodMonth periodYear cloudinaryUrl fileName createdAt
          }
        }`
      );
      setProfile(data.myEmployeeProfile);
      setPayslips(data.myPayslips);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load portal";
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role !== "employee") {
      router.replace("/employees");
      return;
    }
    const timer = window.setTimeout(() => {
      void loadPortal();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, isAuthenticated, role, router, loadPortal]);

  async function handleLogout(): Promise<void> {
    try {
      await gqlRequest<{ logout: boolean }>("mutation { logout }");
    } catch {
      // best effort
    }
    resetAuth();
    router.push("/login");
  }

  if (!hydrated || loading) {
    return <PageLoader label="Loading your workspace..." fullScreen />;
  }

  return (
    <div className="portalShell">
      <header className="portalTopbar">
        <div className="portalTopbarBrand">
          <PayrollPilotLogo size="md" />
          <div>
            <p className="brandTitle">PayrollPilot</p>
            <p className="brandSub">Employee workspace</p>
          </div>
        </div>
        <div className="portalTopbarActions">
          <div className="portalUserChip">
            <UserAvatar size="sm" title={email ?? "Employee"} />
            <span className="portalUserEmail">{email}</span>
          </div>
          <button type="button" className="secondary" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="portalShellMain">
        {profile ? (
          <section className="portalWelcomeCard">
            <UserAvatar size="lg" title={profile.fullName} />
            <div>
              <p className="portalWelcomeLabel">Welcome back</p>
              <h1>{profile.fullName}</h1>
              <p className="muted">
                {profile.jobTitle} · {profile.department} · {profile.employeeCode}
              </p>
            </div>
          </section>
        ) : null}

        <div className="portalGrid">
          {profile ? (
            <section className="portalCard">
              <h2>Profile summary</h2>
              <dl className="portalFacts">
                <div>
                  <dt>Email</dt>
                  <dd>{profile.email}</dd>
                </div>
                <div>
                  <dt>Country</dt>
                  <dd>{profile.country}</dd>
                </div>
                <div>
                  <dt>Salary</dt>
                  <dd>{formatCurrency(profile.salary, profile.currency)}</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{formatDate(profile.dateOfJoining)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className={`status ${profile.status.toLowerCase()}`}>{profile.status}</span>
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}

          <section className="portalCard portalCardWide">
            <div className="row">
              <div>
                <h2>Salary slips</h2>
                <p className="muted">Secure PDF downloads for each pay period.</p>
              </div>
              <button type="button" className="secondary" onClick={loadPortal}>
                Refresh
              </button>
            </div>
            <PayslipList
              payslips={payslips}
              emptyMessage="No payslips yet. If you were just onboarded, ask HR to confirm your payslip was generated."
            />
          </section>
        </div>
      </main>
    </div>
  );
}
