"use client";

import { FormEvent, useState } from "react";

import { gqlRequest } from "@/lib/graphql";
import { useAuthStore } from "@/store/auth.store";

interface SessionUser {
  id: string;
  email: string;
  role: "hr_manager" | "admin";
}

interface Employee {
  id: string;
  fullName: string;
  employeeCode: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  status: string;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default function Home() {
  const { isAuthenticated, email: savedEmail, setAuth, resetAuth } = useAuthStore();
  const [email, setEmail] = useState(savedEmail || "hr@product-farming.test");
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await gqlRequest<{ login: SessionUser }>(
        `mutation Login($email: String!, $role: UserRole!) {
          login(email: $email, role: $role) { id email role }
        }`,
        { email, role: "hr_manager" }
      );
      setAuth(data.login.email, data.login.role);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployees(): Promise<void> {
    setLoadingEmployees(true);
    try {
      const data = await gqlRequest<{ employees: Employee[] }>(
        `query Employees {
          employees {
            id
            fullName
            employeeCode
            jobTitle
            department
            country
            salary
            currency
            status
          }
        }`
      );
      setEmployees(data.employees);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      await gqlRequest<{ logout: boolean }>("mutation { logout }");
    } catch {
      // best effort
    }
    resetAuth();
    setEmployees([]);
  }

  return (
    <main className="container">
      <header className="hero">
        <div>
          <p className="badge">PayrollPilot HR</p>
          <h1>Salary Intelligence Dashboard</h1>
          <p className="subtitle">Manage your workforce, compensation, and insights in one place.</p>
        </div>
      </header>

      {!isAuthenticated ? (
        <form className="card authCard" onSubmit={handleLogin}>
          <h2>Sign in to continue</h2>
          <p className="muted">Use your HR manager account to access employee operations.</p>
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in as HR Manager"}</button>
          {error ? <p className="error">{error}</p> : null}
        </form>
      ) : (
        <section className="dashboard">
          <div className="statsGrid">
            <article className="statCard">
              <p>Total Employees</p>
              <h3>{employees.length}</h3>
            </article>
            <article className="statCard">
              <p>Active Countries</p>
              <h3>{new Set(employees.map((employee) => employee.country)).size}</h3>
            </article>
            <article className="statCard">
              <p>Departments</p>
              <h3>{new Set(employees.map((employee) => employee.department)).size}</h3>
            </article>
          </div>

          <section className="card">
          <div className="row">
            <div>
              <h2>Employees</h2>
              <p className="muted">Live data fetched from your GraphQL backend.</p>
            </div>
            <div>
              <button onClick={loadEmployees}>{loadingEmployees ? "Refreshing..." : "Refresh"}</button>
              <button onClick={handleLogout} className="secondary">Logout</button>
            </div>
          </div>
          {error ? <p className="error">{error}</p> : null}
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Country</th>
                  <th>Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.fullName}</td>
                    <td>{employee.employeeCode}</td>
                    <td>{employee.jobTitle}</td>
                    <td>{employee.department}</td>
                    <td>{employee.country}</td>
                    <td>{formatCurrency(employee.salary, employee.currency)}</td>
                    <td>
                      <span className={`status ${employee.status.toLowerCase()}`}>{employee.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </section>
        </section>
      )}
    </main>
  );
}
