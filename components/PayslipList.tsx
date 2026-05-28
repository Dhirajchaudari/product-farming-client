"use client";

import { useState } from "react";

import { downloadPayslip } from "@/lib/payslip";
import type { Payslip } from "@/lib/types";
import { useToastStore } from "@/store/toast.store";

interface PayslipListProps {
  payslips: Payslip[];
  emptyMessage?: string;
}

export function PayslipList({
  payslips,
  emptyMessage = "No payslips available yet."
}: PayslipListProps) {
  const pushToast = useToastStore((state) => state.push);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(payslip: Payslip): Promise<void> {
    setDownloadingId(payslip.id);
    try {
      await downloadPayslip(payslip.id, payslip.fileName);
      pushToast(`Downloading ${payslip.periodLabel} payslip.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download payslip";
      pushToast(message, "error");
    } finally {
      setDownloadingId(null);
    }
  }

  if (payslips.length === 0) {
    return <p className="muted payslipEmpty">{emptyMessage}</p>;
  }

  return (
    <div className="payslipList">
      {payslips.map((payslip) => (
        <article key={payslip.id} className="payslipItem">
          <div className="payslipItemIcon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="payslipItemBody">
            <h3>{payslip.periodLabel}</h3>
            <p className="muted small">{payslip.fileName}</p>
          </div>
          <button
            type="button"
            className="payslipDownloadBtn"
            disabled={downloadingId === payslip.id}
            onClick={() => void handleDownload(payslip)}
          >
            {downloadingId === payslip.id ? (
              <span className="btnLoading">
                <span className="spinner spinnerDark" />
                Preparing...
              </span>
            ) : (
              "Download PDF"
            )}
          </button>
        </article>
      ))}
    </div>
  );
}
