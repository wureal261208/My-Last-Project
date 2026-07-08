import Link from "next/link";
import { BookOpen, DollarSign, ShieldCheck, UsersRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoOrders, demoUsers, featuredBooks } from "@/lib/mock-data";

export default function AdminPage() {
  const revenue = demoOrders.reduce((sum, order) => sum + order.total, 0);
  const stats = [
    { label: "Sách", value: featuredBooks.length, icon: BookOpen },
    { label: "Người dùng", value: demoUsers.length, icon: UsersRound },
    { label: "Doanh thu", value: `${revenue.toLocaleString("vi-VN")}đ`, icon: DollarSign },
    { label: "Co-op", value: demoUsers.filter((user) => user.role === "co-op").length, icon: ShieldCheck }
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Quản lý sách, user, co-op, đơn hàng và doanh thu.</p>
          </div>
          <Button asChild>
            <Link href="/admin/books">Quản lý sách</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5">
              <stat.icon className="size-5 text-muted-foreground" />
              <p className="mt-4 text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
