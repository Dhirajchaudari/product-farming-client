"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="modalOverlay confirmOverlay" onClick={loading ? undefined : onCancel} role="presentation">
      <div
        className="confirmCard"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="confirmIcon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-desc" className="muted">
          {description}
        </p>
        <div className="confirmActions">
          <button type="button" className="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="dangerBtn" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
