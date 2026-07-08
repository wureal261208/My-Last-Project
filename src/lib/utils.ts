import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper chuẩn shadcn/ui để merge class Tailwind an toàn.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
