export type BookFileType = "epub" | "pdf";

export type Book = {
  id: string;
  gutenbergId?: string;
  title: string;
  authors: string[];
  language: string;
  subjects: string[];
  description: string;
  coverUrl: string;
  fileUrl?: string;
  fileType?: BookFileType;
  price: number;
  isFree: boolean;
  status: "draft" | "published";
  ownerId?: string;
};
