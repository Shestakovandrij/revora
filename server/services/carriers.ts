import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type CarrierFilters = {
  from?: string;
  to?: string;
  vehicleType?: string;
  service?: string;
  minRating?: number;
  europe?: boolean;
  tailLift?: boolean;
  sort?: string;
  helpers?: number;
  // Параметри вантажу — фільтрують за придатністю авто.
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  volumeM3?: number;
  date?: string;
  // Авто / перевізник
  capacityKg?: number;       // мінімальна вантажопідйомність авто
  bodyType?: string;         // тип кузова
  minCompletedJobs?: number; // мін. к-сть виконаних замовлень
  available?: boolean;       // лише доступні (не заблоковані сьогодні/на дату)
  language?: string;         // мова спілкування
};

const publishedWhere: Prisma.CarrierWhereInput = {
  isPublished: true,
  verificationStatus: "APPROVED",
};

export const carrierCardInclude = {
  user: { select: { name: true } },
  vehicles: {
    where: { isActive: true },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
    take: 1,
  },
  areas: { include: { area: true } },
  services: { include: { service: true } },
  pricing: true,
} satisfies Prisma.CarrierInclude;

export type CarrierCard = Prisma.CarrierGetPayload<{ include: typeof carrierCardInclude }>;

/** Сортування каталогу з fallback tie-break на rankingScore (для cold start). */
function orderBy(sort?: string): Prisma.CarrierOrderByWithRelationInput[] {
  switch (sort) {
    case "recommended":
      return [{ isFeatured: "desc" }, { rankingScore: "desc" }, { profileCompleteness: "desc" }];
    case "reviews":
      return [{ reviewCount: "desc" }, { rankingScore: "desc" }];
    case "jobs":
      return [{ completedJobs: "desc" }, { rankingScore: "desc" }];
    case "newest":
      return [{ joinedAt: "desc" }];
    case "price":
      return [{ rankingScore: "desc" }]; // ціна залежить від маршруту — сортуємо в пам'яті за потреби
    default: // "rating" — за замовчуванням: рейтинг від найбільшого (нові з null — в кінці)
      return [{ avgRating: { sort: "desc", nulls: "last" } }, { rankingScore: "desc" }];
  }
}

export async function getCarriers(filters: CarrierFilters = {}): Promise<CarrierCard[]> {
  const and: Prisma.CarrierWhereInput[] = [publishedWhere];

  if (filters.europe) and.push({ europeTransport: true });
  if (filters.minRating) and.push({ avgRating: { gte: filters.minRating } });
  if (filters.minCompletedJobs) and.push({ completedJobs: { gte: filters.minCompletedJobs } });
  if (filters.service)
    and.push({ services: { some: { service: { code: filters.service } } } });

  // Придатність авто: усі вимоги (тип, вага, габарити, об'єм, tail lift, кузов,
  // вантажопідйомність) має задовольняти ОДНЕ активне авто → збираємо в один `some`.
  const vehicleReq: Prisma.VehicleWhereInput = { isActive: true };
  if (filters.vehicleType) vehicleReq.vehicleType = filters.vehicleType;
  if (filters.bodyType) vehicleReq.bodyType = filters.bodyType;
  if (filters.tailLift) vehicleReq.tailLift = true;
  // Вага вантажу та задана мін. вантажопідйомність → беремо більше з двох.
  const minCap = Math.max(filters.weightKg ?? 0, filters.capacityKg ?? 0);
  if (minCap > 0) vehicleReq.loadCapacityKg = { gte: minCap };
  if (filters.lengthCm) vehicleReq.internalLengthCm = { gte: filters.lengthCm };
  if (filters.widthCm) vehicleReq.internalWidthCm = { gte: filters.widthCm };
  if (filters.heightCm) vehicleReq.internalHeightCm = { gte: filters.heightCm };
  if (filters.volumeM3) vehicleReq.volumeM3 = { gte: filters.volumeM3 };
  if (Object.keys(vehicleReq).length > 1) and.push({ vehicles: { some: vehicleReq } });

  // Дата перевезення: приховати перевізників, що позначили день як недоступний.
  if (filters.date) {
    const day = new Date(filters.date);
    if (!Number.isNaN(day.getTime())) {
      const start = new Date(day); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      and.push({
        NOT: { availability: { some: { date: { gte: start, lt: end }, isBlocked: true } } },
      });
    }
  }

  // Статус доступності: приховати перевізників, заблокованих на обрану дату
  // (або на сьогодні, якщо дату не вказано).
  if (filters.available) {
    const ref = filters.date ? new Date(filters.date) : new Date();
    if (!Number.isNaN(ref.getTime())) {
      const start = new Date(ref); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      and.push({
        NOT: { availability: { some: { date: { gte: start, lt: end }, isBlocked: true } } },
      });
    }
  }

  // Маршрут: перевізник має покривати місто відправлення або призначення.
  const routeNames = [filters.from, filters.to].filter(Boolean) as string[];
  if (routeNames.length) {
    and.push({
      areas: { some: { area: { name: { in: routeNames } } } },
    });
  }

  let carriers = await prisma.carrier.findMany({
    where: { AND: and },
    include: carrierCardInclude,
    orderBy: orderBy(filters.sort),
  });

  // Мова спілкування — languages зберігається як JSON-масив (SQLite),
  // фільтруємо в пам'яті.
  if (filters.language) {
    carriers = carriers.filter((c) => {
      const langs = Array.isArray(c.languages) ? (c.languages as string[]) : [];
      return langs.includes(filters.language as string);
    });
  }

  return carriers;
}

export async function getTopCarriers(limit = 4): Promise<CarrierCard[]> {
  return prisma.carrier.findMany({
    where: publishedWhere,
    include: carrierCardInclude,
    orderBy: [{ isFeatured: "desc" }, { rankingScore: "desc" }],
    take: limit,
  });
}

export async function getCarrierBySlug(slug: string) {
  return prisma.carrier.findFirst({
    where: { slug, ...publishedWhere },
    include: {
      user: { select: { name: true } },
      vehicles: { include: { photos: { orderBy: { sortOrder: "asc" } } } },
      areas: { include: { area: true } },
      services: { include: { service: true } },
      pricing: true,
      documents: { select: { type: true, status: true } },
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: { order: { select: { serviceCode: true } } },
      },
    },
  });
}

export async function getPopularAreas() {
  return prisma.area.findMany({
    where: { isPopular: true },
    include: { _count: { select: { carriers: true } } },
    orderBy: { type: "asc" },
  });
}

export async function getPublishedReviews(limit = 6) {
  return prisma.review.findMany({
    where: { status: "PUBLISHED", text: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      carrier: { select: { companyName: true, user: { select: { name: true } } } },
      order: { select: { serviceCode: true, pickupAddress: true, deliveryAddress: true } },
    },
  });
}
