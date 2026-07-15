import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { VEHICLE_LABELS, type VehicleType } from "@/lib/enums";

/**
 * Заглушка фото авто: акуратний градієнт + іконка + підпис.
 * Картка виглядає добре навіть без реального фото (демо / новачок).
 */
export function VehicleThumb({
  make,
  model,
  vehicleType,
  photoUrl,
  className,
}: {
  make?: string;
  model?: string;
  vehicleType?: string;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt={`${make} ${model}`} className={cn("object-cover w-full h-full", className)} />;
  }

  const label = vehicleType ? VEHICLE_LABELS[vehicleType as VehicleType] ?? "Vehicle" : "Vehicle";
  return (
    <div
      className={cn(
        "relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ink-strong to-ink text-white/90 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-grid opacity-20" />
      <Truck className="relative z-10 mb-1 text-brand-bright" size={30} />
      <span className="relative z-10 text-xs font-semibold uppercase tracking-wide text-brand-bright">{label}</span>
      {make && <span className="relative z-10 text-[11px] text-white/60">{make} {model}</span>}
    </div>
  );
}
