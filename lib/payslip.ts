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
    let detail = "Failed to download payslip.";
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      detail = body.message ?? body.error ?? detail;
    } catch {
      // ignore non-json body
    }
    throw new Error(detail);
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
