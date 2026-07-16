"use client";

import { useState } from "react";
import { Truck, Plus, Upload, Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { VEHICLE_TYPES, VEHICLE_LABELS, BODY_TYPES, type VehicleType } from "@/lib/enums";
import {
  saveVehicleAction, deleteVehicleAction,
  uploadVehiclePhotoAction, deleteVehiclePhotoAction, setPrimaryPhotoAction,
} from "@/app/(dash)/carrier/actions";

export type ManagedPhoto = { id: string; url: string };
export type ManagedVehicle = {
  id: string; vehicleType: string; make: string; model: string; year: number;
  registrationNumber: string; bodyType: string | null; loadCapacityKg: number | null;
  internalLengthCm: number | null; internalWidthCm: number | null; internalHeightCm: number | null;
  volumeM3: number | null; tailLift: boolean; isActive: boolean; photos: ManagedPhoto[];
};

export function VehicleManager({ vehicles }: { vehicles: ManagedVehicle[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-strong">Vehicle management</h2>
        <Button variant="primary" size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> Add vehicle
        </Button>
      </div>

      {adding && (
        <Card className="p-5">
          <h3 className="font-semibold text-ink-strong mb-4">New vehicle</h3>
          <VehicleForm onDone={() => setAdding(false)} />
        </Card>
      )}

      <div className="space-y-6">
        {vehicles.map((v) => <VehicleCard key={v.id} v={v} />)}
        {vehicles.length === 0 && !adding && (
          <Card className="p-10 text-center text-muted">No vehicles yet. Add your first one.</Card>
        )}
      </div>
    </div>
  );
}

function VehicleCard({ v }: { v: ManagedVehicle }) {
  const [editing, setEditing] = useState(false);

  return (
    <Card className="p-4">
      {/* Photos */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {v.photos.map((p, i) => (
          <div key={p.id} className="relative shrink-0 w-32 h-24 rounded-lg overflow-hidden border border-line group/photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 text-[10px] font-semibold bg-brand text-white px-1.5 py-0.5 rounded-full">Primary</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 justify-end p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity">
              {i !== 0 && (
                <form action={setPrimaryPhotoAction}>
                  <input type="hidden" name="photoId" value={p.id} />
                  <button type="submit" className="text-white/90 hover:text-white" title="Make primary"><Star size={16} /></button>
                </form>
              )}
              <form action={deleteVehiclePhotoAction}>
                <input type="hidden" name="photoId" value={p.id} />
                <button type="submit" className="text-white/90 hover:text-danger" title="Delete photo"><Trash2 size={16} /></button>
              </form>
            </div>
          </div>
        ))}

        {/* Upload tile */}
        <form action={uploadVehiclePhotoAction} className="shrink-0">
          <input type="hidden" name="vehicleId" value={v.id} />
          <label className="w-32 h-24 rounded-lg border-2 border-dashed border-line grid place-items-center cursor-pointer hover:border-brand text-muted hover:text-brand transition-colors">
            <span className="flex flex-col items-center text-xs"><Upload size={18} /><span className="mt-1">Add photo</span></span>
            <input
              type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
            />
          </label>
        </form>
      </div>

      {/* Summary + toggle */}
      <div className="flex items-center justify-between gap-3 mt-3">
        <div className="min-w-0">
          <h3 className="font-bold text-ink-strong flex items-center gap-2">
            <Truck size={16} /> {v.make} {v.model}
            {!v.isActive && <Badge variant="neutral" size="sm">Off</Badge>}
          </h3>
          <p className="text-sm text-muted truncate">
            {VEHICLE_LABELS[v.vehicleType as VehicleType] ?? v.vehicleType} · {v.year} · {v.registrationNumber}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
          {editing ? "Close" : "Edit"}
        </Button>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-line">
          <VehicleForm v={v} onDone={() => setEditing(false)} />
        </div>
      )}
    </Card>
  );
}

function VehicleForm({ v, onDone }: { v?: ManagedVehicle; onDone: () => void }) {
  const val = (n: number | null | undefined) => (n ?? "") as number | "";
  return (
    <form action={saveVehicleAction} className="space-y-4">
      {v && <input type="hidden" name="id" value={v.id} />}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Vehicle type</Label>
          <Select name="vehicleType" defaultValue={v?.vehicleType ?? "VAN_LARGE"}>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{VEHICLE_LABELS[t]}</option>)}
          </Select>
        </div>
        <div>
          <Label>Body type</Label>
          <Select name="bodyType" defaultValue={v?.bodyType ?? ""}>
            <option value="">—</option>
            {BODY_TYPES.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </Select>
        </div>
        <div><Label>Make</Label><Input name="make" defaultValue={v?.make ?? ""} required /></div>
        <div><Label>Model</Label><Input name="model" defaultValue={v?.model ?? ""} required /></div>
        <div><Label>Year</Label><Input name="year" type="number" defaultValue={v?.year ?? ""} placeholder="2020" /></div>
        <div><Label>Reg. number</Label><Input name="registrationNumber" defaultValue={v?.registrationNumber ?? ""} required /></div>
        <div><Label>Load capacity (kg)</Label><Input name="loadCapacityKg" type="number" defaultValue={val(v?.loadCapacityKg)} /></div>
        <div><Label>Volume (m³)</Label><Input name="volumeM3" type="number" step="0.1" defaultValue={val(v?.volumeM3)} /></div>
      </div>
      <div>
        <Label>Internal dimensions (cm) — L × W × H</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input name="internalLengthCm" type="number" placeholder="Length" defaultValue={val(v?.internalLengthCm)} />
          <Input name="internalWidthCm" type="number" placeholder="Width" defaultValue={val(v?.internalWidthCm)} />
          <Input name="internalHeightCm" type="number" placeholder="Height" defaultValue={val(v?.internalHeightCm)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="tailLift" defaultChecked={v?.tailLift ?? false} className="accent-brand w-4 h-4" /> Tail lift</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={v?.isActive ?? true} className="accent-brand w-4 h-4" /> Active (shown in catalogue)</label>
      </div>
      <div className="flex items-center justify-between pt-1">
        {v ? (
          <button type="submit" formAction={deleteVehicleAction} className="text-danger text-sm inline-flex items-center gap-1.5 hover:underline">
            <Trash2 size={14} /> Delete
          </button>
        ) : <span />}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
          <Button type="submit" size="sm">Save vehicle</Button>
        </div>
      </div>
    </form>
  );
}
