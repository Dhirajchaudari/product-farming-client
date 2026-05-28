import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
          borderRadius: 36
        }}
      >
        <svg width="110" height="110" viewBox="0 0 40 40" fill="none">
          <rect x="11" y="10" width="18" height="22" rx="3" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <path d="M15 16h10M15 20h7M15 24h9" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="27" cy="13" r="5" fill="#22d3ee" />
          <path d="M25.2 13l1.2 1.2 2.6-2.6" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
