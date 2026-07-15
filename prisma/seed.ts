import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SERVICE_TYPES, DOCUMENT_TYPES, type VehicleType } from "../lib/enums";
import {
  computeProfileCompleteness,
  computeRankingScore,
} from "../server/services/ranking";

const prisma = new PrismaClient();
const PASSWORD = "password123";
let orderCounter = 1000;
const nextRef = () => `RM-${(++orderCounter).toString(36).toUpperCase()}`;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const AREAS: { name: string; type: string; country: string; popular?: boolean }[] = [
  { name: "London", type: "CITY", country: "UK", popular: true },
  { name: "Manchester", type: "CITY", country: "UK", popular: true },
  { name: "Birmingham", type: "CITY", country: "UK", popular: true },
  { name: "Leeds", type: "CITY", country: "UK" },
  { name: "Bristol", type: "CITY", country: "UK" },
  { name: "Glasgow", type: "CITY", country: "UK" },
  { name: "England", type: "REGION", country: "UK", popular: true },
  { name: "Scotland", type: "REGION", country: "UK", popular: true },
  { name: "Wales", type: "REGION", country: "UK", popular: true },
  { name: "Northern Ireland", type: "REGION", country: "UK", popular: true },
  { name: "France", type: "COUNTRY", country: "FR", popular: true },
  { name: "Germany", type: "COUNTRY", country: "DE", popular: true },
  { name: "Spain", type: "COUNTRY", country: "ES" },
  { name: "Italy", type: "COUNTRY", country: "IT" },
  { name: "Netherlands", type: "COUNTRY", country: "NL" },
  { name: "Poland", type: "COUNTRY", country: "PL", popular: true },
];

type CarrierSeed = {
  name: string;
  company: string;
  city: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  experience: number;
  europe: boolean;
  areas: string[];
  services: string[];
  featured?: boolean;
  reviews: { rating: number; text: string; author: string }[];
  completedJobs: number;
  cancelledJobs?: number;
  status?: string; // verificationStatus
};

// Різні стани cold start: нові (0 відгуків) → з кількома → зрілі.
const CARRIERS: CarrierSeed[] = [
  {
    name: "James Carter", company: "Carter Man & Van", city: "London",
    vehicleType: "LUTON", make: "Mercedes-Benz", model: "Sprinter Luton",
    experience: 8, europe: false, areas: ["London", "England"],
    services: ["HOUSE_REMOVALS", "FLAT_REMOVALS", "FURNITURE_DELIVERY", "PACKING_MOVING"],
    featured: true, completedJobs: 214,
    reviews: [
      { rating: 5, text: "Punctual, careful and friendly. Highly recommend!", author: "Emma W." },
      { rating: 5, text: "Moved my flat in a few hours, no fuss.", author: "Daniel R." },
      { rating: 4, text: "Great service, slightly late but kept me posted.", author: "Sara L." },
      { rating: 5, text: "Best movers I've used in London.", author: "Tom H." },
    ],
  },
  {
    name: "Marek Nowak", company: "EuroMove Logistics", city: "London",
    vehicleType: "TRUCK_7_5T", make: "Iveco", model: "Eurocargo",
    experience: 12, europe: true, areas: ["London", "England", "France", "Germany", "Poland"],
    services: ["EUROPEAN_TRANSPORT", "LONG_DISTANCE_MOVES", "OFFICE_RELOCATIONS"],
    featured: true, completedJobs: 156,
    reviews: [
      { rating: 5, text: "UK to Poland move went perfectly. Great communication.", author: "Anna K." },
      { rating: 5, text: "Reliable for European transport.", author: "Piotr M." },
      { rating: 4, text: "Good value for a long distance move.", author: "Chris B." },
    ],
  },
  {
    name: "David Owen", company: "Swift Deliveries", city: "Manchester",
    vehicleType: "VAN_LARGE", make: "Ford", model: "Transit",
    experience: 5, europe: false, areas: ["Manchester", "Leeds", "England"],
    services: ["FURNITURE_DELIVERY", "SINGLE_ITEM_DELIVERY", "SAME_DAY_DELIVERIES", "BUSINESS_DELIVERIES"],
    completedJobs: 47,
    reviews: [
      { rating: 5, text: "Same-day sofa delivery, spot on.", author: "Rachel P." },
      { rating: 4, text: "Quick and professional.", author: "Mike D." },
    ],
  },
  {
    name: "Sophie Bennett", company: "Bennett Removals", city: "Bristol",
    vehicleType: "VAN_MEDIUM", make: "Volkswagen", model: "Transporter",
    experience: 3, europe: false, areas: ["Bristol", "Wales", "England"],
    services: ["STUDENT_MOVES", "FLAT_REMOVALS", "FURNITURE_DELIVERY"],
    completedJobs: 8,
    reviews: [{ rating: 5, text: "Helped with my student move, very affordable.", author: "Olivia S." }],
  },
  // --- НОВІ перевізники: 0 відгуків, 0 виконаних (демонстрація cold start) ---
  {
    name: "Ryan Walsh", company: "Walsh Transport", city: "Leeds",
    vehicleType: "VAN_LARGE", make: "Renault", model: "Master",
    experience: 6, europe: false, areas: ["Leeds", "Manchester", "England"],
    services: ["HOUSE_REMOVALS", "FURNITURE_DELIVERY", "WASTE_REMOVAL"],
    completedJobs: 0, reviews: [],
  },
  {
    name: "Lucas Meyer", company: "Meyer EU Transport", city: "London",
    vehicleType: "TRUCK", make: "MAN", model: "TGL",
    experience: 10, europe: true, areas: ["London", "France", "Germany", "Netherlands", "Italy"],
    services: ["EUROPEAN_TRANSPORT", "LONG_DISTANCE_MOVES", "OFFICE_RELOCATIONS"],
    completedJobs: 0, reviews: [],
  },
  {
    name: "Grace Murphy", company: "", city: "Glasgow",
    vehicleType: "VAN_MEDIUM", make: "Peugeot", model: "Boxer",
    experience: 2, europe: false, areas: ["Glasgow", "Scotland"],
    services: ["SINGLE_ITEM_DELIVERY", "STUDENT_MOVES", "FLAT_REMOVALS"],
    completedJobs: 0, reviews: [],
  },
  {
    name: "Ahmed Hassan", company: "City Movers", city: "Birmingham",
    vehicleType: "LUTON", make: "Vauxhall", model: "Movano Luton",
    experience: 4, europe: false, areas: ["Birmingham", "England"],
    services: ["HOUSE_REMOVALS", "OFFICE_RELOCATIONS", "STORAGE_COLLECTION", "PACKING_MOVING"],
    completedJobs: 0, reviews: [],
  },
];

// Перевізники на модерації (для демо адмінки) — не публікуються.
const PENDING_CARRIERS: CarrierSeed[] = [
  {
    name: "Oliver Grant", company: "Grant & Sons Removals", city: "London",
    vehicleType: "LUTON", make: "Mercedes-Benz", model: "Atego",
    experience: 15, europe: false, areas: ["London", "England"],
    services: ["HOUSE_REMOVALS", "OFFICE_RELOCATIONS"],
    completedJobs: 0, reviews: [], status: "PENDING",
  },
];

function defaultPricing(vt: VehicleType) {
  const byType: Record<string, Partial<Record<string, number>>> = {
    VAN_SMALL: { base: 30, mile: 1.1, hour: 28 },
    VAN_MEDIUM: { base: 40, mile: 1.3, hour: 32 },
    VAN_LARGE: { base: 50, mile: 1.5, hour: 38 },
    LUTON: { base: 65, mile: 1.8, hour: 45 },
    TRUCK_7_5T: { base: 90, mile: 2.2, hour: 55 },
    TRUCK: { base: 120, mile: 2.6, hour: 65 },
  };
  const p = byType[vt] ?? { base: 45, mile: 1.4, hour: 35 };
  return {
    baseRate: p.base!,
    perMileRate: p.mile!,
    perHourRate: p.hour!,
    minimumCharge: (p.base ?? 45) + 15,
    helperRate: 20,
    floorSurcharge: 8,
    noLiftSurcharge: 15,
    heavyItemSurcharge: 25,
    bulkyItemSurcharge: 18,
    packingSurcharge: 40,
    assemblySurcharge: 35,
    urgencySurcharge: 30,
    sameDaySurcharge: 45,
    eveningNightSurcharge: 25,
    weekendHolidaySurcharge: 20,
    internationalBase: 250,
    tollsFlat: 40,
    parkingFlat: 15,
    waitingPerHour: 20,
    extraStopRate: 20,
  };
}

async function main() {
  console.log("🌱 Seeding REVORA MOVE...");

  // Чистимо (у порядку залежностей)
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderPhoto.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.carrierArea.deleteMany();
  await prisma.carrierService.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.document.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.pricingProfile.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.area.deleteMany();
  await prisma.serviceType.deleteMany();

  // Довідники
  const areaMap = new Map<string, string>();
  for (const a of AREAS) {
    const created = await prisma.area.create({
      data: { name: a.name, slug: slugify(a.name), type: a.type, country: a.country, isPopular: !!a.popular },
    });
    areaMap.set(a.name, created.id);
  }
  const serviceMap = new Map<string, string>();
  for (const s of SERVICE_TYPES) {
    const created = await prisma.serviceType.create({ data: { code: s.code, name: s.name } });
    serviceMap.set(s.code, created.id);
  }

  const hash = await bcrypt.hash(PASSWORD, 10);

  // Адмін + демо-клієнт
  await prisma.user.create({
    data: { email: "admin@revora.test", passwordHash: hash, role: "ADMIN", name: "Admin" },
  });
  await prisma.user.create({
    data: { email: "customer@revora.test", passwordHash: hash, role: "CUSTOMER", name: "Test Customer", phone: "+44 20 7000 0000" },
  });

  async function createCarrier(c: CarrierSeed, idx: number, published: boolean) {
    const status = c.status ?? (published ? "APPROVED" : "PENDING");
    const isPublished = status === "APPROVED";
    const email = `${slugify(c.name)}@revora.test`;

    const user = await prisma.user.create({
      data: { email, passwordHash: hash, role: "CARRIER", name: c.name, companyName: c.company || null },
    });

    const carrier = await prisma.carrier.create({
      data: {
        userId: user.id,
        companyName: c.company || null,
        businessType: c.company ? "LIMITED_COMPANY" : "OWNER_DRIVER",
        city: c.city,
        slug: slugify(`${c.company || c.name}-${c.city}`) + "-" + idx,
        experienceYears: c.experience,
        description: `${c.company || c.name} — professional ${c.europe ? "UK & European " : "UK "}transport based in ${c.city}. ${c.experience} years of experience with careful, reliable moves.`,
        languages: c.europe ? ["English", "Polish"] : ["English"],
        europeTransport: c.europe,
        verificationStatus: status,
        isPublished,
        isFeatured: !!c.featured,
        isDemo: true,
        joinedAt: new Date(Date.now() - (idx + 1) * 3 * 24 * 3600 * 1000),
      },
    });

    // Авто
    const vehicle = await prisma.vehicle.create({
      data: {
        carrierId: carrier.id,
        vehicleType: c.vehicleType,
        make: c.make,
        model: c.model,
        year: 2019 + (idx % 5),
        registrationNumber: `RM${(idx + 10).toString().padStart(2, "0")} XYZ`,
        bodyType: c.vehicleType === "LUTON" ? "Box / Luton" : "Panel",
        loadCapacityKg: 800 + idx * 120,
        internalLengthCm: 300 + idx * 20,
        internalWidthCm: 170,
        internalHeightCm: 180 + (c.vehicleType === "LUTON" ? 40 : 0),
        volumeM3: 7 + idx,
        passengerSeats: 3,
        tailLift: c.vehicleType === "LUTON" || c.vehicleType.startsWith("TRUCK"),
        equipment: ["Straps", "Blankets", "Trolley"],
      },
    });
    await prisma.vehiclePhoto.create({ data: { vehicleId: vehicle.id, url: "", type: "side" } });

    // Тарифи
    await prisma.pricingProfile.create({
      data: { carrierId: carrier.id, ...defaultPricing(c.vehicleType) },
    });

    // Напрямки й послуги
    for (const areaName of c.areas) {
      const areaId = areaMap.get(areaName);
      if (areaId) await prisma.carrierArea.create({ data: { carrierId: carrier.id, areaId } });
    }
    for (const code of c.services) {
      const serviceId = serviceMap.get(code);
      if (serviceId) await prisma.carrierService.create({ data: { carrierId: carrier.id, serviceId } });
    }

    // Документи — верифіковані для опублікованих
    let verifiedDocs = 0;
    for (const dt of DOCUMENT_TYPES) {
      if (dt === "COMPANY_REGISTRATION" && !c.company) continue;
      const verified = isPublished;
      if (verified) verifiedDocs++;
      await prisma.document.create({
        data: {
          carrierId: carrier.id,
          type: dt,
          status: verified ? "VERIFIED" : "PENDING",
          documentNumber: `DOC-${idx}-${dt.slice(0, 3)}`,
          issueDate: new Date("2024-01-01"),
          expiryDate: new Date("2027-01-01"),
          verifiedAt: verified ? new Date() : null,
        },
      });
    }

    // Відгуки (+ завершені замовлення під них)
    let ratingSum = 0;
    for (const [i, r] of c.reviews.entries()) {
      const order = await prisma.order.create({
        data: {
          reference: nextRef(),
          carrierId: carrier.id,
          contactName: r.author,
          contactPhone: "+44 20 7000 0000",
          contactEmail: `${slugify(r.author)}@example.com`,
          serviceCode: c.services[0],
          pickupAddress: `${c.city}, UK`,
          deliveryAddress: `${c.city}, UK`,
          date: new Date(Date.now() - (i + 1) * 7 * 24 * 3600 * 1000),
          status: "COMPLETED",
          estimatedPrice: 120 + i * 30,
          completedAt: new Date(Date.now() - (i + 1) * 7 * 24 * 3600 * 1000),
        },
      });
      await prisma.review.create({
        data: {
          orderId: order.id,
          carrierId: carrier.id,
          authorName: r.author,
          overall: r.rating,
          punctuality: r.rating,
          communication: Math.min(5, r.rating + (i % 2)),
          quality: r.rating,
          care: r.rating,
          vehicleCondition: 5,
          priceAccuracy: Math.max(3, r.rating - (i % 2)),
          text: r.text,
          status: "PUBLISHED",
          isDemo: true,
        },
      });
      ratingSum += r.rating;
    }

    const reviewCount = c.reviews.length;
    const avgRating = reviewCount > 0 ? Math.round((ratingSum / reviewCount) * 10) / 10 : null;
    const completionRate =
      c.completedJobs > 0
        ? Math.round((c.completedJobs / (c.completedJobs + (c.cancelledJobs ?? 0))) * 100)
        : null;

    const completeness = computeProfileCompleteness({
      description: carrier.description,
      companyName: carrier.companyName,
      experienceYears: carrier.experienceYears,
      vehiclesCount: 1,
      photosCount: 1,
      areasCount: c.areas.length,
      servicesCount: c.services.length,
      verifiedDocsCount: verifiedDocs,
      hasPricing: true,
    });
    const daysSinceJoin = (idx + 1) * 3;
    const rankingScore = computeRankingScore({
      profileCompleteness: completeness,
      verifiedDocsCount: verifiedDocs,
      isPublished,
      isFeatured: !!c.featured,
      daysSinceJoin,
      avgRating,
      reviewCount,
      completedJobs: c.completedJobs,
    });

    await prisma.carrier.update({
      where: { id: carrier.id },
      data: {
        avgRating,
        reviewCount,
        completedJobs: c.completedJobs,
        cancelledJobs: c.cancelledJobs ?? 0,
        completionRate,
        avgResponseMinutes: reviewCount > 0 ? 30 + idx * 10 : null,
        profileCompleteness: completeness,
        rankingScore,
      },
    });
  }

  let idx = 0;
  for (const c of CARRIERS) await createCarrier(c, idx++, true);
  for (const c of PENDING_CARRIERS) await createCarrier(c, idx++, false);

  const counts = {
    carriers: await prisma.carrier.count(),
    published: await prisma.carrier.count({ where: { isPublished: true } }),
    reviews: await prisma.review.count(),
    areas: await prisma.area.count(),
    services: await prisma.serviceType.count(),
  };
  console.log("✅ Seed complete:", counts);
  console.log("   Logins (password: password123):");
  console.log("   admin@revora.test · customer@revora.test · james-carter@revora.test (carrier)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
