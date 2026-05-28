"use client";

import { create } from "zustand";

import type { UserRole } from "@/lib/types";

interface AuthState {
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
  hydrated: boolean;
  setAuth: (email: string, role: UserRole) => void;
  resetAuth: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: "",
  role: "hr_manager",
  isAuthenticated: false,
  hydrated: false,
  setAuth: (email, role) => set({ email, role, isAuthenticated: true, hydrated: true }),
  resetAuth: () => set({ email: "", role: "hr_manager", isAuthenticated: false, hydrated: true }),
  setHydrated: (value) => set({ hydrated: value })
}));
