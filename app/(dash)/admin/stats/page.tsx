import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { SERVICE_TYPES } from "@/lib/enums";

export default async function AdminStatsPage() {
  const [customers, carriers, activeCarriers, orders, completed, cancelled, avgRatingAgg, ordersByService, ordersByCity] =
    await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.carrier.count(),
      prisma.carrier.count({ where: { isPublished: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.carrier.aggregate({ _avg: { avgRating: true } }),
      prisma.order.groupBy({ by: ["serviceCode"], _count: true, orderBy: { _count: { serviceCode: "desc" } }, take: 5 }),
      prisma.order.groupBy({ by: ["pickupAddress"], _count: true, orderBy: { _count: { pickupAddress: "desc" } }, take: 5 }),
    ]);

  const serviceName = (code: string) => SERVICE_TYPES.find((s) => s.code === code)?.name ?? code;

  const tiles = [
    ["Customers", customers], ["Carriers", carriers], ["Active carriers", activeCarriers],
    ["Total orders", orders], ["Completed", completed], ["Cancelled", cancelled],
    ["Avg. rating", avgRatingAgg._avg.avgRating ? avgRatingAgg._avg.avgRating.toFixed(2) : "—"],
    ["Completion rate", orders ? `${Math.round((completed / orders) * 100)}%` : "—"],
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-ink-strong">Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map(([label, value]) => (
          <Card key={label as string} className="p-5">
            <div className="text-2xl font-bold text-ink-strong">{value}</div>
            <div className="text-sm text-muted">{label as string}</div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-ink-strong mb-3">Popular services</h3>
          {ordersByService.length === 0 ? <p className="text-sm text-muted">No data yet.</p> : (
            <div className="space-y-2">
              {ordersByService.map((s) => (
                <div key={s.serviceCode} className="flex justify-between text-sm">
                  <span className="text-muted">{serviceName(s.serviceCode)}</span>
                  <span className="font-medium text-ink">{s._count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-ink-strong mb-3">Popular pickup areas</h3>
          {ordersByCity.length === 0 ? <p className="text-sm text-muted">No data yet.</p> : (
            <div className="space-y-2">
              {ordersByCity.map((c) => (
                <div key={c.pickupAddress} className="flex justify-between text-sm">
                  <span className="text-muted truncate">{c.pickupAddress}</span>
                  <span className="font-medium text-ink">{c._count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
