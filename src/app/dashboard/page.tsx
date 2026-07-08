import Link from "next/link";
import { BookOpen, Crown, History, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { featuredBooks } from "@/lib/mock-data";

export default function UserDashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">User Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Dành cho tài khoản Normal, VIP và Anonymous sau khi nâng cấp.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <UserRound className="size-5 text-muted-foreground" />
            <p className="mt-4 text-xl font-semibold">Normal</p>
            <p className="text-sm text-muted-foreground">Đọc sách miễn phí, mua sách lẻ.</p>
          </Card>
          <Card className="p-5">
            <Crown className="size-5 text-muted-foreground" />
            <p className="mt-4 text-xl font-semibold">VIP</p>
            <p className="text-sm text-muted-foreground">Mở khóa sách premium theo gói.</p>
          </Card>
          <Card className="p-5">
            <History className="size-5 text-muted-foreground" />
            <p className="mt-4 text-xl font-semibold">Reading progress</p>
            <p className="text-sm text-muted-foreground">Đồng bộ bookmark và tiến trình đọc.</p>
          </Card>
        </div>

        <div className="mt-6 grid gap-3">
          {featuredBooks.slice(0, 2).map((book) => (
            <Card key={book.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-sm text-muted-foreground">Đang đọc · 36%</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/reader/${book.id}`}>
                  <BookOpen className="size-4" />
                  Đọc tiếp
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
