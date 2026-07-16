import { SearchX } from "lucide-react";
import { Container, Card } from "@/components/ui/card";
import { CarrierCard } from "@/components/features/carrier-card";
import { CatalogFilters, SortSelect } from "@/components/features/catalog-filters";
import { MobileFilters } from "@/components/features/mobile-filters";
import { getCarriers, type CarrierFilters } from "@/server/services/carriers";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const metadata = { title: "Find a carrier" };

type SP = Record<string, string | string[] | undefined>;

function parseFilters(sp: SP): CarrierFilters {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const n = (k: string) => (s(k) && !Number.isNaN(Number(s(k))) ? Number(s(k)) : undefined);
  return {
    from: s("from"),
    to: s("to"),
    date: s("date"),
    vehicleType: s("vehicleType"),
    service: s("service"),
    minRating: n("minRating"),
    europe: s("europe") === "1",
    tailLift: s("tailLift") === "1",
    weightKg: n("weightKg"),
    lengthCm: n("lengthCm"),
    widthCm: n("widthCm"),
    heightCm: n("heightCm"),
    volumeM3: n("volumeM3"),
    capacityKg: n("capacityKg"),
    bodyType: s("bodyType"),
    minCompletedJobs: n("minCompletedJobs"),
    available: s("available") === "1",
    language: s("language"),
    sort: s("sort"),
  };
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  let carriers = await getCarriers(filters);

  // Ціна залежить від маршруту — сортування за "ціною від" робимо в пам'яті.
  if (filters.sort === "price") {
    carriers = [...carriers].sort(
      (a, b) => (a.pricing?.minimumCharge ?? 1e9) - (b.pricing?.minimumCharge ?? 1e9)
    );
  }

  const routeLabel = [filters.from, filters.to].filter(Boolean).join(" → ");

  // Передати параметри вантажу в посилання «Book», щоб форма бронювання їх підхопила.
  const bookingParams = new URLSearchParams();
  for (const [k, val] of Object.entries(sp)) {
    if (typeof val === "string" && val && k !== "sort") bookingParams.set(k, val);
  }
  const bookingQuery = bookingParams.toString() ? `?${bookingParams.toString()}` : "";

  return (
    <Container className="pt-10 pb-24">
      <div className="mb-8">
        <div className="eyebrow mb-3">Find a driver</div>
        <h1 className="display-md text-ink-strong">Available carriers</h1>
        <p className="text-muted mt-2 text-[15px]">
          {routeLabel ? <>Showing carriers for <span className="font-medium text-ink">{routeLabel}</span> · </> : null}
          {carriers.length} result{carriers.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Desktop sidebar */}
        <Card className="hidden lg:block lg:sticky lg:top-24 lg:self-start p-6 h-max">
          <CatalogFilters />
        </Card>

        <div>
          {/* Mobile: filters open in a drawer (не тиснуть картки вниз) */}
          <div className="mb-4 lg:hidden">
            <MobileFilters />
          </div>

          <div className="flex items-center justify-between mb-6 gap-4">
            <p className="text-sm text-muted">Sorted by highest rating</p>
            <SortSelect />
          </div>

          {carriers.length === 0 ? (
            <Reveal className="text-center py-24 rounded-[18px] border border-dashed border-line bg-white">
              <SearchX className="mx-auto text-muted mb-3" size={32} />
              <h3 className="font-semibold text-ink-strong">No carriers match your search</h3>
              <p className="text-muted text-sm mt-1">Try widening your route or removing some filters.</p>
            </Reveal>
          ) : (
            <Stagger className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" gap={0.05}>
              {carriers.map((c) => <StaggerItem key={c.id}><CarrierCard carrier={c} bookingQuery={bookingQuery} /></StaggerItem>)}
            </Stagger>
          )}
        </div>
      </div>
    </Container>
  );
}
