import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { AppRole } from "@/types/auth";

const staffRoles: AppRole[] = ["admin", "manager", "employee"];
const rentalStatuses = ["pending", "delivered", "received"] as const;

type RentalStatus = (typeof rentalStatuses)[number];

type RentalRecord = {
  id: string;
  bookId: string;
  title: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestedAt: string;
  deliveryDate: string;
  status: RentalStatus;
};

export async function GET(request: NextRequest) {
  const requester = await getRequester(request);
  if (!requester) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });

  const role = requester.role;
  const snapshot = staffRoles.includes(role)
    ? await adminDb.collection("rentals").orderBy("requestedAt", "desc").limit(100).get()
    : await adminDb.collection("rentals").where("userId", "==", requester.uid).orderBy("requestedAt", "desc").limit(50).get();

  return NextResponse.json({ rentals: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) });
}

export async function POST(request: NextRequest) {
  const requester = await getRequester(request);
  if (!requester) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });

  const body = await request.json();
  const books = Array.isArray(body.books) ? body.books : [];
  const rentalLimit = requester.accountType === "worm" ? 6 : 3;

  if (!books.length) return NextResponse.json({ error: "At least one book is required" }, { status: 400 });
  if (books.length > rentalLimit) return NextResponse.json({ error: `Rental limit is ${rentalLimit} books` }, { status: 400 });

  const batch = adminDb.batch();
  const requestedAt = new Date().toISOString();
  const rentals: RentalRecord[] = books.map((book: Record<string, unknown>) => {
    const docRef = adminDb.collection("rentals").doc();
    const rental = {
      id: docRef.id,
      bookId: String(book.bookId || book.id || ""),
      title: String(book.title || "Untitled book"),
      userId: requester.uid,
      userEmail: requester.email || "",
      userName: requester.name || requester.email || "Reader",
      requestedAt,
      deliveryDate: "",
      status: "pending" satisfies RentalStatus,
    };
    batch.set(docRef, rental);
    return rental;
  });

  if (rentals.some((rental) => !rental.bookId)) {
    return NextResponse.json({ error: "Each rental book needs a bookId" }, { status: 400 });
  }

  await batch.commit();
  return NextResponse.json({ rentals }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const requester = await getRequester(request);
  if (!requester) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  if (!staffRoles.includes(requester.role)) return NextResponse.json({ error: "Staff only" }, { status: 403 });

  const body = await request.json();
  const rentalId = String(body.id || "");
  const status = String(body.status || "") as RentalStatus;

  if (!rentalId || !rentalStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid rental id or status" }, { status: 400 });
  }

  const deliveryDate = status === "delivered" || status === "received"
    ? String(body.deliveryDate || new Date().toISOString().slice(0, 10))
    : "";

  await adminDb.collection("rentals").doc(rentalId).set(
    {
      status,
      deliveryDate,
      approvedBy: requester.name || requester.email || requester.uid,
      approvedByRole: requester.role,
      approvedAt: new Date().toISOString(),
      adminNotification: requester.role === "admin"
        ? null
        : `${requester.role} ${requester.email || requester.uid} updated rental ${rentalId} to ${status}.`,
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true });
}

async function getRequester(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  if (!idToken) return null;

  const token = await adminAuth.verifyIdToken(idToken);
  return {
    uid: token.uid,
    email: token.email,
    name: token.name,
    role: ((token.role as AppRole | undefined) || "anonymous") as AppRole,
    accountType: token.accountType === "worm" ? "worm" : "normal",
  };
}
