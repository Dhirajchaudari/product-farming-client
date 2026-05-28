"use client";

import { FormEvent } from "react";

import type { EmployeeFormValues } from "@/lib/types";

interface EmployeeFormProps {
  values: EmployeeFormValues;
  onChange: (values: EmployeeFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
}

export function EmployeeForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  loading
}: EmployeeFormProps) {
  function updateField<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]): void {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="employeeForm" onSubmit={handleSubmit}>
      <section className="formSection">
        <h3 className="formSectionTitle">Personal & contact</h3>
        <div className="formGrid">
          <label>
            Full name
            <input value={values.fullName} onChange={(e) => updateField("fullName", e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={values.email} onChange={(e) => updateField("email", e.target.value)} required />
          </label>
        </div>
      </section>

      <section className="formSection">
        <h3 className="formSectionTitle">Role & organization</h3>
        <div className="formGrid">
          <label>
            Job title
            <input value={values.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} required />
          </label>
          <label>
            Department
            <input value={values.department} onChange={(e) => updateField("department", e.target.value)} required />
          </label>
          <label>
            Manager name
            <input value={values.managerName} onChange={(e) => updateField("managerName", e.target.value)} placeholder="Optional" />
          </label>
          <label>
            Country
            <input value={values.country} onChange={(e) => updateField("country", e.target.value)} required />
          </label>
        </div>
      </section>

      <section className="formSection">
        <h3 className="formSectionTitle">Compensation & employment</h3>
        <div className="formGrid">
          <label>
            Salary
            <input
              type="number"
              min={0}
              value={values.salary}
              onChange={(e) => updateField("salary", Number(e.target.value))}
              required
            />
          </label>
          <label>
            Currency
            <input
              value={values.currency}
              maxLength={3}
              onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
              required
            />
          </label>
          <label>
            Date of joining
            <input
              type="date"
              value={values.dateOfJoining}
              onChange={(e) => updateField("dateOfJoining", e.target.value)}
              required
            />
          </label>
          <label>
            Employment type
            <select value={values.employmentType} onChange={(e) => updateField("employmentType", e.target.value)}>
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
            </select>
          </label>
          <label>
            Status
            <select value={values.status} onChange={(e) => updateField("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="exited">Exited</option>
            </select>
          </label>
        </div>
      </section>

      <div className="formActions">
        <button type="button" className="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
