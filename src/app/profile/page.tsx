import Link from "next/link";
import { Library } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { featuredBooks } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-semibold">Thư viện cá nhân</h1>
        <div className="mt-6 grid gap-3">
          {featuredBooks.slice(0, 2).map((book) => (
            <Card key={book.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Library className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-muted-foreground">Tiến trình đọc demo: 24%</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/reader/${book.id}`}>Đọc tiếp</Link>
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
