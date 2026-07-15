import "server-only";
import { createHmac } from "node:crypto";

const secret = process.env.AUTH_SECRET || "dev-secret-change-me-in-production";

/** Детермінований підписаний токен для персонального посилання на відгук (не зберігаємо в БД). */
export function makeReviewToken(orderId: string): string {
  return createHmac("sha256", secret).update(`review:${orderId}`).digest("hex").slice(0, 24);
}

export function verifyReviewToken(orderId: string, token: string): boolean {
  const expected = makeReviewToken(orderId);
  return token.length === expected.length && token === expected;
}
