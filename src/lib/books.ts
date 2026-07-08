import { featuredBooks } from "@/lib/mock-data";

export async function getBooks() {
  // Demo-first: khi nối Firebase thật, thay bằng query Firestore collection("books").
  return featuredBooks;
}

export async function getBook(id: string) {
  const books = await getBooks();
  return books.find((book) => book.id === id) ?? null;
}
