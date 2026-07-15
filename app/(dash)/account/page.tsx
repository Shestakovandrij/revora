import Link from "next/link";
import { MapPin, Calendar, Star, PackageOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { makeReviewToken } from "@/lib/review-token";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

export default async function AccountOrdersPage() {
  const session = await getSession();
  const orders = await prisma.order.findMany({
    where: { customerUserId: session!.sub },
    orderBy: { createdAt: "desc" },
    include: { carrier: { select: { slug: true, companyName: true, user: { select: { name: true } } } }, review: { select: { id: true } } },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink-strong">My orders</h2>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <PackageOpen className="mx-auto text-muted mb-3" size={32} />
          <p className="text-muted">You have no bookings yet.</p>
          <Button href="/catalog" className="mt-4">Find a carrier</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink-strong">{o.reference}</span>
                    <Badge variant={o.status === "COMPLETED" ? "soft" : "outline"} size="sm">{ORDER_STATUS_LABELS[o.status as OrderStatus]}</Badge>
                  </div>
                  <p className="text-sm text-ink flex items-center gap-1.5 mt-1"><MapPin size={14} className="text-brand-dark" /> {o.pickupAddress} → {o.deliveryAddress}</p>
                  <p className="text-xs text-muted mt-1 flex items-center gap-2">
                    <Calendar size={12} /> {new Date(o.date).toLocaleDateString("en-GB")} · {o.carrier.companyName || o.carrier.user?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Estimated</p>
                  <p className="text-lg font-bold text-ink-strong">{formatPrice(o.estimatedPrice)}</p>
                </div>
              </div>

              {o.status === "COMPLETED" && !o.review && (
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <span className="text-sm text-muted">How was your move?</span>
                  <Button href={`/review/${o.id}?token=${makeReviewToken(o.id)}`} variant="primary" size="sm"><Star size={14} /> Leave a review</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
