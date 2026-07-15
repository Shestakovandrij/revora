import Link from "next/link";
import { Truck, ShieldAlert, ClipboardList, Star, Users, CheckCircle2, PoundSterling } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export default async function AdminOverview() {
  const [carriers, published, pending, orders, completed, reviews, pendingReviews, customers, pendingList] =
    await Promise.all([
      prisma.carrier.count(),
      prisma.carrier.count({ where: { isPublished: true } }),
      prisma.carrier.count({ where: { verificationStatus: "PENDING" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.review.count(),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.carrier.findMany({
        where: { verificationStatus: "PENDING" },
        include: { user: { select: { name: true, email: true } } },
        take: 5,
      }),
    ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat icon={<Truck size={18} />} label="Carriers" value={`${published}/${carriers}`} sub="published / total" />
        <Stat icon={<ShieldAlert size={18} />} label="Pending verification" value={pending} accent={pending > 0} href="/admin/carriers?tab=pending" />
        <Stat icon={<ClipboardList size={18} />} label="Orders" value={orders} sub={`${completed} completed`} href="/admin/orders" />
        <Stat icon={<Star size={18} />} label="Reviews" value={reviews} sub={`${pendingReviews} pending`} href="/admin/reviews" />
        <Stat icon={<Users size={18} />} label="Customers" value={customers} />
        <Stat icon={<CheckCircle2 size={18} />} label="Completed jobs" value={completed} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-ink-strong">Awaiting verification</h2>
          <Button href="/admin/carriers?tab=pending" variant="ghost" size="sm">Review all</Button>
        </div>
        {pendingList.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">No carriers awaiting verification.</p>
        ) : (
          <div className="space-y-2">
            {pendingList.map((c) => (
              <Link key={c.id} href="/admin/carriers?tab=pending" className="flex items-center justify-between p-3 rounded-xl border border-line hover:border-brand/40">
                <div>
                  <p className="font-medium text-ink text-sm">{c.companyName || c.user.name}</p>
                  <p className="text-xs text-muted">{c.city} · {c.user.email}</p>
                </div>
                <Badge variant="warning" size="sm">Pending</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-bold text-ink-strong mb-2 flex items-center gap-2"><PoundSterling size={16} /> Monetisation</h2>
        <p className="text-sm text-muted">
          No online payments are processed — customers pay carriers directly. Platform monetisation
          (carrier subscription / lead fee) is a business decision, not yet modelled.
        </p>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value, sub, href, accent }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; href?: string; accent?: boolean }) {
  const inner = (
    <Card className={`p-5 ${accent ? "border-warning/40 bg-warning/10" : ""} ${href ? "card-hover" : ""}`}>
      <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${accent ? "bg-warning/20 text-warning" : "bg-brand-soft text-brand"}`}>{icon}</div>
      <div className="text-2xl font-bold text-ink-strong">{value}</div>
      <div className="text-sm text-muted">{label}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
