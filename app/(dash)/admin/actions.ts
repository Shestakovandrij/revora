"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recomputeCarrierAggregates } from "@/server/services/carrier-aggregates";
import { transitionOrder } from "@/server/services/orders";
import { VERIFICATION_STATUSES, type OrderStatus } from "@/lib/enums";

export async function verifyCarrierAction(formData: FormData) {
  await requireRole(["ADMIN", "MODERATOR"]);
  const carrierId = String(formData.get("carrierId"));
  const decision = String(formData.get("decision"));
  if (!VERIFICATION_STATUSES.includes(decision as never)) return;

  const isPublished = decision === "APPROVED";
  await prisma.carrier.update({
    where: { id: carrierId },
    data: { verificationStatus: decision, isPublished },
  });
  // На схваленні позначаємо документи як Verified (демо-спрощення).
  if (isPublished) {
    await prisma.document.updateMany({
      where: { carrierId, status: "PENDING" },
      data: { status: "VERIFIED", verifiedAt: new Date() },
    });
  }
  await recomputeCarrierAggregates(carrierId);
  revalidatePath("/admin/carriers");
  revalidatePath("/admin");
}

export async function moderateReviewAction(formData: FormData) {
  await requireRole(["ADMIN", "MODERATOR"]);
  const reviewId = String(formData.get("reviewId"));
  const status = String(formData.get("status")); // PUBLISHED | HIDDEN | REJECTED
  const review = await prisma.review.update({ where: { id: reviewId }, data: { status } });
  await recomputeCarrierAggregates(review.carrierId);
  revalidatePath("/admin/reviews");
}

export async function adminCancelOrderAction(formData: FormData) {
  const session = await requireRole(["ADMIN", "MODERATOR"]);
  const orderId = String(formData.get("orderId"));
  await transitionOrder({ orderId, toStatus: "CANCELLED", byRole: session.role, note: "Cancelled by admin" });
  revalidatePath("/admin/orders");
}

export async function toggleFeaturedAction(formData: FormData) {
  await requireRole(["ADMIN", "MODERATOR"]);
  const carrierId = String(formData.get("carrierId"));
  const carrier = await prisma.carrier.findUnique({ where: { id: carrierId } });
  if (!carrier) return;
  await prisma.carrier.update({ where: { id: carrierId }, data: { isFeatured: !carrier.isFeatured } });
  await recomputeCarrierAggregates(carrierId);
  revalidatePath("/admin/carriers");
}
