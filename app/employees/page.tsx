"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { gqlRequest } from "@/lib/graphql";
import { useAuthStore } from "@/store/auth.store";

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

export default function EmployeesPage() {
  const router = useRouter();
  const { isAuthenticated, resetAuth } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const countriesCount = useMemo(
    () => new Set(employees.map((employee) => employee.country)).size,
    [employees]
  );
  const departmentsCount = useMemo(
    () => new Set(employees.map((employee) => employee.department)).size,
    [employees]
  );
  const departmentOptions = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.department))).sort(),
    [employees]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.status))).sort(),
    [employees]
  );
  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch = term.length === 0
        || employee.fullName.toLowerCase().includes(term)
        || employee.employeeCode.toLowerCase().includes(term)
        || employee.jobTitle.toLowerCase().includes(term)
        || employee.country.toLowerCase().includes(term);
      const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
      const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, selectedDepartment, selectedStatus]);
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEmployees = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, safeCurrentPage]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    void loadEmployees();
  }, [isAuthenticated, router]);

  async function loadEmployees(): Promise<void> {
    setLoadingEmployees(true);
    setError("");
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
    router.push("/login");
  }

  return (
    <main className="container">
      <header className="hero">
        <div>
          <p className="badge">PayrollPilot HR</p>
          <h1>Employees</h1>
          <p className="subtitle">Manage your workforce records and current status.</p>
        </div>
      </header>

      <nav className="tabs">
        <Link href="/employees" className="tab active">Employees</Link>
        <Link href="/insights" className="tab">Insights</Link>
      </nav>

      <section className="dashboard">
        <div className="statsGrid">
          <article className="statCard">
            <p>Total Employees</p>
            <h3>{employees.length}</h3>
          </article>
          <article className="statCard">
            <p>Active Countries</p>
            <h3>{countriesCount}</h3>
          </article>
          <article className="statCard">
            <p>Departments</p>
            <h3>{departmentsCount}</h3>
          </article>
        </div>

        <section className="card">
          <div className="row">
            <div>
              <h2>Employee Directory</h2>
              <p className="muted">Live data fetched from your GraphQL backend.</p>
            </div>
            <div>
              <button onClick={loadEmployees}>{loadingEmployees ? "Refreshing..." : "Refresh"}</button>
              <button onClick={handleLogout} className="secondary">Logout</button>
            </div>
          </div>
          <div className="filtersRow">
            <input
              placeholder="Search by name, code, title, country"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
            <select value={selectedDepartment} onChange={(event) => {
              setSelectedDepartment(event.target.value);
              setCurrentPage(1);
            }}>
              <option value="all">All Departments</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            <select value={selectedStatus} onChange={(event) => {
              setSelectedStatus(event.target.value);
              setCurrentPage(1);
            }}>
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <p className="muted">
            Showing {paginatedEmployees.length} of {filteredEmployees.length} matching records (total {employees.length})
          </p>
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
                {paginatedEmployees.map((employee) => (
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
          <div className="paginationRow">
            <button
              className="secondary"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safeCurrentPage === 1}
            >
              Previous
            </button>
            <span className="muted">Page {safeCurrentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safeCurrentPage === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
