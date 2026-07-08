import { Lock, Unlock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoUsers } from "@/lib/mock-data";

export default function AdminUsersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold">Quản lý người dùng</h1>
        <div className="mt-6 grid gap-3">
          {demoUsers.map((user) => (
            <Card key={user.uid} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{user.role}</Badge>
                <Button variant="outline" size="icon">
                  {user.status === "active" ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
