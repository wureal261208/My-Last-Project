import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-8 text-center">
          <ShoppingCart className="mx-auto size-10 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-semibold">Giỏ hàng</h1>
          <p className="mt-2 text-muted-foreground">Luồng thanh toán VNPay/Stripe sẽ được nối vào đây.</p>
          <Button asChild className="mt-5">
            <Link href="/catalog">Chọn sách</Link>
          </Button>
        </Card>
      </main>
    </>
  );
}
