import type { UserRole } from "@/lib/types";

export function homeRouteForRole(role: UserRole): string {
  if (role === "employee") {
    return "/portal";
  }
  return "/employees";
}
