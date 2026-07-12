import type { Metadata } from "next";
import "./globals.css";
import "@/legacy/index.css";
import "@/legacy/App.css";

export const metadata: Metadata = {
  title: "The Final Book Project",
  description: "A Firebase + Next.js online library for reading and renting books."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
