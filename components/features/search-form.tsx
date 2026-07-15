"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Truck, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { VEHICLE_TYPES, VEHICLE_LABELS } from "@/lib/enums";

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [advanced, setAdvanced] = useState(false);

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
      className="bg-white rounded-[18px] border border-line shadow-[var(--shadow-lift)] p-4 sm:p-6 ring-1 ring-line/50"
    >
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        <Field icon={<MapPin size={16} />} label="Pickup">
          <Input name="from" placeholder="From (e.g. London)" list="areas" />
        </Field>
        <Field icon={<MapPin size={16} />} label="Delivery">
          <Input name="to" placeholder="To (e.g. Manchester)" list="areas" />
        </Field>
        <Field icon={<Calendar size={16} />} label="Date">
          <Input name="date" type="date" />
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

      {advanced && (
        <div className="grid gap-3 sm:grid-cols-3 mt-3 pt-3 border-t border-line">
          <Field label="Helpers">
            <Select name="helpers" defaultValue="">
              <option value="">Any</option>
              {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n} helpers</option>)}
            </Select>
          </Field>
          <Field label="Options">
            <Select name="europe" defaultValue="">
              <option value="">Any coverage</option>
              <option value="1">Europe transport</option>
            </Select>
          </Field>
          <Field label="Equipment">
            <Select name="tailLift" defaultValue="">
              <option value="">Any</option>
              <option value="1">Tail lift</option>
            </Select>
          </Field>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 gap-3">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="text-sm text-muted hover:text-brand-dark inline-flex items-center gap-1.5"
        >
          <SlidersHorizontal size={15} /> {advanced ? "Fewer options" : "More options"}
        </button>
        <Button type="submit" size="lg" className="min-w-44">
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
