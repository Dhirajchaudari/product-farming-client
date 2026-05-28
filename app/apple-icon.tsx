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
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
          borderRadius: 36
        }}
      >
        <svg width="100" height="100" viewBox="0 0 48 48" fill="none">
          <path
            d="M17 14h9.5c4.14 0 7.5 3.36 7.5 7.5S30.64 29 26.5 29H21v5"
            stroke="#ffffff"
            strokeWidth="3.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M15 35h18" stroke="#7dd3fc" strokeWidth="2.75" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
