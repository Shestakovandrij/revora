import Link from "next/link";
import { Inbox, CalendarClock, CheckCircle2, Star, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ORDER_STATUS_LABELS, DOCUMENT_TYPES, DOCUMENT_LABELS, DOCUMENT_STATUS_LABELS, type OrderStatus, type DocumentType, type DocumentStatus } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

const UPCOMING: OrderStatus[] = ["BOOKING_CONFIRMED", "SCHEDULED", "DRIVER_ON_THE_WAY", "ARRIVED", "LOADING", "IN_TRANSIT", "UNLOADING"];

export default async function CarrierDashboard() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({ where: { userId: session!.sub } });
  if (!carrier) return <p>No carrier profile found.</p>;

  const [newCount, upcomingCount, completedCount, docs, nearest] = await Promise.all([
    prisma.order.count({ where: { carrierId: carrier.id, status: "NEW" } }),
    prisma.order.count({ where: { carrierId: carrier.id, status: { in: UPCOMING } } }),
    prisma.order.count({ where: { carrierId: carrier.id, status: "COMPLETED" } }),
    prisma.document.findMany({ where: { carrierId: carrier.id } }),
    prisma.order.findMany({
      where: { carrierId: carrier.id, status: { in: UPCOMING } },
      orderBy: { date: "asc" },
      take: 5,
    }),
  ]);

  const docMap = new Map(docs.map((d) => [d.type, d.status]));

  return (
    <div className="space-y-6">
      {!carrier.isPublished && (
        <div className="rounded-xl bg-warning/10 border border-warning/30 p-4 flex items-center gap-3">
          <AlertCircle className="text-warning shrink-0" size={20} />
          <div>
            <p className="font-semibold text-ink-strong">Profile pending verification</p>
            <p className="text-sm text-muted">Your profile is not visible in the catalogue until an admin approves it.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Inbox size={18} />} label="New bookings" value={newCount} href="/carrier/jobs?tab=new" accent={newCount > 0} />
        <StatCard icon={<CalendarClock size={18} />} label="Upcoming" value={upcomingCount} href="/carrier/jobs?tab=upcoming" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Completed" value={completedCount} href="/carrier/jobs?tab=completed" />
        <StatCard icon={<Star size={18} />} label="Rating" value={carrier.avgRating != null ? carrier.avgRating.toFixed(1) : "New"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink-strong">Upcoming jobs</h2>
            <Button href="/carrier/jobs?tab=upcoming" variant="ghost" size="sm">View all</Button>
          </div>
          {nearest.length === 0 ? (
            <p className="text-muted text-sm py-6 text-center">No upcoming jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {nearest.map((o) => (
                <Link key={o.id} href="/carrier/jobs?tab=upcoming" className="flex items-center justify-between p-3 rounded-xl border border-line hover:border-brand/40">
                  <div>
                    <p className="font-medium text-ink text-sm">{o.pickupAddress} → {o.deliveryAddress}</p>
                    <p className="text-xs text-muted">{new Date(o.date).toLocaleDateString("en-GB")} · {o.reference}</p>
                  </div>
                  <Badge variant="outline" size="sm">{ORDER_STATUS_LABELS[o.status as OrderStatus]}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold text-ink-strong mb-3 flex items-center gap-2"><TrendingUp size={16} /> Profile</h2>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 rounded-full bg-line overflow-hidden">
                <div className="h-full bg-brand" style={{ width: `${carrier.profileCompleteness}%` }} />
              </div>
              <span className="text-sm font-bold text-ink-strong">{carrier.profileCompleteness}%</span>
            </div>
            <p className="text-xs text-muted">Profile completeness affects your ranking.</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold text-ink-strong mb-3 flex items-center gap-2"><FileText size={16} /> Documents</h2>
            <div className="space-y-1.5">
              {DOCUMENT_TYPES.map((dt) => {
                const st = docMap.get(dt);
                return (
                  <div key={dt} className="flex items-center justify-between text-xs">
                    <span className="text-muted">{DOCUMENT_LABELS[dt as DocumentType]}</span>
                    <Badge variant={st === "VERIFIED" ? "soft" : "neutral"} size="sm">{DOCUMENT_STATUS_LABELS[(st ?? "NOT_UPLOADED") as DocumentStatus]}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, href, accent }: { icon: React.ReactNode; label: string; value: string | number; href?: string; accent?: boolean }) {
  const inner = (
    <Card className={`p-5 ${accent ? "border-brand bg-brand-soft/30" : ""} ${href ? "card-hover" : ""}`}>
      <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${accent ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}>{icon}</div>
      <div className="text-2xl font-bold text-ink-strong">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
