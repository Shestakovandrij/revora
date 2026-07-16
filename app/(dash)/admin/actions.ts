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

const num = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v != null && String(v).trim() !== "" && !Number.isNaN(Number(v)) ? Number(v) : null;
};

/** Адмін редагує інформацію про водія (профіль перевізника + ім'я/телефон користувача). */
export async function adminUpdateCarrierAction(formData: FormData) {
  await requireRole(["ADMIN", "MODERATOR"]);
  const carrierId = String(formData.get("carrierId"));
  const carrier = await prisma.carrier.findUnique({ where: { id: carrierId }, select: { userId: true } });
  if (!carrier) return;

  await prisma.carrier.update({
    where: { id: carrierId },
    data: {
      companyName: String(formData.get("companyName") || "") || null,
      city: String(formData.get("city") || ""),
      businessType: String(formData.get("businessType") || "OWNER_DRIVER"),
      experienceYears: num(formData, "experienceYears") ?? 0,
      description: String(formData.get("description") || "") || null,
      europeTransport: formData.get("europeTransport") === "on",
    },
  });
  await prisma.user.update({
    where: { id: carrier.userId },
    data: {
      name: String(formData.get("name") || "") || null,
      phone: String(formData.get("phone") || "") || null,
    },
  });
  await recomputeCarrierAggregates(carrierId);
  revalidatePath(`/admin/carriers/${carrierId}`);
  revalidatePath("/admin/carriers");
  revalidatePath("/catalog");
}

/** Адмін створює/оновлює авто водія. */
export async function adminSaveVehicleAction(formData: FormData) {
  await requireRole(["ADMIN", "MODERATOR"]);
  const carrierId = String(formData.get("carrierId"));
  const id = String(formData.get("id") || "");
  const data = {
    vehicleType: String(formData.get("vehicleType") || "VAN_LARGE"),
    make: String(formData.get("make") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    year: num(formData, "year") ?? 2020,
    registrationNumber: String(formData.get("registrationNumber") || "").trim(),
    bodyType: String(formData.get("bodyType") || "") || null,
    loadCapacityKg: num(formData, "loadCapacityKg"),
    volumeM3: num(formData, "volumeM3"),
    tailLift: formData.get("tailLift") === "on",
    isActive: formData.get("isActive") === "on",
  };
  if (!data.make || !data.model || !data.registrationNumber) return;
  if (id) await prisma.vehicle.update({ where: { id }, data });
  else await prisma.vehicle.create({ data: { carrierId, ...data } });
  await recomputeCarrierAggregates(carrierId);
  revalidatePath(`/admin/carriers/${carrierId}`);
  revalidatePath("/catalog");
}

/** Адмін видаляє авто водія. */
export async function adminDeleteVehicleAction(formData: FormData) {
  await requireRole(["ADMIN", "MODERATOR"]);
  const id = String(formData.get("id"));
  const carrierId = String(formData.get("carrierId"));
  await prisma.vehicle.delete({ where: { id } });
  await recomputeCarrierAggregates(carrierId);
  revalidatePath(`/admin/carriers/${carrierId}`);
  revalidatePath("/catalog");
}
