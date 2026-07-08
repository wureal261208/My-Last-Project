export type AppRole = "admin" | "manager" | "employee" | "anonymous";
export type AccountType = "vip" | "normal";

export type AppClaims = {
  role: AppRole;
  accountType?: AccountType;
  coopId?: string;
};
