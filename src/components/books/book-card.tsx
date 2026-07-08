import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Book } from "@/models/book";

export function BookCard({ book }: { book: Book }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/4] bg-muted">
        <Image src={book.coverUrl} alt={book.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 220px" />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 min-h-12 font-semibold">{book.title}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">{book.authors.join(", ")}</p>
        </div>
        <div className="flex items-center justify-between">
          <Badge>{book.isFree ? "Miễn phí" : `${book.price.toLocaleString("vi-VN")}đ`}</Badge>
          <Button asChild size="sm" variant="outline">
            <Link href={`/books/${book.id}`}>Chi tiết</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
