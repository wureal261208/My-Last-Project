import type { Book } from "@/models/book";
import type { AppUser } from "@/models/user";
import type { Order } from "@/models/order";

export const featuredBooks: Book[] = [
  {
    id: "gutenberg-1342",
    gutenbergId: "1342",
    title: "Pride and Prejudice",
    authors: ["Jane Austen"],
    language: "en",
    subjects: ["Classic", "Romance"],
    description: "Một tác phẩm kinh điển dễ đọc, phù hợp để demo reader EPUB/PDF và metadata Gutenberg.",
    coverUrl: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    fileType: "epub",
    fileUrl: "https://www.gutenberg.org/ebooks/1342.epub3.images",
    price: 0,
    isFree: true,
    status: "published"
  },
  {
    id: "gutenberg-84",
    gutenbergId: "84",
    title: "Frankenstein",
    authors: ["Mary Wollstonecraft Shelley"],
    language: "en",
    subjects: ["Gothic", "Science Fiction"],
    description: "Sách miễn phí từ Project Gutenberg, hiển thị như một sản phẩm trong catalog.",
    coverUrl: "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
    fileType: "epub",
    fileUrl: "https://www.gutenberg.org/ebooks/84.epub3.images",
    price: 0,
    isFree: true,
    status: "published"
  },
  {
    id: "premium-1",
    title: "Thiết kế thói quen đọc sâu",
    authors: ["Lumen Editorial"],
    language: "vi",
    subjects: ["Kỹ năng", "Đọc sách"],
    description: "Một sách premium mẫu để demo thanh toán, thư viện cá nhân và bảo vệ file sách.",
    coverUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=800&auto=format&fit=crop",
    fileType: "pdf",
    price: 79000,
    isFree: false,
    status: "published",
    ownerId: "coop-demo"
  }
];

export const demoUsers: AppUser[] = [
  { uid: "admin-demo", email: "admin@lumen.vn", name: "Admin Demo", role: "admin", status: "active" },
  { uid: "coop-demo", email: "author@lumen.vn", name: "Co-op Publisher", role: "co-op", status: "active" },
  { uid: "user-demo", email: "reader@lumen.vn", name: "Bạn đọc", role: "user", status: "active" }
];

export const demoOrders: Order[] = [
  {
    id: "ord_1001",
    userId: "user-demo",
    items: [{ bookId: "premium-1", title: "Thiết kế thói quen đọc sâu", price: 79000 }],
    total: 79000,
    provider: "vnpay",
    status: "paid"
  }
];
