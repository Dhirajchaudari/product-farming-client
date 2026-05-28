interface LoginHeroPanelProps {
  variant?: "login" | "setup";
}

const FEATURES = [
  "Server-side search, filters, and pagination via GraphQL.",
  "PostgreSQL + Prisma for reliable employee and payroll records.",
  "Role-based access for HR admins and employee self-service.",
  "Payslip PDF generation with secure Cloudinary delivery.",
  "Async email onboarding via BullMQ workers.",
] as const;

const STACK = ["Next.js", "GraphQL", "PostgreSQL", "Prisma", "Redis", "Cloudinary"] as const;

export function LoginHeroPanel({ variant = "login" }: LoginHeroPanelProps) {
  const isSetup = variant === "setup";

  return (
    <div className="loginHeroContent">
      <span className="brandMark brandMarkLarge">PP</span>
      <p className="loginEyebrow">PayrollPilot platform</p>
      <h1>{isSetup ? "Welcome aboard" : "PayrollPilot"}</h1>
      <p className="loginLead">
        {isSetup
          ? "Create your password to access payslips and your employee profile."
          : "Modern payroll & workforce management for growing teams."}
      </p>

      <ul className="loginFeatureList">
        {FEATURES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="loginTechStack" aria-label="Technology stack">
        {STACK.map((tag) => (
          <span key={tag} className="loginTechTag">
            {tag}
          </span>
        ))}
      </div>

      <div className="loginStats">
        <div>
          <strong>GraphQL</strong>
          <span>Typed API layer</span>
        </div>
        <div>
          <strong>Prisma</strong>
          <span>Data modeling</span>
        </div>
        <div>
          <strong>RBAC</strong>
          <span>HR & employee roles</span>
        </div>
      </div>
    </div>
  );
}
