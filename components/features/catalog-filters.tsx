"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input, Select, Textarea, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  VEHICLE_TYPES,
  VEHICLE_LABELS,
  SERVICE_TYPES,
  CARGO_TYPES,
  LOADING_METHODS,
  BODY_TYPES,
  LANGUAGES,
} from "@/lib/enums";

// Поля, що керуються формою (обов'язкові + додаткові за ТЗ).
const FIELDS = [
  "from", "to", "date", "cargoType", "lengthCm", "widthCm", "heightCm", "weightKg",
  "volumeM3", "cargoPlaces", "vehicleType", "capacityKg", "bodyType", "loadingMethod",
  "unloadingMethod", "fragile", "loadingHelp", "comment", "service", "minRating",
  "minCompletedJobs", "available", "language", "europe", "tailLift",
] as const;

const ADVANCED_FIELDS = [
  "volumeM3", "cargoPlaces", "vehicleType", "capacityKg", "bodyType", "loadingMethod",
  "unloadingMethod", "service", "minRating", "minCompletedJobs", "available",
  "language", "fragile", "loadingHelp", "comment",
];

export function CatalogFilters({ onApplied }: { onApplied?: () => void } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const initial = Object.fromEntries(FIELDS.map((k) => [k, sp.get(k) ?? ""]));
  const [f, setF] = useState<Record<string, string>>(initial);
  const [advanced, setAdvanced] = useState(ADVANCED_FIELDS.some((k) => sp.get(k)));

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const get = (k: string) => f[k] ?? "";

  function apply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    // зберегти сортування, якщо було
    const sort = sp.get("sort");
    if (sort) params.set("sort", sort);
    for (const k of FIELDS) {
      const v = (f[k] ?? "").trim();
      if (v) params.set(k, v);
    }
    router.push(`${pathname}?${params.toString()}`);
    onApplied?.();
  }

  function clear() {
    setF(Object.fromEntries(FIELDS.map((k) => [k, ""])));
    router.push(pathname);
    onApplied?.();
  }

  return (
    <form onSubmit={apply} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink-strong">Filters</h3>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>Clear</Button>
      </div>

      {/* ── Обов'язкові поля ── */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>From</Label>
            <Input value={get("from")} placeholder="Pickup" onChange={(e) => set("from", e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input value={get("to")} placeholder="Delivery" onChange={(e) => set("to", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Move date</Label>
          <Input type="date" value={get("date")} onChange={(e) => set("date", e.target.value)} />
        </div>

        <div>
          <Label>Cargo type</Label>
          <Select value={get("cargoType")} onChange={(e) => set("cargoType", e.target.value)}>
            <option value="">Any cargo</option>
            {CARGO_TYPES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </Select>
        </div>

        <div>
          <Label>Cargo dimensions (cm)</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input type="number" min="0" value={get("lengthCm")} placeholder="Length" onChange={(e) => set("lengthCm", e.target.value)} />
            <Input type="number" min="0" value={get("widthCm")} placeholder="Width" onChange={(e) => set("widthCm", e.target.value)} />
            <Input type="number" min="0" value={get("heightCm")} placeholder="Height" onChange={(e) => set("heightCm", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Weight (kg)</Label>
          <Input type="number" min="0" value={get("weightKg")} placeholder="e.g. 100" onChange={(e) => set("weightKg", e.target.value)} />
        </div>
      </div>

      {/* ── Додаткові параметри ── */}
      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="text-sm text-brand-dark hover:underline inline-flex items-center gap-1.5"
      >
        <SlidersHorizontal size={15} /> {advanced ? "Hide extra parameters" : "Additional parameters"}
      </button>

      {advanced && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Volume (m³)</Label>
              <Input type="number" min="0" step="0.1" value={get("volumeM3")} onChange={(e) => set("volumeM3", e.target.value)} />
            </div>
            <div>
              <Label>Number of places</Label>
              <Input type="number" min="0" value={get("cargoPlaces")} onChange={(e) => set("cargoPlaces", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Vehicle type</Label>
              <Select value={get("vehicleType")} onChange={(e) => set("vehicleType", e.target.value)}>
                <option value="">Any vehicle</option>
                {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{VEHICLE_LABELS[v]}</option>)}
              </Select>
            </div>
            <div>
              <Label>Body type</Label>
              <Select value={get("bodyType")} onChange={(e) => set("bodyType", e.target.value)}>
                <option value="">Any body</option>
                {BODY_TYPES.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>Min. load capacity (kg)</Label>
            <Select value={get("capacityKg")} onChange={(e) => set("capacityKg", e.target.value)}>
              <option value="">Any capacity</option>
              {[500, 1000, 1500, 2000, 3500, 7500].map((v) => <option key={v} value={v}>{v.toLocaleString()}+ kg</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Loading method</Label>
              <Select value={get("loadingMethod")} onChange={(e) => set("loadingMethod", e.target.value)}>
                <option value="">Any</option>
                {LOADING_METHODS.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Unloading method</Label>
              <Select value={get("unloadingMethod")} onChange={(e) => set("unloadingMethod", e.target.value)}>
                <option value="">Any</option>
                {LOADING_METHODS.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>Service</Label>
            <Select value={get("service")} onChange={(e) => set("service", e.target.value)}>
              <option value="">Any service</option>
              {SERVICE_TYPES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Minimum rating</Label>
              <Select value={get("minRating")} onChange={(e) => set("minRating", e.target.value)}>
                <option value="">Any rating</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
              </Select>
            </div>
            <div>
              <Label>Completed jobs</Label>
              <Select value={get("minCompletedJobs")} onChange={(e) => set("minCompletedJobs", e.target.value)}>
                <option value="">Any</option>
                {[10, 25, 50, 100].map((v) => <option key={v} value={v}>{v}+ jobs</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Availability</Label>
              <Select value={get("available")} onChange={(e) => set("available", e.target.value)}>
                <option value="">Any</option>
                <option value="1">Available</option>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select value={get("language")} onChange={(e) => set("language", e.target.value)}>
                <option value="">Any language</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <CheckFilter label="Fragile cargo" active={get("fragile") === "1"} onToggle={(on) => set("fragile", on ? "1" : "")} />
            <CheckFilter label="Need help with loading" active={get("loadingHelp") === "1"} onToggle={(on) => set("loadingHelp", on ? "1" : "")} />
            <CheckFilter label="Europe transport" active={get("europe") === "1"} onToggle={(on) => set("europe", on ? "1" : "")} />
            <CheckFilter label="Tail lift" active={get("tailLift") === "1"} onToggle={(on) => set("tailLift", on ? "1" : "")} />
          </div>

          <div>
            <Label>Comment</Label>
            <Textarea value={get("comment")} placeholder="Anything the carrier should know…" onChange={(e) => set("comment", e.target.value)} />
          </div>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full">
        <Search size={17} /> Find carrier
      </Button>
    </form>
  );
}

function CheckFilter({ label, active, onToggle }: { label: string; active: boolean; onToggle: (on: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
      <input type="checkbox" checked={active} onChange={(e) => onToggle(e.target.checked)} className="accent-brand w-4 h-4" />
      {label}
    </label>
  );
}

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function update(value: string) {
    const params = new URLSearchParams(sp.toString());
    // "rating" — типове сортування, тримаємо URL чистим
    if (value && value !== "rating") params.set("sort", value);
    else params.delete("sort");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={sp.get("sort") ?? "rating"} onChange={(e) => update(e.target.value)} className="w-52">
      <option value="rating">Highest rating</option>
      <option value="recommended">Recommended</option>
      <option value="price">Lowest price</option>
      <option value="reviews">Most reviews</option>
      <option value="jobs">Most completed jobs</option>
      <option value="newest">Newest carriers</option>
    </Select>
  );
}
