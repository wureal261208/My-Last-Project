export type UserRole = "user" | "admin" | "co-op";

export type AppUser = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  status: "active" | "blocked";
};
