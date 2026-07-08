import { NextRequest, NextResponse } from "next/server";
import { getBook } from "@/lib/books";

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "Missing bookId" }, { status: 400 });

  const book = await getBook(bookId);
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  // Production: verify Firebase session cookie, check user-library, then return signed Storage URL.
  if (!book.isFree) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  return NextResponse.json({ fileUrl: book.fileUrl, fileType: book.fileType });
}
