"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { UserAvatar } from "@/components/UserAvatar";
import { gqlRequest } from "@/lib/graphql";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function NavIcon({ name }: { name: "employees" | "insights" }) {
  if (name === "insights") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 19V5M10 19V9M16 19v-6M22 19V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, isAuthenticated, role, hydrated, resetAuth } = useAuthStore();
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
    }
  }, [hydrated, isAuthenticated, role, router]);

  if (!hydrated || !isAuthenticated || role === "employee") {
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

        <p className="sideNavLabel">Workspace</p>
        <nav className="sideNav">
          <Link href="/employees" className={pathname.startsWith("/employees") ? "sideLink active" : "sideLink"}>
            <span className="sideLinkIcon">
              <NavIcon name="employees" />
            </span>
            <span className="sideLinkText">
              <span className="sideLinkTitle">Employees</span>
              <span className="sideLinkDesc">Directory & lifecycle</span>
            </span>
          </Link>
          <Link href="/insights" className={pathname.startsWith("/insights") ? "sideLink active" : "sideLink"}>
            <span className="sideLinkIcon">
              <NavIcon name="insights" />
            </span>
            <span className="sideLinkText">
              <span className="sideLinkTitle">Insights</span>
              <span className="sideLinkDesc">Salary analytics</span>
            </span>
          </Link>
        </nav>

        <div className="sidebarFooter">
          <div className="userChip">
            <UserAvatar size="sm" title={email ?? "HR user"} />
            <div>
              <p className="userChipLabel">Signed in as</p>
              <p className="userChipEmail">{email}</p>
            </div>
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
