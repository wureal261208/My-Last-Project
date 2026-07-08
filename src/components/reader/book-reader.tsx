"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Minus, Moon, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookFileType } from "@/models/book";

const EpubReader = dynamic(() => import("@/components/reader/epub-reader"), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-muted-foreground">Đang tải EPUB...</div>
});
const PdfReader = dynamic(() => import("@/components/reader/pdf-reader"), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-muted-foreground">Đang tải PDF...</div>
});

export function BookReader({ fileUrl, fileType }: { fileUrl?: string; fileType?: BookFileType }) {
  const [fontSize, setFontSize] = useState(19);
  const [isSepia, setIsSepia] = useState(false);
  const progress = useMemo(() => 36, []);

  return (
    <div className={isSepia ? "light" : "dark"}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" aria-label="Trang trước">
                <ChevronLeft className="size-4" />
              </Button>
              <Button size="icon" variant="outline" aria-label="Trang sau">
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="hidden min-w-40 items-center gap-2 md:flex">
              <div className="h-2 flex-1 rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => setFontSize((value) => Math.max(14, value - 1))}>
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm">{fontSize}</span>
              <Button size="icon" variant="outline" onClick={() => setFontSize((value) => Math.min(28, value + 1))}>
                <Plus className="size-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setIsSepia((value) => !value)}>
                {isSepia ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </Button>
              <Button size="icon" variant="outline">
                <Bookmark className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-3 py-6">
          {fileUrl && fileType === "epub" && <EpubReader fileUrl={fileUrl} fontSize={fontSize} />}
          {fileUrl && fileType === "pdf" && <PdfReader fileUrl={fileUrl} />}
          {!fileUrl && (
            <article className="mx-auto max-w-3xl rounded-md border bg-card p-6 leading-8">
              <h1 className="text-2xl font-semibold">Bản đọc demo</h1>
              <p className="mt-4 text-muted-foreground" style={{ fontSize }}>
                File sách thật sẽ được lấy qua signed URL sau khi server xác minh user đã mua sách hoặc sách miễn phí.
              </p>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
