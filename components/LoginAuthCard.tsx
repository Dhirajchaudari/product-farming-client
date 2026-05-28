import type { ReactNode } from "react";

interface LoginAuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LoginAuthCard({ title, subtitle, children, footer }: LoginAuthCardProps) {
  return (
    <div className="loginAuthCard">
      <header className="loginAuthCardHeader">
        <div className="loginAuthCardIcon" aria-hidden>
          <ShieldIcon />
        </div>
        <div>
          <h2>{title}</h2>
          <p className="loginAuthCardSubtitle">{subtitle}</p>
        </div>
      </header>
      <div className="loginAuthCardBody">{children}</div>
      {footer ? <footer className="loginAuthCardFooter">{footer}</footer> : null}
    </div>
  );
}
