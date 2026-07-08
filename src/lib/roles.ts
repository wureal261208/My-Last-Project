import type { UserRole } from "@/models/user";

export function canAccessAdmin(role?: UserRole) {
  return role === "admin";
}

export function canUploadBook(role?: UserRole) {
  return role === "admin" || role === "co-op";
}

export function canManageOwnBook(role?: UserRole, ownerId?: string, uid?: string) {
  return role === "admin" || (role === "co-op" && ownerId === uid);
}
