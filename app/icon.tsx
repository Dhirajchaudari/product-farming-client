import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
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
