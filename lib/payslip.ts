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

export async function downloadPayslip(payslipId: string): Promise<void> {
  const { url, fileName } = await fetchPayslipDownloadUrl(payslipId);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
