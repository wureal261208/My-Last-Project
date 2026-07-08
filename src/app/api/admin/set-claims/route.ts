import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { isSeedAdmin } from "@/config/admin";
import type { AccountType, AppRole } from "@/types/auth";

const allowedRoles: AppRole[] = ["admin", "manager", "employee", "anonymous"];
const allowedAccountTypes: AccountType[] = ["vip", "normal"];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

  if (!idToken) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const requester = await adminAuth.verifyIdToken(idToken);
  const requesterRole = requester.role as AppRole | undefined;

  if (!isSeedAdmin(requester.uid, requester.email) && requesterRole !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const targetUid = String(body.uid || "");
  const email = body.email ? String(body.email).toLowerCase() : undefined;
  const role = body.role as AppRole;
  const accountType = (body.accountType || "normal") as AccountType;
  const coopId = body.coopId ? String(body.coopId) : undefined;
  const managerUid = body.managerUid ? String(body.managerUid) : undefined;

  if (!targetUid || !allowedRoles.includes(role) || !allowedAccountTypes.includes(accountType)) {
    return NextResponse.json({ error: "Invalid uid, role, or accountType" }, { status: 400 });
  }

  const claims = {
    role,
    accountType,
    ...(coopId ? { coopId } : {}),
    ...(managerUid ? { managerUid } : {})
  };

  await adminAuth.setCustomUserClaims(targetUid, claims);

  await adminDb.collection("users").doc(targetUid).set(
    {
      uid: targetUid,
      email,
      role,
      accountType,
      coopId: coopId || null,
      managerUid: managerUid || null,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  if (coopId && (role === "manager" || role === "employee")) {
    await adminDb.collection("coops").doc(coopId).collection("members").doc(targetUid).set(
      {
        uid: targetUid,
        email,
        role,
        managerUid: role === "employee" ? managerUid || null : null,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  }

  return NextResponse.json({ ok: true, claims });
}
