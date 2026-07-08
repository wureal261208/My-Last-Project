import type { UserRole } from "@/models/user";

export function canAccessAdmin(role?: UserRole) {
  return role === "admin";
}

export function canAccessCoopDashboard(role?: UserRole) {
  return role === "admin" || role === "co-op-admin" || role === "employee";
}

export function canUploadBook(role?: UserRole) {
  return role === "admin" || role === "co-op-admin" || role === "employee";
}

export function canManageOwnBook(role?: UserRole, ownerId?: string, uid?: string) {
  return role === "admin" || ((role === "co-op-admin" || role === "employee") && ownerId === uid);
}

export function canReadPremiumBook(role?: UserRole) {
  return role === "admin" || role === "co-op-admin" || role === "employee" || role === "vip";
}
