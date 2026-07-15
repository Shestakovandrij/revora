"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyReviewToken } from "@/lib/review-token";
import { recomputeCarrierAggregates } from "@/server/services/carrier-aggregates";

const schema = z.object({
  orderId: z.string().min(1),
  token: z.string().min(1),
  overall: z.coerce.number().min(1).max(5),
  punctuality: z.coerce.number().min(1).max(5).optional(),
  communication: z.coerce.number().min(1).max(5).optional(),
  quality: z.coerce.number().min(1).max(5).optional(),
  care: z.coerce.number().min(1).max(5).optional(),
  vehicleCondition: z.coerce.number().min(1).max(5).optional(),
  priceAccuracy: z.coerce.number().min(1).max(5).optional(),
  text: z.string().optional(),
});

export type ReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReviewAction(formData: FormData): Promise<ReviewResult> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, error: "Please rate at least the overall score." };
  const d = parsed.data;

  if (!verifyReviewToken(d.orderId, d.token)) return { ok: false, error: "Invalid or expired review link." };

  const order = await prisma.order.findUnique({ where: { id: d.orderId }, include: { review: true } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "COMPLETED") return { ok: false, error: "You can only review completed jobs." };
  if (order.review) return { ok: false, error: "This job has already been reviewed." };

  await prisma.review.create({
    data: {
      orderId: order.id,
      carrierId: order.carrierId,
      authorUserId: order.customerUserId ?? undefined,
      authorName: order.contactName,
      overall: d.overall,
      punctuality: d.punctuality,
      communication: d.communication,
      quality: d.quality,
      care: d.care,
      vehicleCondition: d.vehicleCondition,
      priceAccuracy: d.priceAccuracy,
      text: d.text || null,
      status: "PUBLISHED", // видимий одразу; адмін може приховати (пост-модерація)
    },
  });

  // Рейтинг оновлюється автоматично.
  await recomputeCarrierAggregates(order.carrierId);
  return { ok: true };
}
