import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Final Book Project",
  description: "A Firebase + Next.js platform for reading and selling ebooks."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="dark">
      <body>{children}</body>
    </html>
  );
}
