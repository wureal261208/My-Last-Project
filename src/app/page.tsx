import Link from "next/link";
import { ArrowRight, BookMarked, LibraryBig, ShieldCheck } from "lucide-react";
import { BookCard } from "@/components/books/book-card";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBooks } from "@/lib/books";

export default async function HomePage() {
  const books = await getBooks();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b">
          <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-md border px-3 py-1 text-sm text-muted-foreground">
                Project Gutenberg metadata + marketplace
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
                Đọc, bán và quản lý sách điện tử trong một nền tảng.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Lumen Books hỗ trợ EPUB/PDF, Firebase Auth, Firestore, Storage, dashboard admin và workspace co-op cho publisher.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/catalog">
                    Khám phá sách
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/admin">Mở Admin Dashboard</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { icon: LibraryBig, title: "75k+ metadata", text: "Sẵn sàng import từ Gutenberg CSV." },
                { icon: BookMarked, title: "Reader đẹp", text: "Điều chỉnh font, theme, progress, bookmark." },
                { icon: ShieldCheck, title: "Role-based", text: "Admin, co-op, employee, VIP, normal, anonymous." }
              ].map((item) => (
                <Card key={item.title} className="flex gap-4 p-5">
                  <item.icon className="mt-1 size-6 text-muted-foreground" />
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Sách nổi bật</h2>
            <Button asChild variant="ghost">
              <Link href="/catalog">Xem tất cả</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
