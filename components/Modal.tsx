"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export function Modal({ title, subtitle, onClose, children, wide }: ModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modalOverlay modalOverlayEnter" onClick={onClose} role="presentation">
      <div
        className={`modalCard modalCardEnter ${wide ? "modalWide" : ""}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modalHeader">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p className="muted small modalSubtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="iconBtn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
