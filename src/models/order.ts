export type Order = {
  id: string;
  userId: string;
  items: Array<{ bookId: string; title: string; price: number }>;
  total: number;
  provider: "vnpay" | "stripe";
  status: "pending" | "paid" | "failed";
};
