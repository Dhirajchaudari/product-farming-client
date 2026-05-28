export type UserRole = "hr_manager" | "admin" | "employee";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  employeeCode: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  dateOfJoining: string;
  employmentType: string;
  status: string;
  managerName?: string;
  isActive: boolean;
}

export interface EmployeeListPage {
  items: Employee[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeFormValues {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  dateOfJoining: string;
  employmentType: string;
  status: string;
  managerName: string;
}

export interface Payslip {
  id: string;
  periodLabel: string;
  periodMonth: number;
  periodYear: number;
  cloudinaryUrl: string;
  fileName: string;
  createdAt: string;
}

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  fullName: "",
  email: "",
  jobTitle: "",
  department: "",
  country: "India",
  salary: 0,
  currency: "INR",
  dateOfJoining: new Date().toISOString().slice(0, 10),
  employmentType: "full_time",
  status: "active",
  managerName: ""
};
