import Link from "next/link";
import { BookPlus, BriefcaseBusiness, ChartNoAxesCombined, UsersRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { featuredBooks } from "@/lib/mock-data";

export default function CoOpDashboardPage() {
  const ownedBooks = featuredBooks.filter((book) => book.ownerId === "coop-demo");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold">Co-op Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Không gian cho Co-op Admin quản lý sách, nhân viên và doanh thu của publisher.</p>
          </div>
          <Button>
            <BookPlus className="size-4" />
            Upload sách
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <BriefcaseBusiness className="size-5 text-muted-foreground" />
            <p className="mt-4 text-2xl font-semibold">{ownedBooks.length}</p>
            <p className="text-sm text-muted-foreground">Sách đang quản lý</p>
          </Card>
          <Card className="p-5">
            <UsersRound className="size-5 text-muted-foreground" />
            <p className="mt-4 text-2xl font-semibold">2</p>
            <p className="text-sm text-muted-foreground">Manager / Employee</p>
          </Card>
          <Card className="p-5">
            <ChartNoAxesCombined className="size-5 text-muted-foreground" />
            <p className="mt-4 text-2xl font-semibold">79.000đ</p>
            <p className="text-sm text-muted-foreground">Doanh thu demo</p>
          </Card>
        </div>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/admin/books">Xem danh sách sách</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
