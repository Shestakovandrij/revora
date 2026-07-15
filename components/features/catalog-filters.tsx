"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input, Select, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { VEHICLE_TYPES, VEHICLE_LABELS, SERVICE_TYPES } from "@/lib/enums";

export function CatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const get = (k: string) => sp.get(k) ?? "";

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink-strong">Filters</h3>
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>Clear</Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Pickup</Label>
          <Input defaultValue={get("from")} placeholder="From" onBlur={(e) => update("from", e.target.value)} />
        </div>
        <div>
          <Label>Delivery</Label>
          <Input defaultValue={get("to")} placeholder="To" onBlur={(e) => update("to", e.target.value)} />
        </div>
        <div>
          <Label>Vehicle type</Label>
          <Select value={get("vehicleType")} onChange={(e) => update("vehicleType", e.target.value)}>
            <option value="">Any vehicle</option>
            {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{VEHICLE_LABELS[v]}</option>)}
          </Select>
        </div>
        <div>
          <Label>Service</Label>
          <Select value={get("service")} onChange={(e) => update("service", e.target.value)}>
            <option value="">Any service</option>
            {SERVICE_TYPES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </Select>
        </div>
        <div>
          <Label>Minimum rating</Label>
          <Select value={get("minRating")} onChange={(e) => update("minRating", e.target.value)}>
            <option value="">Any rating</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
          </Select>
        </div>

        <div className="space-y-2 pt-2 border-t border-line">
          <CheckFilter label="Europe transport" active={get("europe") === "1"} onToggle={(on) => update("europe", on ? "1" : "")} />
          <CheckFilter label="Tail lift" active={get("tailLift") === "1"} onToggle={(on) => update("tailLift", on ? "1" : "")} />
        </div>
      </div>
    </aside>
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
    if (value && value !== "recommended") params.set("sort", value);
    else params.delete("sort");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={sp.get("sort") ?? "recommended"} onChange={(e) => update(e.target.value)} className="w-52">
      <option value="recommended">Recommended</option>
      <option value="price">Lowest price</option>
      <option value="rating">Highest rating</option>
      <option value="reviews">Most reviews</option>
      <option value="jobs">Most completed jobs</option>
      <option value="newest">Newest carriers</option>
    </Select>
  );
}
