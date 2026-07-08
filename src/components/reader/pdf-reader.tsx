"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfReader({ fileUrl }: { fileUrl: string }) {
  const [pages, setPages] = useState(0);

  return (
    <div className="grid justify-center gap-6">
      <Document file={fileUrl} onLoadSuccess={({ numPages }) => setPages(numPages)}>
        {Array.from({ length: pages }, (_, index) => (
          <Page key={index} pageNumber={index + 1} className="overflow-hidden rounded-md" />
        ))}
      </Document>
    </div>
  );
}
