"use client";

import { useEffect } from "react";

import { gqlRequest } from "@/lib/graphql";
import type { SessionUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";

export function AuthBootstrap() {
  const { isAuthenticated, setAuth, resetAuth, setHydrated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      setHydrated(true);
      return;
    }

    let cancelled = false;
    async function hydrateSession(): Promise<void> {
      try {
        const data = await gqlRequest<{ me: SessionUser | null }>(
          `query { me { id email role } }`
        );
        if (cancelled) {
          return;
        }
        if (data.me) {
          setAuth(data.me.email, data.me.role);
        } else {
          resetAuth();
        }
      } catch {
        if (!cancelled) {
          resetAuth();
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    }

    void hydrateSession();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, resetAuth, setAuth, setHydrated]);

  return null;
}
