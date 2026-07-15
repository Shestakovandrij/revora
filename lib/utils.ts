import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Об'єднує класи Tailwind із коректним вирішенням конфліктів. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Форматує ціну як орієнтовну оцінку (не рахунок). */
export function formatPrice(value: number | null | undefined, currency = "GBP") {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Скорочене ім'я для публічного показу: "John Doe" -> "John D." */
export function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
