import Link from "next/link";
import { MapPin, Calendar, Package, Users, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCarrierOrders } from "@/server/services/orders";
import { transitionJobAction } from "../actions";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

const TABS = [
  { key: "new", label: "New Bookings", statuses: ["NEW", "INFO_REQUESTED"] as OrderStatus[] },
  { key: "upcoming", label: "Upcoming Jobs", statuses: ["BOOKING_CONFIRMED", "SCHEDULED", "DRIVER_ON_THE_WAY", "ARRIVED", "LOADING", "IN_TRANSIT", "UNLOADING"] as OrderStatus[] },
  { key: "completed", label: "Completed", statuses: ["COMPLETED", "CANCELLED", "DECLINED"] as OrderStatus[] },
];

// Лінійне просування статусу виконання.
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  BOOKING_CONFIRMED: { to: "SCHEDULED", label: "Mark scheduled" },
  SCHEDULED: { to: "DRIVER_ON_THE_WAY", label: "Driver on the way" },
  DRIVER_ON_THE_WAY: { to: "ARRIVED", label: "Mark arrived" },
  ARRIVED: { to: "LOADING", label: "Start loading" },
  LOADING: { to: "IN_TRANSIT", label: "In transit" },
  IN_TRANSIT: { to: "UNLOADING", label: "Start unloading" },
  UNLOADING: { to: "COMPLETED", label: "Mark completed" },
};

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "new" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({ where: { userId: session!.sub } });
  if (!carrier) return <p>No carrier profile.</p>;

  const orders = await getCarrierOrders(carrier.id, active.statuses);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/carrier/jobs?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              t.key === active.key ? "border-brand text-ink-strong" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted">No jobs in this section.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const next = NEXT[o.status as OrderStatus];
            const isNew = o.status === "NEW" || o.status === "INFO_REQUESTED";
            const services = (o.services as Record<string, boolean> | null) ?? {};
            return (
              <Card key={o.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-ink-strong">{o.reference}</span>
                      <Badge variant={o.status === "COMPLETED" ? "soft" : "outline"} size="sm">
                        {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                      </Badge>
                    </div>
                    <p className="text-sm text-ink flex items-center gap-1.5">
                      <MapPin size={14} className="text-brand-dark" /> {o.pickupAddress} → {o.deliveryAddress}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(o.date).toLocaleDateString("en-GB")}{o.preferredTime ? ` · ${o.preferredTime}` : ""}</span>
                      {o.distanceMiles && <span>{Math.round(o.distanceMiles)} mi</span>}
                      <span className="flex items-center gap-1"><Users size={12} /> {o.numberOfHelpers} helpers</span>
                      {o.propertyType && <span className="flex items-center gap-1"><Building2 size={12} /> {o.propertyType}</span>}
                      <span className="flex items-center gap-1"><Package size={12} /> {o.serviceCode.replaceAll("_", " ").toLowerCase()}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">Contact: {o.contactName} · {o.contactPhone}</p>
                    {Object.entries(services).some(([, v]) => v) && (
                      <p className="text-xs text-brand-dark mt-1">
                        {Object.entries(services).filter(([, v]) => v).map(([k]) => k).join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted">Estimated</p>
                    <p className="text-xl font-bold text-ink-strong">{formatPrice(o.estimatedPrice)}</p>
                  </div>
                </div>

                {/* Actions */}
                {(isNew || next) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line">
                    {isNew ? (
                      <>
                        <TransitionButton orderId={o.id} to="BOOKING_CONFIRMED" label="Accept" variant="primary" />
                        <TransitionButton orderId={o.id} to="INFO_REQUESTED" label="Request info" variant="outline" />
                        <TransitionButton orderId={o.id} to="DECLINED" label="Decline" variant="ghost" />
                      </>
                    ) : next ? (
                      <>
                        <TransitionButton orderId={o.id} to={next.to} label={next.label} variant="primary" />
                        <TransitionButton orderId={o.id} to="CANCELLED" label="Cancel" variant="ghost" />
                      </>
                    ) : null}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TransitionButton({ orderId, to, label, variant }: { orderId: string; to: OrderStatus; label: string; variant: "primary" | "outline" | "ghost" }) {
  return (
    <form action={transitionJobAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="toStatus" value={to} />
      <Button type="submit" size="sm" variant={variant}>{label}</Button>
    </form>
  );
}
