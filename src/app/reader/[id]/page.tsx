import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookReader } from "@/components/reader/book-reader";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/books";

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  return (
    <>
      <div className="border-b bg-background px-3 py-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/books/${book.id}`}>
            <ArrowLeft className="size-4" />
            {book.title}
          </Link>
        </Button>
      </div>
      <BookReader fileUrl={book.fileUrl} fileType={book.fileType} />
    </>
  );
}
