"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { transitionOrder } from "@/server/services/orders";
import type { OrderStatus } from "@/lib/enums";

async function myCarrierId() {
  const session = await requireRole(["CARRIER"]);
  const carrier = await prisma.carrier.findUnique({ where: { userId: session.sub } });
  if (!carrier) throw new Error("No carrier profile");
  return carrier.id;
}

export async function transitionJobAction(formData: FormData) {
  const orderId = String(formData.get("orderId"));
  const toStatus = String(formData.get("toStatus")) as OrderStatus;
  const carrierId = await myCarrierId();
  await transitionOrder({ orderId, toStatus, byRole: "CARRIER", carrierId });
  revalidatePath("/carrier/jobs");
  revalidatePath("/carrier");
}

const PRICING_FIELDS = [
  "baseRate", "perMileRate", "perHourRate", "minimumCharge", "helperRate",
  "floorSurcharge", "noLiftSurcharge", "heavyItemSurcharge", "bulkyItemSurcharge",
  "packingSurcharge", "assemblySurcharge", "urgencySurcharge", "sameDaySurcharge",
  "eveningNightSurcharge", "weekendHolidaySurcharge", "internationalBase",
  "tollsFlat", "parkingFlat", "waitingPerHour", "extraStopRate",
] as const;

export async function updatePricingAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const data: Record<string, number> = {};
  for (const f of PRICING_FIELDS) {
    const raw = formData.get(f);
    if (raw != null && String(raw).trim() !== "") data[f] = Number(raw);
  }
  await prisma.pricingProfile.upsert({
    where: { carrierId },
    update: data,
    create: { carrierId, ...data },
  });
  revalidatePath("/carrier/pricing");
}

export async function updateProfileAction(formData: FormData) {
  const carrierId = await myCarrierId();
  await prisma.carrier.update({
    where: { id: carrierId },
    data: {
      companyName: String(formData.get("companyName") || "") || null,
      city: String(formData.get("city") || ""),
      experienceYears: Number(formData.get("experienceYears") || 0),
      description: String(formData.get("description") || "") || null,
      europeTransport: formData.get("europeTransport") === "on",
    },
  });
  revalidatePath("/carrier/profile");
}

export async function respondReviewAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const reviewId = String(formData.get("reviewId"));
  const response = String(formData.get("response") || "").trim();
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.carrierId !== carrierId) return;
  await prisma.review.update({
    where: { id: reviewId },
    data: { carrierResponse: response || null, carrierRespondedAt: response ? new Date() : null },
  });
  revalidatePath("/carrier/reviews");
}

export async function toggleAvailabilityAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const dateStr = String(formData.get("date"));
  if (!dateStr) return;
  const date = new Date(dateStr);
  const existing = await prisma.availability.findFirst({ where: { carrierId, date } });
  if (existing) {
    await prisma.availability.update({ where: { id: existing.id }, data: { isBlocked: !existing.isBlocked } });
  } else {
    await prisma.availability.create({ data: { carrierId, date, isBlocked: true } });
  }
  revalidatePath("/carrier/calendar");
}
