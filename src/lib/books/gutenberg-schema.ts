export type GutenbergBook = {
  id: string;
  gutenbergId: string;
  title: string;
  authors: string[];
  subjects: string[];
  language: string;
  coverUrl?: string;
  epubUrl?: string;
  pdfUrl?: string;
  source: "kaggle-gutenberg";
  status: "draft" | "published";
  importedAt: string;
};

export const booksCollection = "books";
