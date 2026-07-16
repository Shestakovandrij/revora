"use server";

import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recomputeCarrierAggregates } from "@/server/services/carrier-aggregates";
import { transitionOrder } from "@/server/services/orders";
import type { OrderStatus } from "@/lib/enums";

async function myCarrierId() {
  const session = await requireRole(["CARRIER"]);
  const carrier = await prisma.carrier.findUnique({ where: { userId: session.sub } });
  if (!carrier) throw new Error("No carrier profile");
  return carrier.id;
}

async function assertVehicleOwner(vehicleId: string, carrierId: string) {
  const v = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { carrierId: true } });
  if (!v || v.carrierId !== carrierId) throw new Error("Forbidden");
}

const numOrNull = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v != null && String(v).trim() !== "" && !Number.isNaN(Number(v)) ? Number(v) : null;
};

/** Створити або оновити авто перевізника. */
export async function saveVehicleAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const id = String(formData.get("id") || "");
  const data = {
    vehicleType: String(formData.get("vehicleType") || "VAN_LARGE"),
    make: String(formData.get("make") || "").trim(),
    model: String(formData.get("model") || "").trim(),
    year: numOrNull(formData, "year") ?? 2020,
    registrationNumber: String(formData.get("registrationNumber") || "").trim(),
    bodyType: String(formData.get("bodyType") || "") || null,
    loadCapacityKg: numOrNull(formData, "loadCapacityKg"),
    internalLengthCm: numOrNull(formData, "internalLengthCm"),
    internalWidthCm: numOrNull(formData, "internalWidthCm"),
    internalHeightCm: numOrNull(formData, "internalHeightCm"),
    volumeM3: numOrNull(formData, "volumeM3"),
    tailLift: formData.get("tailLift") === "on",
    isActive: formData.get("isActive") === "on",
  };
  if (!data.make || !data.model || !data.registrationNumber) return;

  if (id) {
    await assertVehicleOwner(id, carrierId);
    await prisma.vehicle.update({ where: { id }, data });
  } else {
    await prisma.vehicle.create({ data: { carrierId, ...data } });
  }
  await recomputeCarrierAggregates(carrierId);
  revalidatePath("/carrier/vehicles");
  revalidatePath("/catalog");
}

/** Видалити авто. */
export async function deleteVehicleAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const id = String(formData.get("id"));
  await assertVehicleOwner(id, carrierId);
  await prisma.vehicle.delete({ where: { id } });
  await recomputeCarrierAggregates(carrierId);
  revalidatePath("/carrier/vehicles");
  revalidatePath("/catalog");
}

/** Завантажити фото авто (публічний диск: public/uploads/vehicles/<id>). */
export async function uploadVehiclePhotoAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const vehicleId = String(formData.get("vehicleId"));
  await assertVehicleOwner(vehicleId, carrierId);

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return;
  if (file.size > 6 * 1024 * 1024) throw new Error("Photo must be under 6MB");
  const okTypes: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = okTypes[file.type];
  if (!ext) throw new Error("Only JPG, PNG or WEBP images are allowed");

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "vehicles", vehicleId);
  await mkdir(dir, { recursive: true });
  const fname = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  await writeFile(path.join(dir, fname), bytes);

  const count = await prisma.vehiclePhoto.count({ where: { vehicleId } });
  await prisma.vehiclePhoto.create({
    data: { vehicleId, url: `/uploads/vehicles/${vehicleId}/${fname}`, type: "side", sortOrder: count },
  });
  await recomputeCarrierAggregates(carrierId);
  revalidatePath("/carrier/vehicles");
  revalidatePath("/catalog");
}

/** Видалити фото авто. */
export async function deleteVehiclePhotoAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const photoId = String(formData.get("photoId"));
  const photo = await prisma.vehiclePhoto.findUnique({
    where: { id: photoId },
    include: { vehicle: { select: { carrierId: true } } },
  });
  if (!photo || photo.vehicle.carrierId !== carrierId) return;
  await prisma.vehiclePhoto.delete({ where: { id: photoId } });
  // best-effort прибрати файл з диску
  if (photo.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", photo.url)).catch(() => {});
  }
  await recomputeCarrierAggregates(carrierId);
  revalidatePath("/carrier/vehicles");
  revalidatePath("/catalog");
}

/** Зробити фото головним (показується першим на картці). */
export async function setPrimaryPhotoAction(formData: FormData) {
  const carrierId = await myCarrierId();
  const photoId = String(formData.get("photoId"));
  const photo = await prisma.vehiclePhoto.findUnique({
    where: { id: photoId },
    include: { vehicle: { select: { carrierId: true, id: true } } },
  });
  if (!photo || photo.vehicle.carrierId !== carrierId) return;
  const photos = await prisma.vehiclePhoto.findMany({
    where: { vehicleId: photo.vehicle.id },
    orderBy: { sortOrder: "asc" },
  });
  let i = 1;
  for (const p of photos) {
    await prisma.vehiclePhoto.update({ where: { id: p.id }, data: { sortOrder: p.id === photoId ? 0 : i++ } });
  }
  revalidatePath("/carrier/vehicles");
  revalidatePath("/catalog");
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
  // Очікуємо локальний календарний день YYYY-MM-DD; зберігаємо як UTC-північ цього дня.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const existing = await prisma.availability.findFirst({ where: { carrierId, date } });
  if (existing) {
    await prisma.availability.update({ where: { id: existing.id }, data: { isBlocked: !existing.isBlocked } });
  } else {
    await prisma.availability.create({ data: { carrierId, date, isBlocked: true } });
  }
  revalidatePath("/carrier/calendar");
}
