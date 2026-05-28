"use client";

import { useToastStore, type ToastType } from "@/store/toast.store";

function toastIcon(type: ToastType): string {
  if (type === "success") {
    return "✓";
  }
  if (type === "error") {
    return "!";
  }
  return "i";
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toastStack" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} ${toast.exiting ? "toast-exit" : "toast-enter"}`}
          role="status"
        >
          <span className="toastIcon" aria-hidden>
            {toastIcon(toast.type)}
          </span>
          <div className="toastContent">
            <p className="toastTitle">{toast.type === "error" ? "Something went wrong" : toast.type === "success" ? "Success" : "Notice"}</p>
            <p className="toastMessage">{toast.message}</p>
          </div>
          <button type="button" className="toastClose" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
            ×
          </button>
          <span className="toastProgress" aria-hidden />
        </div>
      ))}
    </div>
  );
}
