import { Truck, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VehicleThumb } from "@/components/features/vehicle-thumb";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VEHICLE_LABELS, type VehicleType } from "@/lib/enums";

export default async function VehiclesPage() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({
    where: { userId: session!.sub },
    include: { vehicles: { include: { photos: true } } },
  });
  if (!carrier) return <p>No carrier profile.</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-strong">Vehicle management</h2>
        <Button variant="primary" size="sm"><Plus size={15} /> Add vehicle</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {carrier.vehicles.map((v) => (
          <Card key={v.id} className="overflow-hidden">
            <div className="h-36"><VehicleThumb make={v.make} model={v.model} vehicleType={v.vehicleType} photoUrl={v.photos[0]?.url || null} /></div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink-strong flex items-center gap-2"><Truck size={16} /> {v.make} {v.model}</h3>
                <Badge variant={v.isActive ? "soft" : "neutral"} size="sm">{v.isActive ? "Active" : "Off"}</Badge>
              </div>
              <p className="text-sm text-muted mt-1">{VEHICLE_LABELS[v.vehicleType as VehicleType]} · {v.year}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted">
                <span>Capacity: {v.loadCapacityKg ?? "—"} kg</span>
                <span>Volume: {v.volumeM3 ?? "—"} m³</span>
                <span>Tail lift: {v.tailLift ? "Yes" : "No"}</span>
                <span>Reg: {v.registrationNumber}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
