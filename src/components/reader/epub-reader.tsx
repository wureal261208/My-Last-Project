"use client";

import { useEffect, useRef } from "react";
import ePub from "epubjs";

export default function EpubReader({ fileUrl, fontSize }: { fileUrl: string; fontSize: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const book = ePub(fileUrl);
    const rendition = book.renderTo(containerRef.current, {
      width: "100%",
      height: "78vh",
      spread: "none"
    });

    rendition.themes.default({
      body: {
        color: "#fafafa",
        background: "#18181b",
        "font-size": `${fontSize}px`,
        "line-height": "1.8"
      }
    });
    rendition.display();

    return () => {
      book.destroy();
    };
  }, [fileUrl, fontSize]);

  return <div ref={containerRef} className="overflow-hidden rounded-md border bg-card" />;
}
