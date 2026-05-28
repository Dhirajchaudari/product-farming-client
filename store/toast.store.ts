"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const TOAST_DURATION_MS = 4800;
const EXIT_ANIMATION_MS = 320;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, type = "info") => {
    const id = crypto.randomUUID();
    set({ toasts: [...get().toasts, { id, message, type }] });
    window.setTimeout(() => {
      get().dismiss(id);
    }, TOAST_DURATION_MS);
  },
  dismiss: (id) => {
    const current = get().toasts;
    if (!current.some((toast) => toast.id === id)) {
      return;
    }
    set({
      toasts: current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast))
    });
    window.setTimeout(() => {
      set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
    }, EXIT_ANIMATION_MS);
  }
}));
