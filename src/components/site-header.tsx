import Link from "next/link";
import { BookOpen, LayoutDashboard, Search, ShoppingCart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/catalog", label: "Catalog", icon: Search },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-5" />
          </span>
          Lumen Books
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {nav.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
