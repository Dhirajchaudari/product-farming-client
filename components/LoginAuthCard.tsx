import type { ReactNode } from "react";

interface LoginAuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function LoginAuthCard({ title, subtitle, children, footer }: LoginAuthCardProps) {
  return (
    <div className="loginAuthPanel">
      <header className="loginAuthPanelHeader">
        <p className="loginAuthPanelEyebrow">Secure access</p>
        <h2>{title}</h2>
        <p className="loginAuthPanelSubtitle">{subtitle}</p>
      </header>
      <div className="loginAuthPanelBody">{children}</div>
      {footer ? <footer className="loginAuthPanelFooter">{footer}</footer> : null}
    </div>
  );
}
