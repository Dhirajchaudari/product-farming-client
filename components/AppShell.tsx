"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";
import { useAuthStore } from "@/store/auth.store";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, isAuthenticated, resetAuth } = useAuthStore();

  async function handleLogout(): Promise<void> {
    try {
      await gqlRequest<{ logout: boolean }>("mutation { logout }");
    } catch {
      // best effort
    }
    resetAuth();
    router.push("/login");
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brandBlock">
          <p className="brandMark">PP</p>
          <div>
            <p className="brandTitle">PayrollPilot</p>
            <p className="brandSub">HR Workspace</p>
          </div>
        </div>
        <nav className="sideNav">
          <Link href="/employees" className={pathname.startsWith("/employees") ? "sideLink active" : "sideLink"}>
            Employees
          </Link>
          <Link href="/insights" className={pathname.startsWith("/insights") ? "sideLink active" : "sideLink"}>
            Insights
          </Link>
        </nav>
        <div className="sidebarFooter">
          <p className="muted small">{email}</p>
          <button type="button" className="secondary fullWidth" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="mainPane">
        <header className="pageHeader">
          <div>
            <p className="badge">HR Dashboard</p>
            <h1>{title}</h1>
            <p className="subtitle">{subtitle}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
