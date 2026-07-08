import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { demoOrders } from "@/lib/mock-data";

export default function AdminOrdersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold">Đơn hàng và doanh thu</h1>
        <div className="mt-6 grid gap-3">
          {demoOrders.map((order) => (
            <Card key={order.id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.items.map((item) => item.title).join(", ")}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{order.provider}</Badge>
                <Badge>{order.status}</Badge>
                <p className="font-semibold">{order.total.toLocaleString("vi-VN")}đ</p>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
