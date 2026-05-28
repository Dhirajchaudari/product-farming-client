"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, isAuthenticated, resetAuth } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);

  async function handleLogout(): Promise<void> {
    try {
      await gqlRequest<{ logout: boolean }>("mutation { logout }");
    } catch {
      // best effort
    }
    resetAuth();
    pushToast("Signed out.", "info");
    router.push("/login");
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="brandMark">PP</div>
          <div>
            <p className="brandTitle">PayrollPilot</p>
            <p className="brandSub">HR Console</p>
          </div>
        </div>
        <nav className="sideNav">
          <Link href="/employees" className={pathname.startsWith("/employees") ? "sideLink active" : "sideLink"}>
            <span className="sideLinkDot" />
            <span>Employees</span>
          </Link>
          <Link href="/insights" className={pathname.startsWith("/insights") ? "sideLink active" : "sideLink"}>
            <span className="sideLinkDot" />
            <span>Insights</span>
          </Link>
        </nav>
        <div className="sidebarFooter">
          <div className="userChip">
            <p className="userChipLabel">Signed in as</p>
            <p className="userChipEmail">{email}</p>
          </div>
          <button type="button" className="secondary fullWidth" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="mainColumn">
        <header className="topBar">
          <div>
            <p className="badge">HR Dashboard</p>
            <h1>{title}</h1>
            <p className="subtitle">{subtitle}</p>
          </div>
        </header>
        <div className="mainContent">{children}</div>
      </div>
    </div>
  );
}
