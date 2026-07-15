import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { adminCancelOrderAction } from "../actions";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

const CLOSED = ["COMPLETED", "CANCELLED", "DECLINED"];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { carrier: { select: { companyName: true, user: { select: { name: true } } } } },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-ink-strong">All orders ({orders.length})</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-surface-soft text-muted text-xs">
              <tr>
                <th className="text-left font-medium px-4 py-3">Ref</th>
                <th className="text-left font-medium px-4 py-3">Route</th>
                <th className="text-left font-medium px-4 py-3">Carrier</th>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-right font-medium px-4 py-3">Est.</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{o.reference}</td>
                  <td className="px-4 py-3 text-muted max-w-56 truncate">{o.pickupAddress} → {o.deliveryAddress}</td>
                  <td className="px-4 py-3 text-muted">{o.carrier.companyName || o.carrier.user?.name}</td>
                  <td className="px-4 py-3 text-muted">{new Date(o.date).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3 text-right font-medium text-ink">{formatPrice(o.estimatedPrice)}</td>
                  <td className="px-4 py-3"><Badge variant={o.status === "COMPLETED" ? "soft" : "outline"} size="sm">{ORDER_STATUS_LABELS[o.status as OrderStatus]}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    {!CLOSED.includes(o.status) && (
                      <form action={adminCancelOrderAction}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <Button type="submit" variant="ghost" size="sm">Cancel</Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
