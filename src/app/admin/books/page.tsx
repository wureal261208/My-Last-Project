import Link from "next/link";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { featuredBooks } from "@/lib/mock-data";

export default function AdminBooksPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Quản lý sách</h1>
          <Button>
            <Plus className="size-4" />
            Thêm sách
          </Button>
        </div>

        <div className="grid gap-3">
          {featuredBooks.map((book) => (
            <Card key={book.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{book.title}</h2>
                  <Badge>{book.status}</Badge>
                  <Badge>{book.isFree ? "free" : "paid"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {book.authors.join(", ")} · {book.language} · {book.fileType?.toUpperCase() || "NO FILE"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/reader/${book.id}`}>
                    <Upload className="size-4" />
                    Preview
                  </Link>
                </Button>
                <Button variant="outline" size="icon">
                  <Edit className="size-4" />
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
