"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { resolveDistance } from "@/lib/maps";
import { computeEstimate, type PricingInput } from "@/lib/pricing";
import { isInternational } from "@/lib/uk-geo";
import type { PriceBreakdown } from "@/lib/pricing";

const schema = z.object({
  carrierSlug: z.string().min(1),
  serviceCode: z.string().min(1),
  pickupAddress: z.string().min(2),
  deliveryAddress: z.string().min(2),
  date: z.string().min(1),
  preferredTime: z.string().optional(),
  propertyType: z.string().optional(),
  pickupFloor: z.coerce.number().min(0).default(0),
  deliveryFloor: z.coerce.number().min(0).default(0),
  liftAvailable: z.coerce.boolean().default(false),
  vehicleType: z.string().optional(),
  numberOfHelpers: z.coerce.number().min(0).default(0),
  itemsList: z.string().optional(),
  packing: z.coerce.boolean().default(false),
  assembly: z.coerce.boolean().default(false),
  sameDay: z.coerce.boolean().default(false),
  contactName: z.string().min(2),
  contactPhone: z.string().min(5),
  contactEmail: z.string().email(),
  additionalNotes: z.string().optional(),
});

export type BookingResult =
  | { ok: true; reference: string; total: number; breakdown: PriceBreakdown; carrierName: string }
  | { ok: false; error: string };

function makeReference() {
  const rand = Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, "0");
  return `RM-${rand}`;
}

export async function createBookingAction(formData: FormData): Promise<BookingResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  const carrier = await prisma.carrier.findFirst({
    where: { slug: d.carrierSlug, isPublished: true },
    include: { pricing: true, user: { select: { name: true } } },
  });
  if (!carrier || !carrier.pricing) {
    return { ok: false, error: "This carrier is not available for booking." };
  }

  const { distanceMiles } = await resolveDistance(d.pickupAddress, d.deliveryAddress);
  const international = isInternational(d.pickupAddress, d.deliveryAddress);

  const input: PricingInput = {
    distanceMiles,
    numberOfHelpers: d.numberOfHelpers,
    pickupFloor: d.pickupFloor,
    deliveryFloor: d.deliveryFloor,
    liftAvailable: d.liftAvailable,
    packing: d.packing,
    assembly: d.assembly,
    sameDay: d.sameDay,
    international,
  };
  const breakdown = computeEstimate(input, carrier.pricing);

  const session = await getSession();
  const reference = makeReference();

  const order = await prisma.order.create({
    data: {
      reference,
      carrierId: carrier.id,
      customerUserId: session?.role === "CUSTOMER" ? session.sub : null,
      contactName: d.contactName,
      contactPhone: d.contactPhone,
      contactEmail: d.contactEmail,
      serviceCode: d.serviceCode,
      pickupAddress: d.pickupAddress,
      deliveryAddress: d.deliveryAddress,
      distanceMiles,
      date: new Date(d.date),
      preferredTime: d.preferredTime || null,
      propertyType: d.propertyType || null,
      pickupFloor: d.pickupFloor,
      deliveryFloor: d.deliveryFloor,
      liftAvailable: d.liftAvailable,
      requiredVehicleType: d.vehicleType || null,
      numberOfHelpers: d.numberOfHelpers,
      itemsList: d.itemsList ? { text: d.itemsList } : undefined,
      services: { packing: d.packing, assembly: d.assembly, sameDay: d.sameDay },
      additionalNotes: d.additionalNotes || null,
      estimatedPrice: breakdown.total,
      priceBreakdown: breakdown as unknown as object,
      status: "NEW",
      statusHistory: {
        create: { toStatus: "NEW", changedByRole: session?.role ?? "CUSTOMER", note: "Booking request created" },
      },
    },
  });

  // Транзакційний лист (лог; реальна відправка — окремо через SMTP).
  await prisma.emailLog.create({
    data: { to: carrier.user.name ?? "carrier", template: "new_booking", orderId: order.id, status: "queued" },
  });

  return {
    ok: true,
    reference,
    total: breakdown.total,
    breakdown,
    carrierName: carrier.companyName || carrier.user.name || "the carrier",
  };
}
