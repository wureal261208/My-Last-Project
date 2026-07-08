import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBook } from "@/lib/books";

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 md:grid-cols-[320px_1fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4]">
            <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="320px" />
          </div>
        </Card>

        <section className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {book.subjects.map((subject) => (
              <Badge key={subject}>{subject}</Badge>
            ))}
          </div>
          <div>
            <h1 className="text-4xl font-semibold">{book.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{book.authors.join(", ")}</p>
          </div>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">{book.description}</p>
          <p className="text-2xl font-semibold">{book.isFree ? "Miễn phí" : `${book.price.toLocaleString("vi-VN")}đ`}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/reader/${book.id}`}>
                <BookOpen className="size-4" />
                Đọc ngay
              </Link>
            </Button>
            {!book.isFree && (
              <Button size="lg" variant="outline">
                <ShoppingCart className="size-4" />
                Thêm vào giỏ
              </Button>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
