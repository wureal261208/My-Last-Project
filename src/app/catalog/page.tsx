import { Search } from "lucide-react";
import { BookCard } from "@/components/books/book-card";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { getBooks } from "@/lib/books";

export default async function CatalogPage() {
  const books = await getBooks();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_280px]">
          <div>
            <h1 className="text-3xl font-semibold">Catalog</h1>
            <p className="mt-2 text-muted-foreground">Tìm kiếm, lọc và mua sách EPUB/PDF.</p>
          </div>
          <label className="relative block">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Tìm theo tên sách, tác giả..." />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </main>
    </>
  );
}
