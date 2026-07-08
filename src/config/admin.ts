export const seedAdmin = {
  uid: process.env.NEXT_PUBLIC_ADMIN_UID || "eAeLVTMuloQpm9UVoUPeHGLsIVG2",
  email: (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "phugaming261208@gmail.com").toLowerCase()
};

// Doi UID/email tai .env.local la du, khong can sua code.
export function isSeedAdmin(uid?: string | null, email?: string | null) {
  return uid === seedAdmin.uid || email?.toLowerCase() === seedAdmin.email;
}
