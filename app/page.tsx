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

export default function Home() {
  const { isAuthenticated, email: savedEmail, setAuth, resetAuth } = useAuthStore();
  const [email, setEmail] = useState(savedEmail || "hr@product-farming.test");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await gqlRequest<{ login: SessionUser }>(
        `mutation Login($email: String!, $role: UserRoleEnum!) {
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
      <h1>Product Farming HR Dashboard</h1>
      <p className="subtitle">Next.js App Router + Zustand frontend scaffold</p>

      {!isAuthenticated ? (
        <form className="card" onSubmit={handleLogin}>
          <h2>Login</h2>
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in as HR Manager"}</button>
          {error ? <p className="error">{error}</p> : null}
        </form>
      ) : (
        <section className="card">
          <div className="row">
            <h2>Employees</h2>
            <div>
              <button onClick={loadEmployees}>Refresh</button>
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
                    <td>{employee.salary} {employee.currency}</td>
                    <td>{employee.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
