import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VehicleManager, type ManagedVehicle } from "@/components/features/vehicle-manager";

export default async function VehiclesPage() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({
    where: { userId: session!.sub },
    include: { vehicles: { include: { photos: { orderBy: { sortOrder: "asc" } } }, orderBy: { id: "asc" } } },
  });
  if (!carrier) return <p>No carrier profile.</p>;

  const vehicles: ManagedVehicle[] = carrier.vehicles.map((v) => ({
    id: v.id,
    vehicleType: v.vehicleType,
    make: v.make,
    model: v.model,
    year: v.year,
    registrationNumber: v.registrationNumber,
    bodyType: v.bodyType,
    loadCapacityKg: v.loadCapacityKg,
    internalLengthCm: v.internalLengthCm,
    internalWidthCm: v.internalWidthCm,
    internalHeightCm: v.internalHeightCm,
    volumeM3: v.volumeM3,
    tailLift: v.tailLift,
    isActive: v.isActive,
    photos: v.photos.map((p) => ({ id: p.id, url: p.url })),
  }));

  return <VehicleManager vehicles={vehicles} />;
}
