import { UserPlus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminCoOpPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tạo tài khoản Co-op</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3">
              <Input placeholder="Tên tác giả / publisher" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Tên thương hiệu hoặc imprint" />
              <Button>
                <UserPlus className="size-4" />
                Tạo co-op
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
