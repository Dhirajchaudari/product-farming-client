import { getApiBaseUrl } from "@/lib/api-base";
import { gqlRequest } from "@/lib/graphql";

export async function fetchPayslipDownloadUrl(payslipId: string): Promise<{ url: string; fileName: string }> {
  const data = await gqlRequest<{ payslipDownloadUrl: { url: string; fileName: string } }>(
    `query PayslipDownload($payslipId: String!) {
      payslipDownloadUrl(payslipId: $payslipId) { url fileName }
    }`,
    { payslipId }
  );
  return data.payslipDownloadUrl;
}

export async function downloadPayslip(payslipId: string, fileName: string): Promise<void> {
  const apiBase = getApiBaseUrl();
  const response = await fetch(`${apiBase}/payslips/${encodeURIComponent(payslipId)}/download`, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Failed to download payslip. Try again or ask HR to regenerate your payslip.");
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
}
