"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, type = "info") => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, message, type }] });
    window.setTimeout(() => {
      set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
    }, 4200);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
}));
