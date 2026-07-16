"use client";

import { useRouter } from "next/navigation";
import { MapPin, Calendar, Truck, Search, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { VEHICLE_TYPES, VEHICLE_LABELS } from "@/lib/enums";

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (v && String(v).trim()) params.set(k, String(v));
    }
    router.push(`/catalog?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative rounded-[20px] border border-brand/25 shadow-[var(--shadow-lift)] p-4 sm:p-6 ring-1 ring-brand/10 bg-gradient-to-br from-brand-soft/70 via-white to-brand-soft/40"
    >
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
        <Field icon={<MapPin size={16} />} label="Pickup">
          <Input name="from" placeholder="From (e.g. London)" list="areas" />
        </Field>
        <Field icon={<MapPin size={16} />} label="Delivery">
          <Input name="to" placeholder="To (e.g. Manchester)" list="areas" />
        </Field>
        <Field icon={<Calendar size={16} />} label="Date">
          <Input name="date" type="date" />
        </Field>
        <Field icon={<Scale size={16} />} label="Weight (kg)">
          <Input name="weightKg" type="number" min="0" placeholder="e.g. 100" />
        </Field>
        <Field icon={<Truck size={16} />} label="Vehicle">
          <Select name="vehicleType" defaultValue="">
            <option value="">Any vehicle</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>{VEHICLE_LABELS[v]}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit" size="lg" className="min-w-44 max-sm:w-full">
          <Search size={18} /> Get Instant Quotes
        </Button>
      </div>

      <datalist id="areas">
        {["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Glasgow", "France", "Germany", "Poland"].map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
    </form>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted mb-1 flex items-center gap-1">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
