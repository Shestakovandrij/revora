"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { DOCUMENT_TYPES } from "@/lib/enums";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(5),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  city: z.string().min(1),
  companyName: z.string().optional(),
  businessType: z.string().default("OWNER_DRIVER"),
  experienceYears: z.coerce.number().min(0).default(0),
  description: z.string().optional(),
  europeTransport: z.boolean().default(false),
  vehicleType: z.string().default("VAN_LARGE"),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().default(2020),
  registrationNumber: z.string().min(1),
  loadCapacityKg: z.coerce.number().optional(),
  tailLift: z.boolean().default(false),
  areas: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  baseRate: z.coerce.number().default(0),
  perMileRate: z.coerce.number().default(0),
  perHourRate: z.coerce.number().default(0),
  minimumCharge: z.coerce.number().default(0),
});

export type RegisterResult = { ok: true } | { ok: false; error: string };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function registerCarrierAction(payload: unknown): Promise<RegisterResult> {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  const email = d.email.toLowerCase().trim();

  if (await prisma.user.findUnique({ where: { email } })) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const fullName = `${d.firstName} ${d.lastName}`.trim();
  const user = await prisma.user.create({
    data: { email, phone: d.phone, name: fullName, role: "CARRIER", passwordHash: await hashPassword(d.password) },
  });

  const slug = `${slugify(d.companyName || fullName)}-${slugify(d.city)}-${user.id.slice(-4)}`;
  const carrier = await prisma.carrier.create({
    data: {
      userId: user.id,
      companyName: d.companyName || null,
      businessType: d.businessType,
      city: d.city,
      slug,
      experienceYears: d.experienceYears,
      description: d.description || null,
      europeTransport: d.europeTransport,
      verificationStatus: "PENDING",
      isPublished: false,
    },
  });

  await prisma.vehicle.create({
    data: {
      carrierId: carrier.id,
      vehicleType: d.vehicleType,
      make: d.make,
      model: d.model,
      year: d.year,
      registrationNumber: d.registrationNumber,
      loadCapacityKg: d.loadCapacityKg ?? null,
      tailLift: d.tailLift,
    },
  });

  await prisma.pricingProfile.create({
    data: {
      carrierId: carrier.id,
      baseRate: d.baseRate,
      perMileRate: d.perMileRate,
      perHourRate: d.perHourRate,
      minimumCharge: d.minimumCharge,
    },
  });

  // Напрямки
  for (const name of d.areas) {
    const area = await prisma.area.findFirst({ where: { name } });
    if (area) await prisma.carrierArea.create({ data: { carrierId: carrier.id, areaId: area.id } });
  }
  // Послуги
  for (const code of d.services) {
    const svc = await prisma.serviceType.findUnique({ where: { code } });
    if (svc) await prisma.carrierService.create({ data: { carrierId: carrier.id, serviceId: svc.id } });
  }
  // Документи — створюємо записи зі статусом PENDING
  for (const type of DOCUMENT_TYPES) {
    if (type === "COMPANY_REGISTRATION" && !d.companyName) continue;
    await prisma.document.create({ data: { carrierId: carrier.id, type, status: "PENDING" } });
  }

  await createSession(user);
  return { ok: true };
}
