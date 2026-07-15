import { notFound } from "next/navigation";
import {
  MapPin, Globe2, CheckCircle2, Clock, Briefcase, Languages as LangIcon,
  ShieldCheck, XCircle, Truck, Package, Quote,
} from "lucide-react";
import { Container, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingDisplay, StarRow } from "@/components/features/rating";
import { VehicleThumb } from "@/components/features/vehicle-thumb";
import { getCarrierBySlug } from "@/server/services/carriers";
import { formatPrice, shortName } from "@/lib/utils";
import {
  DOCUMENT_TYPES, DOCUMENT_LABELS, VEHICLE_LABELS,
  REVIEW_CRITERIA, REVIEW_CRITERION_LABELS,
  type VehicleType, type DocumentType,
} from "@/lib/enums";

export default async function CarrierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const carrier = await getCarrierBySlug(slug);
  if (!carrier) notFound();

  const name = carrier.companyName || carrier.user.name || "Carrier";
  const vehicle = carrier.vehicles[0];
  const priceFrom = carrier.pricing?.minimumCharge || carrier.pricing?.baseRate || null;
  const reviews = carrier.reviews;
  const isNew = carrier.reviewCount === 0 && carrier.completedJobs === 0;
  const docStatus = new Map(carrier.documents.map((d) => [d.type, d.status]));

  // Середні за критеріями (cold start: показуємо лише коли є відгуки)
  const criteriaAvg = REVIEW_CRITERIA.reduce((acc, c) => {
    const vals = reviews.map((r) => r[c]).filter((v): v is number => typeof v === "number");
    acc[c] = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
    return acc;
  }, {} as Record<string, number | null>);

  const languages = (carrier.languages as string[] | null) ?? ["English"];

  return (
    <Container className="pt-8 pb-24">
      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-6">
          {/* HEADER */}
          <Card className="overflow-hidden">
            <div className="h-48 relative">
              <VehicleThumb make={vehicle?.make} model={vehicle?.model} vehicleType={vehicle?.vehicleType} photoUrl={vehicle?.photos[0]?.url || null} />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="soft"><CheckCircle2 size={13} /> Verified</Badge>
                {carrier.europeTransport && <Badge variant="brand"><Globe2 size={13} /> Europe</Badge>}
                {isNew && <Badge variant="neutral">New carrier</Badge>}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="display-md text-ink-strong">{name}</h1>
                  <p className="text-muted flex items-center gap-1.5 mt-1">
                    <MapPin size={15} /> {carrier.city}
                    <span className="mx-1">·</span>
                    <Briefcase size={15} /> {carrier.experienceYears} yrs experience
                  </p>
                </div>
                <RatingDisplay avgRating={carrier.avgRating} reviewCount={carrier.reviewCount} size="lg" />
              </div>

              {/* Метрики зі станами cold start */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <Stat label="Completed jobs" value={carrier.completedJobs > 0 ? String(carrier.completedJobs) : "New"} />
                <Stat label="Reviews" value={carrier.reviewCount > 0 ? String(carrier.reviewCount) : "—"} />
                <Stat label="Completion" value={carrier.completionRate != null ? `${carrier.completionRate}%` : "—"} />
                <Stat label="Avg. response" value={carrier.avgResponseMinutes != null ? `${carrier.avgResponseMinutes}m` : "—"} />
              </div>
            </div>
          </Card>

          {/* ABOUT */}
          <Card className="p-6">
            <h2 className="font-bold text-ink-strong text-lg mb-3">About</h2>
            <p className="text-ink leading-relaxed">{carrier.description}</p>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-6">
              <InfoRow icon={<MapPin size={16} />} label="Areas covered" value={carrier.areas.map((a) => a.area.name).join(", ")} />
              <InfoRow icon={<Package size={16} />} label="Services" value={carrier.services.map((s) => s.service.name).join(", ")} />
              <InfoRow icon={<LangIcon size={16} />} label="Languages" value={languages.join(", ")} />
              <InfoRow icon={<Globe2 size={16} />} label="Europe transport" value={carrier.europeTransport ? "Yes" : "No"} />
            </div>
          </Card>

          {/* VEHICLE */}
          {vehicle && (
            <Card className="p-6">
              <h2 className="font-bold text-ink-strong text-lg mb-4 flex items-center gap-2">
                <Truck size={18} className="text-brand-dark" /> Vehicle details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <Spec label="Type" value={VEHICLE_LABELS[vehicle.vehicleType as VehicleType]} />
                <Spec label="Make & model" value={`${vehicle.make} ${vehicle.model}`} />
                <Spec label="Year" value={String(vehicle.year)} />
                <Spec label="Body type" value={vehicle.bodyType ?? "—"} />
                <Spec label="Load capacity" value={vehicle.loadCapacityKg ? `${vehicle.loadCapacityKg} kg` : "—"} />
                <Spec label="Volume" value={vehicle.volumeM3 ? `${vehicle.volumeM3} m³` : "—"} />
                <Spec label="Internal (L×W×H)" value={`${vehicle.internalLengthCm ?? "—"}×${vehicle.internalWidthCm ?? "—"}×${vehicle.internalHeightCm ?? "—"} cm`} />
                <Spec label="Tail lift" value={vehicle.tailLift ? "Yes" : "No"} />
                <Spec label="Passenger seats" value={String(vehicle.passengerSeats ?? 0)} />
              </div>
            </Card>
          )}

          {/* INSURANCE & VERIFICATION */}
          <Card className="p-6">
            <h2 className="font-bold text-ink-strong text-lg mb-1 flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-dark" /> Insurance & verification
            </h2>
            <p className="text-xs text-muted mb-4">We show verification status only — never document files or personal data.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {DOCUMENT_TYPES.map((dt) => {
                const status = docStatus.get(dt);
                const verified = status === "VERIFIED";
                return (
                  <div key={dt} className="flex items-center gap-2 text-sm py-1.5">
                    {verified ? <CheckCircle2 size={16} className="text-brand-dark" /> : <XCircle size={16} className="text-muted" />}
                    <span className={verified ? "text-ink" : "text-muted"}>{DOCUMENT_LABELS[dt as DocumentType]}</span>
                    {verified && <span className="ml-auto text-xs font-medium text-brand-dark">Verified</span>}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* REVIEWS */}
          <Card className="p-6">
            <h2 className="font-bold text-ink-strong text-lg mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted">No reviews yet — be the first after your move.</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-ink-strong">{carrier.avgRating?.toFixed(1)}</div>
                    <div>
                      <StarRow value={carrier.avgRating ?? 0} size={16} />
                      <p className="text-sm text-muted mt-1">{carrier.reviewCount} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {REVIEW_CRITERIA.filter((c) => c !== "overall").map((c) => (
                      <div key={c} className="flex items-center gap-2 text-xs">
                        <span className="w-32 text-muted">{REVIEW_CRITERION_LABELS[c]}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
                          <div className="h-full bg-brand" style={{ width: `${((criteriaAvg[c] ?? 0) / 5) * 100}%` }} />
                        </div>
                        <span className="w-7 text-right font-medium text-ink">{criteriaAvg[c]?.toFixed(1) ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-t border-line pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink-strong">{shortName(r.authorName)}</span>
                        <StarRow value={r.overall} size={13} />
                      </div>
                      {r.text && <p className="text-sm text-ink mt-2 leading-relaxed flex gap-2"><Quote size={16} className="text-brand shrink-0" /> {r.text}</p>}
                      {r.carrierResponse && (
                        <div className="mt-3 ml-4 pl-3 border-l-2 border-brand bg-surface-soft rounded p-2 text-sm text-muted">
                          <span className="font-medium text-ink">Carrier response:</span> {r.carrierResponse}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* SIDEBAR — BOOK */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <Card className="p-6">
            {priceFrom && (
              <>
                <p className="text-sm text-muted">Estimated price from</p>
                <p className="text-3xl font-bold text-ink-strong">{formatPrice(priceFrom)}</p>
                <p className="text-xs text-muted mt-1">Final estimate depends on your route & options.</p>
              </>
            )}
            <Button href={`/book/${carrier.slug}`} size="lg" className="w-full mt-4">Book Now</Button>
            <p className="text-xs text-muted text-center mt-3 flex items-center justify-center gap-1">
              <Clock size={12} /> No payment online — pay the driver directly.
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink-strong text-sm mb-3">At a glance</h3>
            <div className="space-y-2 text-sm">
              <MiniRow label="Status" value="Verified" accent />
              <MiniRow label="Base city" value={carrier.city} />
              <MiniRow label="Experience" value={`${carrier.experienceYears} years`} />
              <MiniRow label="Vehicles" value={String(carrier.vehicles.length)} />
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-soft border border-line p-3 text-center">
      <div className="text-lg font-bold text-ink-strong">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-brand-dark mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm text-ink font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}
function MiniRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={accent ? "font-semibold text-brand-dark" : "font-medium text-ink"}>{value}</span>
    </div>
  );
}
