type LogoSize = "sm" | "md" | "lg";

interface PayrollPilotLogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap: Record<LogoSize, number> = {
  sm: 32,
  md: 40,
  lg: 48
};

export function PayrollPilotLogo({ size = "md", className = "" }: PayrollPilotLogoProps) {
  const dim = sizeMap[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand SVG
    <img
      src="/logo.svg"
      alt="PayrollPilot"
      width={dim}
      height={dim}
      className={`brandLogo${size === "lg" ? " brandLogoLarge" : ""} ${className}`.trim()}
      draggable={false}
    />
  );
}
