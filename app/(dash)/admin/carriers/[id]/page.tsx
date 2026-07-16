import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Truck, Trash2, Plus, Star, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/field";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  BUSINESS_TYPES, VEHICLE_TYPES, VEHICLE_LABELS, BODY_TYPES,
  ORDER_STATUS_LABELS, type VehicleType, type OrderStatus,
} from "@/lib/enums";
import { adminUpdateCarrierAction, adminSaveVehicleAction, adminDeleteVehicleAction } from "../../actions";

const ymKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const ymLabel = (k: string) => {
  const [y, m] = k.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

export default async function AdminDriverPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month } = await searchParams;

  const carrier = await prisma.carrier.findUnique({
    where: { id },
    include: {
      user: true,
      vehicles: { include: { photos: { orderBy: { sortOrder: "asc" } } }, orderBy: { id: "asc" } },
    },
  });
  if (!carrier) notFound();

  const orders = await prisma.order.findMany({
    where: { carrierId: id },
    orderBy: { date: "desc" },
    take: 500,
  });

  // Місяці з поїздок водія
  const months = [...new Set(orders.map((o) => ymKey(new Date(o.date))))].sort().reverse();
  const filtered = month ? orders.filter((o) => ymKey(new Date(o.date)) === month) : orders;

  const completed = filtered.filter((o) => o.status === "COMPLETED").length;
  const cancelled = filtered.filter((o) => o.status === "CANCELLED").length;
  const active = filtered.filter((o) => !["COMPLETED", "CANCELLED", "DECLINED"].includes(o.status)).length;
  const estTotal = filtered.reduce((s, o) => s + (o.estimatedPrice || 0), 0);

  const name = carrier.companyName || carrier.user.name || "Carrier";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/carriers" className="text-sm text-muted hover:text-brand inline-flex items-center gap-1.5">
          <ArrowLeft size={15} /> Back to carriers
        </Link>
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-ink-strong">{name}</h1>
            <Badge variant="neutral" size="sm">{carrier.verificationStatus.replaceAll("_", " ")}</Badge>
            {carrier.isFeatured && <Badge variant="brand" size="sm">★ Featured</Badge>}
          </div>
          {carrier.isPublished && (
            <Button href={`/carrier/${carrier.slug}`} variant="ghost" size="sm"><ExternalLink size={14} /> View public profile</Button>
          )}
        </div>
        <p className="text-sm text-muted mt-1">{carrier.user.email}</p>
      </div>

      {/* ── Driver information (editable by admin) ── */}
      <Card className="p-5">
        <h2 className="font-bold text-ink-strong mb-4">Driver information</h2>
        <form action={adminUpdateCarrierAction} className="space-y-4">
          <input type="hidden" name="carrierId" value={carrier.id} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Contact name</Label><Input name="name" defaultValue={carrier.user.name ?? ""} /></div>
            <div><Label>Phone</Label><Input name="phone" defaultValue={carrier.user.phone ?? ""} /></div>
            <div><Label>Company name</Label><Input name="companyName" defaultValue={carrier.companyName ?? ""} placeholder="Owner driver" /></div>
            <div><Label>Base city</Label><Input name="city" defaultValue={carrier.city} required /></div>
            <div>
              <Label>Business type</Label>
              <Select name="businessType" defaultValue={carrier.businessType}>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
              </Select>
            </div>
            <div><Label>Experience (years)</Label><Input name="experienceYears" type="number" min="0" defaultValue={carrier.experienceYears} /></div>
          </div>
          <div><Label>Description</Label><Textarea name="description" defaultValue={carrier.description ?? ""} rows={3} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="europeTransport" defaultChecked={carrier.europeTransport} className="accent-brand w-4 h-4" /> Offers Europe transport
          </label>
          <div className="flex justify-end"><Button type="submit" size="sm">Save changes</Button></div>
        </form>
      </Card>

      {/* ── Vehicles (editable by admin) ── */}
      <Card className="p-5">
        <h2 className="font-bold text-ink-strong mb-4 flex items-center gap-2"><Truck size={18} /> Vehicles</h2>
        <div className="space-y-4">
          {carrier.vehicles.map((v) => (
            <div key={v.id} className="rounded-xl border border-line p-4">
              {v.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                  {v.photos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.id} src={p.url} alt="" className="shrink-0 w-24 h-16 rounded-md object-cover border border-line" />
                  ))}
                </div>
              )}
              <AdminVehicleForm carrierId={carrier.id} v={v} />
            </div>
          ))}
        </div>

        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-medium text-brand-dark inline-flex items-center gap-1.5"><Plus size={15} /> Add vehicle</summary>
          <div className="mt-4 rounded-xl border border-dashed border-line p-4">
            <AdminVehicleForm carrierId={carrier.id} />
          </div>
        </details>
      </Card>

      {/* ── Per-driver statistics with month filter ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h2 className="font-bold text-ink-strong flex items-center gap-2"><ClipboardList size={18} /> Trips & statistics</h2>
        </div>

        {/* Month filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
          <MonthPill href={`/admin/carriers/${id}`} active={!month} label={`All (${orders.length})`} />
          {months.map((m) => (
            <MonthPill key={m} href={`/admin/carriers/${id}?month=${m}`} active={month === m} label={ymLabel(m)} />
          ))}
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatTile label={month ? "Trips this month" : "Total trips"} value={String(filtered.length)} />
          <StatTile label="Completed" value={String(completed)} icon={<CheckCircle2 size={14} className="text-brand-dark" />} />
          <StatTile label="Cancelled" value={String(cancelled)} icon={<XCircle size={14} className="text-muted" />} />
          <StatTile label="Active now" value={String(active)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatTile label="Rating" value={carrier.avgRating != null ? carrier.avgRating.toFixed(1) : "New"} icon={<Star size={14} className="text-brand-dark" />} />
          <StatTile label="Reviews" value={String(carrier.reviewCount)} />
          <StatTile label="Completion rate" value={carrier.completionRate != null ? `${carrier.completionRate}%` : "—"} />
          <StatTile label="Est. value" value={formatPrice(estTotal)} />
        </div>

        {/* Trips table */}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No trips in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-surface-soft text-muted text-xs">
                <tr>
                  <th className="text-left font-medium px-3 py-2.5">Ref</th>
                  <th className="text-left font-medium px-3 py-2.5">Route</th>
                  <th className="text-left font-medium px-3 py-2.5">Date</th>
                  <th className="text-right font-medium px-3 py-2.5">Est.</th>
                  <th className="text-left font-medium px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="px-3 py-2.5 font-medium text-ink">{o.reference}</td>
                    <td className="px-3 py-2.5 text-muted max-w-56 truncate">{o.pickupAddress} → {o.deliveryAddress}</td>
                    <td className="px-3 py-2.5 text-muted">{new Date(o.date).toLocaleDateString("en-GB")}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-ink">{formatPrice(o.estimatedPrice)}</td>
                    <td className="px-3 py-2.5"><Badge variant={o.status === "COMPLETED" ? "soft" : "outline"} size="sm">{ORDER_STATUS_LABELS[o.status as OrderStatus]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function MonthPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href} className={`shrink-0 text-sm font-medium rounded-full px-3.5 py-1.5 border whitespace-nowrap transition-colors ${active ? "bg-brand text-white border-brand" : "bg-white text-ink border-line hover:border-brand"}`}>
      {label}
    </Link>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-soft border border-line p-3">
      <div className="text-lg font-bold text-ink-strong flex items-center gap-1.5">{icon}{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}

type AdminVehicle = {
  id: string; vehicleType: string; make: string; model: string; year: number;
  registrationNumber: string; bodyType: string | null; loadCapacityKg: number | null;
  volumeM3: number | null; tailLift: boolean; isActive: boolean;
};

function AdminVehicleForm({ carrierId, v }: { carrierId: string; v?: AdminVehicle }) {
  const dv = (n: number | null | undefined) => (n ?? "") as number | "";
  return (
    <form action={adminSaveVehicleAction} className="space-y-3">
      <input type="hidden" name="carrierId" value={carrierId} />
      {v && <input type="hidden" name="id" value={v.id} />}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Type</Label>
          <Select name="vehicleType" defaultValue={v?.vehicleType ?? "VAN_LARGE"}>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{VEHICLE_LABELS[t as VehicleType]}</option>)}
          </Select>
        </div>
        <div><Label>Make</Label><Input name="make" defaultValue={v?.make ?? ""} required /></div>
        <div><Label>Model</Label><Input name="model" defaultValue={v?.model ?? ""} required /></div>
        <div><Label>Year</Label><Input name="year" type="number" defaultValue={v?.year ?? ""} /></div>
        <div><Label>Reg. number</Label><Input name="registrationNumber" defaultValue={v?.registrationNumber ?? ""} required /></div>
        <div>
          <Label>Body type</Label>
          <Select name="bodyType" defaultValue={v?.bodyType ?? ""}>
            <option value="">—</option>
            {BODY_TYPES.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </Select>
        </div>
        <div><Label>Capacity (kg)</Label><Input name="loadCapacityKg" type="number" defaultValue={dv(v?.loadCapacityKg)} /></div>
        <div><Label>Volume (m³)</Label><Input name="volumeM3" type="number" step="0.1" defaultValue={dv(v?.volumeM3)} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="tailLift" defaultChecked={v?.tailLift ?? false} className="accent-brand w-4 h-4" /> Tail lift</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={v?.isActive ?? true} className="accent-brand w-4 h-4" /> Active</label>
        <div className="ml-auto flex items-center gap-3">
          {v && (
            <button type="submit" formAction={adminDeleteVehicleAction} className="text-danger text-sm inline-flex items-center gap-1.5 hover:underline">
              <Trash2 size={14} /> Delete
            </button>
          )}
          <Button type="submit" size="sm">Save</Button>
        </div>
      </div>
    </form>
  );
}
