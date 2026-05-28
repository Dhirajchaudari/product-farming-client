import { PayrollPilotLogo } from "@/components/PayrollPilotLogo";

interface LoginHeroPanelProps {
  variant?: "login" | "setup";
}

const LOGIN_HIGHLIGHTS = [
  {
    title: "One place for your team",
    description: "Manage employee records, departments, and employment status from a single directory."
  },
  {
    title: "Payroll you can trust",
    description: "Track salaries, generate payslips, and give employees secure access to their documents."
  },
  {
    title: "Built for HR & employees",
    description: "HR runs the console; employees sign in to view profile details and download salary slips."
  }
] as const;

const SETUP_HIGHLIGHTS = [
  {
    title: "Your employee account",
    description: "Use the email from your welcome message to activate access to PayrollPilot."
  },
  {
    title: "Payslips at your fingertips",
    description: "Download PDF salary slips for each pay period after you sign in."
  },
  {
    title: "Profile always up to date",
    description: "View job title, department, and employment details in your personal workspace."
  }
] as const;

export function LoginHeroPanel({ variant = "login" }: LoginHeroPanelProps) {
  const isSetup = variant === "setup";
  const highlights = isSetup ? SETUP_HIGHLIGHTS : LOGIN_HIGHLIGHTS;

  return (
    <div className="loginHeroContent">
      <PayrollPilotLogo size="lg" />
      <p className="loginEyebrow">{isSetup ? "Employee onboarding" : "Workforce platform"}</p>
      <h1>{isSetup ? "Welcome aboard" : "PayrollPilot"}</h1>
      <p className="loginLead">
        {isSetup
          ? "Set your password to unlock your employee workspace."
          : "Modern payroll & workforce management for growing teams."}
      </p>

      <div className="loginHighlightGrid">
        {highlights.map((item) => (
          <article key={item.title} className="loginHighlightCard">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
