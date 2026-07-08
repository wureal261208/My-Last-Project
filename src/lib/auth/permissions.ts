import { isSeedAdmin } from "@/config/admin";
import type { AccountType, AppClaims, AppRole } from "@/types/auth";

export type FirebaseAccountIdentity = {
  uid?: string | null;
  email?: string | null;
  claims?: Partial<AppClaims>;
};

export function resolveRole(identity: FirebaseAccountIdentity): AppRole {
  if (isSeedAdmin(identity.uid, identity.email)) return "admin";
  return identity.claims?.role || "anonymous";
}

export function resolveAccountType(identity: FirebaseAccountIdentity): AccountType {
  return identity.claims?.accountType || "normal";
}

export function canManageManagers(role: AppRole) {
  return role === "admin";
}

export function canManageEmployees(role: AppRole) {
  return role === "admin" || role === "manager";
}

export function canImportBooks(role: AppRole) {
  return role === "admin" || role === "manager";
}

export function canEditBook(role: AppRole, ownerUid?: string, uid?: string) {
  return role === "admin" || ((role === "manager" || role === "employee") && ownerUid === uid);
}

export function canReadPremium(accountType: AccountType, role: AppRole) {
  return role === "admin" || role === "manager" || role === "employee" || accountType === "vip";
}
