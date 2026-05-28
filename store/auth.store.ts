"use client";

import { create } from "zustand";

type Role = "hr_manager" | "admin";

interface AuthState {
  email: string;
  role: Role;
  isAuthenticated: boolean;
  setAuth: (email: string, role: Role) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: "",
  role: "hr_manager",
  isAuthenticated: false,
  setAuth: (email, role) => set({ email, role, isAuthenticated: true }),
  resetAuth: () => set({ email: "", role: "hr_manager", isAuthenticated: false })
}));
