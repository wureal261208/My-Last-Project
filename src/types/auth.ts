export type AppRole = "admin" | "manager" | "employee" | "anonymous";
export type AccountType = "worm" | "normal";

export type AppClaims = {
  role: AppRole;
  accountType?: AccountType;
  coopId?: string;
};
