"use client";

import { useToastStore } from "@/store/toast.store";

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toastStack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
          <p>{toast.message}</p>
          <button type="button" className="toastClose" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
