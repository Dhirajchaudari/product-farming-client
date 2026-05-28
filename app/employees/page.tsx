"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmployeeForm } from "@/components/EmployeeForm";
import { Modal } from "@/components/Modal";
import { PageLoader } from "@/components/PageLoader";
import { PayslipList } from "@/components/PayslipList";
import { UserAvatar } from "@/components/UserAvatar";
import { gqlRequest } from "@/lib/graphql";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  EMPTY_EMPLOYEE_FORM,
  type Employee,
  type EmployeeFormValues,
  type EmployeeListPage,
  type Payslip
} from "@/lib/types";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";

type ModalMode = "create" | "edit" | "view" | null;

function employeeToForm(employee: Employee): EmployeeFormValues {
  return {
    fullName: employee.fullName,
    email: employee.email,
    jobTitle: employee.jobTitle,
    department: employee.department,
    country: employee.country,
    salary: employee.salary,
    currency: employee.currency,
    dateOfJoining: employee.dateOfJoining.slice(0, 10),
    employmentType: employee.employmentType,
    status: employee.status,
    managerName: employee.managerName ?? ""
  };
}

export default function EmployeesPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, role } = useAuthStore();
  const pushToast = useToastStore((state) => state.push);
  const [pageData, setPageData] = useState<EmployeeListPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [formValues, setFormValues] = useState<EmployeeFormValues>(EMPTY_EMPLOYEE_FORM);
  const [viewPayslips, setViewPayslips] = useState<Payslip[]>([]);
  const [payslipsLoading, setPayslipsLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const isSearchPending = searchTerm !== debouncedSearch;

  const loadEmployees = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const data = await gqlRequest<{ employeesPage: EmployeeListPage }>(
        `query EmployeesPage($input: EmployeeListInput) {
          employeesPage(input: $input) {
            totalCount
            page
            pageSize
            totalPages
            items {
              id
              fullName
              email
              employeeCode
              jobTitle
              department
              country
              salary
              currency
              dateOfJoining
              employmentType
              status
              managerName
              isActive
            }
          }
        }`,
        {
          input: {
            search: debouncedSearch.trim() || undefined,
            department: departmentFilter.trim() || undefined,
            status: statusFilter === "all" ? undefined : statusFilter,
            page: currentPage,
            pageSize
          }
        }
      );
      setPageData(data.employeesPage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load employees";
      setError(message);
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, departmentFilter, statusFilter, currentPage, pushToast]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (role === "employee") {
      router.replace("/portal");
      return;
    }
    const timer = window.setTimeout(() => {
      void loadEmployees();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, isAuthenticated, role, router, loadEmployees]);

  function openCreate(): void {
    setFormValues(EMPTY_EMPLOYEE_FORM);
    setSelectedEmployee(null);
    setModalMode("create");
  }

  async function loadEmployeePayslips(employeeId: string): Promise<void> {
    setPayslipsLoading(true);
    try {
      const data = await gqlRequest<{ employeePayslips: Payslip[] }>(
        `query EmployeePayslips($employeeId: String!) {
          employeePayslips(employeeId: $employeeId) {
            id periodLabel fileName createdAt
          }
        }`,
        { employeeId }
      );
      setViewPayslips(data.employeePayslips);
    } catch (err) {
      setViewPayslips([]);
      const message = err instanceof Error ? err.message : "Failed to load payslips";
      pushToast(message, "error");
    } finally {
      setPayslipsLoading(false);
    }
  }

  function openView(employee: Employee): void {
    setSelectedEmployee(employee);
    setViewPayslips([]);
    setModalMode("view");
    void loadEmployeePayslips(employee.id);
  }

  function openEdit(employee: Employee): void {
    setSelectedEmployee(employee);
    setFormValues(employeeToForm(employee));
    setModalMode("edit");
  }

  function closeModal(): void {
    setModalMode(null);
    setSelectedEmployee(null);
  }

  async function handleCreate(): Promise<void> {
    setSaving(true);
    setError("");
    try {
      await gqlRequest(
        `mutation CreateEmployee($input: CreateEmployeeInput!) {
          createEmployee(input: $input) { id }
        }`,
        {
          input: {
            ...formValues,
            dateOfJoining: new Date(formValues.dateOfJoining).toISOString(),
            managerName: formValues.managerName || undefined
          }
        }
      );
      closeModal();
      setCurrentPage(1);
      await loadEmployees();
      pushToast(`Employee added. Welcome email sent to ${formValues.email}.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create employee";
      setError(message);
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(): Promise<void> {
    if (!selectedEmployee) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await gqlRequest(
        `mutation UpdateEmployee($input: UpdateEmployeeInput!) {
          updateEmployee(input: $input) { id }
        }`,
        {
          input: {
            id: selectedEmployee.id,
            fullName: formValues.fullName,
            email: formValues.email,
            jobTitle: formValues.jobTitle,
            department: formValues.department,
            country: formValues.country,
            salary: formValues.salary,
            currency: formValues.currency,
            dateOfJoining: new Date(formValues.dateOfJoining).toISOString(),
            employmentType: formValues.employmentType,
            status: formValues.status,
            managerName: formValues.managerName || undefined,
            isActive: formValues.status === "active"
          }
        }
      );
      closeModal();
      await loadEmployees();
      pushToast("Employee updated successfully.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update employee";
      setError(message);
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await gqlRequest<{ deleteEmployee: boolean }>(
        `mutation DeleteEmployee($id: String!) { deleteEmployee(id: $id) }`,
        { id: deleteTarget.id }
      );
      setDeleteTarget(null);
      await loadEmployees();
      pushToast("Employee deleted.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete employee";
      setError(message);
      pushToast(message, "error");
    } finally {
      setDeleting(false);
    }
  }

  const items = pageData?.items ?? [];

  if (!hydrated) {
    return <PageLoader label="Loading dashboard..." fullScreen />;
  }

  return (
    <AppShell title="Employees" subtitle="Create, view, update, and delete workforce records stored in PostgreSQL.">
      <section className="dashboard">
        <div className="statsGrid">
          <article className="statCard statCardAccent">
            <p>Total employees</p>
            <h3>{pageData?.totalCount ?? 0}</h3>
          </article>
          <article className="statCard">
            <p>Current page</p>
            <h3>{pageData?.page ?? 1}</h3>
          </article>
          <article className="statCard">
            <p>Total pages</p>
            <h3>{pageData?.totalPages ?? 1}</h3>
          </article>
        </div>

        <section className="card">
          <div className="row">
            <div>
              <h2>Employee directory</h2>
              <p className="muted">Server-side search, filters, and pagination via GraphQL.</p>
            </div>
            <div className="actionRow">
              <button type="button" onClick={openCreate}>+ Add employee</button>
              <button type="button" className="secondary" onClick={loadEmployees} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="filtersRow">
            <input
              placeholder="Search name, code, title, country"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <input
              placeholder="Department filter"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="exited">Exited</option>
            </select>
          </div>

          {error ? <p className="error">{error}</p> : null}
          <p className="muted">
            Showing {items.length} of {pageData?.totalCount ?? 0} records
            {isSearchPending ? " · Searching..." : null}
          </p>

          <div className={`tableWrap dataTableWrap ${loading ? "tableLoading" : ""}`}>
            {loading ? (
              <div className="tableOverlay">
                <PageLoader label="Loading employees..." />
              </div>
            ) : null}
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Country</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((employee) => (
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
                    <td className="tableActions">
                      <button type="button" className="ghost" onClick={() => openView(employee)}>View</button>
                      <button type="button" className="ghost" onClick={() => openEdit(employee)}>Edit</button>
                      <button type="button" className="ghost dangerText" onClick={() => setDeleteTarget(employee)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="muted">No employees found for current filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="paginationRow">
            <button
              type="button"
              className="secondary"
              disabled={(pageData?.page ?? 1) <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="muted">
              Page {pageData?.page ?? 1} of {pageData?.totalPages ?? 1}
            </span>
            <button
              type="button"
              disabled={(pageData?.page ?? 1) >= (pageData?.totalPages ?? 1)}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </section>

      {modalMode === "create" ? (
        <Modal title="Add employee" subtitle="A welcome email is sent automatically after creation." onClose={closeModal} wide>
          <EmployeeForm
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleCreate}
            onCancel={closeModal}
            submitLabel="Create employee"
            loading={saving}
          />
        </Modal>
      ) : null}

      {modalMode === "edit" && selectedEmployee ? (
        <Modal title="Edit employee" subtitle={`Updating ${selectedEmployee.employeeCode}`} onClose={closeModal} wide>
          <EmployeeForm
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleUpdate}
            onCancel={closeModal}
            submitLabel="Save changes"
            loading={saving}
          />
        </Modal>
      ) : null}

      {modalMode === "view" && selectedEmployee ? (
        <Modal title="Employee profile" onClose={closeModal} wide>
          <div className="profileHero">
            <UserAvatar size="md" title={selectedEmployee.fullName} />
            <div>
              <h3>{selectedEmployee.fullName}</h3>
              <p className="muted">{selectedEmployee.email}</p>
              <div className="profileMeta">
                <span className={`status ${selectedEmployee.status.toLowerCase()}`}>{selectedEmployee.status}</span>
                <span className="profileCode">{selectedEmployee.employeeCode}</span>
              </div>
            </div>
          </div>
          <div className="profileGrid">
            <article className="profileCard">
              <p className="profileCardLabel">Job title</p>
              <p className="profileCardValue">{selectedEmployee.jobTitle}</p>
            </article>
            <article className="profileCard">
              <p className="profileCardLabel">Department</p>
              <p className="profileCardValue">{selectedEmployee.department}</p>
            </article>
            <article className="profileCard">
              <p className="profileCardLabel">Country</p>
              <p className="profileCardValue">{selectedEmployee.country}</p>
            </article>
            <article className="profileCard">
              <p className="profileCardLabel">Salary</p>
              <p className="profileCardValue">{formatCurrency(selectedEmployee.salary, selectedEmployee.currency)}</p>
            </article>
            <article className="profileCard">
              <p className="profileCardLabel">Joined</p>
              <p className="profileCardValue">{formatDate(selectedEmployee.dateOfJoining)}</p>
            </article>
            <article className="profileCard">
              <p className="profileCardLabel">Employment</p>
              <p className="profileCardValue">{selectedEmployee.employmentType.replace("_", " ")}</p>
            </article>
            <article className="profileCard">
              <p className="profileCardLabel">Manager</p>
              <p className="profileCardValue">{selectedEmployee.managerName || "—"}</p>
            </article>
            <article className="profileCard">
              <p className="profileCardLabel">Active flag</p>
              <p className="profileCardValue">{selectedEmployee.isActive ? "Yes" : "No"}</p>
            </article>
          </div>

          <section className="profilePayslipSection">
            <h3>Salary slips</h3>
            <p className="muted small">Download payslips generated for this employee.</p>
            {payslipsLoading ? (
              <PageLoader label="Loading payslips..." />
            ) : (
              <PayslipList
                payslips={viewPayslips}
                emptyMessage="No payslips on file. Payslips are created when a new employee is added."
              />
            )}
          </section>

          <div className="formActions">
            <button type="button" className="secondary" onClick={closeModal}>Close</button>
            <button type="button" onClick={() => openEdit(selectedEmployee)}>Edit employee</button>
          </div>
        </Modal>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete employee?"
        description={
          deleteTarget
            ? `${deleteTarget.fullName} (${deleteTarget.employeeCode}) will be permanently removed from PostgreSQL. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete employee"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AppShell>
  );
}
