import Link from "next/link";
import { MapPin, CheckCircle2, Package, Globe, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingDisplay } from "./rating";
import { VehicleThumb } from "./vehicle-thumb";
import { formatPrice } from "@/lib/utils";
import { VEHICLE_LABELS, type VehicleType } from "@/lib/enums";
import type { CarrierCard as CarrierCardData } from "@/server/services/carriers";

export function CarrierCard({ carrier }: { carrier: CarrierCardData }) {
  const name = carrier.companyName || carrier.user.name || "Carrier";
  const vehicle = carrier.vehicles[0];
  const isNew = carrier.reviewCount === 0 && carrier.completedJobs === 0;
  const highlyRated = (carrier.avgRating ?? 0) >= 4.5 && carrier.reviewCount >= 3;
  const priceFrom = carrier.pricing?.minimumCharge || carrier.pricing?.baseRate || null;

  const areas = carrier.areas.map((a) => a.area.name).slice(0, 3);
  const services = carrier.services.map((s) => s.service.name).slice(0, 2);

  return (
    <Card className="card-hover group/card overflow-hidden flex flex-col p-2">
      <div className="relative h-40 rounded-[11px] overflow-hidden">
        <div className="w-full h-full transition-transform duration-[600ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover/card:scale-[1.05]">
          <VehicleThumb
            make={vehicle?.make}
            model={vehicle?.model}
            vehicleType={vehicle?.vehicleType}
            photoUrl={vehicle?.photos[0]?.url || null}
          />
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {carrier.isFeatured && <Badge variant="brand" size="sm">★ Top</Badge>}
          {highlyRated && <Badge variant="brand" size="sm">Highly Rated</Badge>}
          {isNew && !carrier.isFeatured && <Badge variant="neutral" size="sm" className="bg-white/90 backdrop-blur">New</Badge>}
        </div>
      </div>

      <div className="p-4 pt-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-ink-strong text-[17px] truncate leading-tight">{name}</h3>
            <p className="text-[13px] text-muted flex items-center gap-1 mt-1">
              <MapPin size={13} /> {carrier.city}
              {carrier.europeTransport && (
                <span className="inline-flex items-center gap-0.5 text-brand ml-1">
                  <Globe size={12} /> Europe
                </span>
              )}
            </p>
          </div>
          <RatingDisplay avgRating={carrier.avgRating} reviewCount={carrier.reviewCount} size="sm" />
        </div>

        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Badge variant="soft" size="sm">
            <CheckCircle2 size={12} /> Verified
          </Badge>
          {vehicle && (
            <Badge variant="outline" size="sm">
              {VEHICLE_LABELS[vehicle.vehicleType as VehicleType] ?? vehicle.vehicleType}
            </Badge>
          )}
          {carrier.completedJobs > 0 && (
            <Badge variant="outline" size="sm">{carrier.completedJobs} jobs</Badge>
          )}
        </div>

        {services.length > 0 && (
          <p className="text-[13px] text-muted mt-3 flex items-center gap-1.5">
            <Package size={13} className="shrink-0" /> <span className="truncate">{services.join(" · ")}</span>
          </p>
        )}
        {areas.length > 0 && (
          <p className="text-[13px] text-muted/80 mt-1.5 truncate">Covers: {areas.join(", ")}</p>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between gap-2 border-t border-line/70">
          <div>
            {priceFrom ? (
              <>
                <p className="text-[11px] text-muted leading-none uppercase tracking-wide">Estimated from</p>
                <p className="text-xl font-semibold text-ink-strong font-[family-name:var(--font-display)] mt-1">{formatPrice(priceFrom)}</p>
              </>
            ) : (
              <p className="text-sm text-muted">Get a quote</p>
            )}
          </div>
          <div className="flex gap-1.5">
            <Link href={`/carrier/${carrier.slug}`} className="h-9 w-9 grid place-items-center rounded-lg border border-line text-ink-strong hover:border-brand hover:text-brand transition-colors" aria-label="View profile">
              <ArrowUpRight size={16} />
            </Link>
            <Button href={`/book/${carrier.slug}`} variant="primary" size="sm">Book</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
