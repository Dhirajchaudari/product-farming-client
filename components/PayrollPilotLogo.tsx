type LogoSize = "sm" | "md" | "lg";

interface PayrollPilotLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, number> = {
  sm: 32,
  md: 42,
  lg: 52
};

export function PayrollPilotLogo({ size = "md", className = "" }: PayrollPilotLogoProps) {
  const dim = sizeMap[size];

  return (
    <span
      className={`brandLogo brandLogo${size === "lg" ? " brandLogoLarge" : ""} ${className}`.trim()}
      role="img"
      aria-label="PayrollPilot"
    >
      <svg width={dim} height={dim} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="11" fill="url(#pp-logo-grad)" />
        <rect x="11" y="10" width="18" height="22" rx="3" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
        <path d="M15 16h10M15 20h7M15 24h9" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="27" cy="13" r="5" fill="#22d3ee" />
        <path d="M25.2 13l1.2 1.2 2.6-2.6" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="pp-logo-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
