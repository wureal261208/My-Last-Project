export type UserRole = "admin" | "co-op-admin" | "employee" | "vip" | "normal" | "anonymous";

export type AppUser = {
  uid: string;
  email?: string;
  name: string;
  role: UserRole;
  status: "active" | "blocked";
  coopId?: string;
};
