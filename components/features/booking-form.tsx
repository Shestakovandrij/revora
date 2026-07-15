"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check, MapPin, Home, Package, User, Info, ArrowRight, ArrowLeft, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { computeEstimate, type PricingRates } from "@/lib/pricing";
import { estimateDistanceMiles, isInternational } from "@/lib/uk-geo";
import { VEHICLE_TYPES, VEHICLE_LABELS, CARGO_TYPES } from "@/lib/enums";
import { createBookingAction, type BookingResult } from "@/app/(site)/book/actions";

type Values = Record<string, string | boolean>;

const STEPS = [
  { title: "Route", icon: MapPin },
  { title: "Property", icon: Home },
  { title: "Move", icon: Package },
  { title: "Contact", icon: User },
];

export function BookingForm({
  carrierSlug,
  carrierName,
  rates,
  services,
  defaults = {},
}: {
  carrierSlug: string;
  carrierName: string;
  rates: PricingRates;
  services: { code: string; name: string }[];
  defaults?: Record<string, string>;
}) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>({
    serviceCode: defaults.service || services[0]?.code || "",
    pickupAddress: defaults.from ?? "",
    deliveryAddress: defaults.to ?? "",
    date: defaults.date ?? "",
    pickupFloor: "0",
    deliveryFloor: "0",
    vehicleType: defaults.vehicleType ?? "",
    numberOfHelpers: "0",
    cargoType: defaults.cargoType ?? "",
    cargoWeightKg: defaults.weightKg ?? "",
    cargoLengthCm: defaults.lengthCm ?? "",
    cargoWidthCm: defaults.widthCm ?? "",
    cargoHeightCm: defaults.heightCm ?? "",
    cargoVolumeM3: defaults.volumeM3 ?? "",
    cargoPlaces: defaults.cargoPlaces ?? "",
    loadingMethod: defaults.loadingMethod ?? "",
    unloadingMethod: defaults.unloadingMethod ?? "",
    fragile: defaults.fragile === "1",
    loadingHelp: defaults.loadingHelp === "1",
    additionalNotes: defaults.comment ?? "",
    liftAvailable: false,
    packing: false,
    assembly: false,
    sameDay: false,
  });
  const [result, setResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (k: string, val: string | boolean) => setV((p) => ({ ...p, [k]: val }));
  const str = (k: string) => String(v[k] ?? "");
  const bool = (k: string) => Boolean(v[k]);

  // Live-оцінка (клієнтський fallback-розрахунок відстані)
  const estimate = useMemo(() => {
    const from = str("pickupAddress");
    const to = str("deliveryAddress");
    if (!from || !to) return null;
    const dist = estimateDistanceMiles(from, to) ?? 15;
    return computeEstimate(
      {
        distanceMiles: dist,
        numberOfHelpers: Number(str("numberOfHelpers")) || 0,
        pickupFloor: Number(str("pickupFloor")) || 0,
        deliveryFloor: Number(str("deliveryFloor")) || 0,
        liftAvailable: bool("liftAvailable"),
        packing: bool("packing"),
        assembly: bool("assembly"),
        sameDay: bool("sameDay"),
        international: isInternational(from, to),
      },
      rates
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, rates]);

  function next() {
    setError(null);
    if (step === 0 && (!str("pickupAddress") || !str("deliveryAddress") || !str("date"))) {
      setError("Please fill pickup, delivery and date.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function submit() {
    setError(null);
    if (!str("contactName") || !str("contactPhone") || !str("contactEmail")) {
      setError("Please provide your contact details.");
      return;
    }
    const fd = new FormData();
    fd.set("carrierSlug", carrierSlug);
    Object.entries(v).forEach(([k, val]) => fd.set(k, typeof val === "boolean" ? (val ? "true" : "") : val));
    startTransition(async () => {
      const res = await createBookingAction(fd);
      setResult(res);
      if (!res.ok) setError(res.error);
    });
  }

  // ---- Підтвердження ----
  if (result?.ok) {
    return (
      <Card className="p-8 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-full bg-brand-soft grid place-items-center mx-auto mb-4">
          <PartyPopper className="text-brand-dark" />
        </div>
        <h2 className="text-2xl font-bold text-ink-strong">Request sent to {result.carrierName}!</h2>
        <p className="text-muted mt-2">
          Your booking reference is <span className="font-bold text-ink">{result.reference}</span>.
          The carrier will review and confirm your request.
        </p>
        <div className="mt-6 rounded-xl bg-surface-soft border border-line p-5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-muted text-sm">Estimated price</span>
            <span className="text-2xl font-bold text-ink-strong">{formatPrice(result.total)}</span>
          </div>
          <p className="text-xs text-muted mt-2">
            This is an estimate only. You pay the carrier directly — no payment is taken online.
          </p>
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <Button href="/catalog" variant="outline">Browse more carriers</Button>
          <Button href="/">Back to home</Button>
        </div>
      </Card>
    );
  }

  const StepIcon = STEPS[step].icon;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <Card className="p-6">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-semibold shrink-0 transition-colors ${
                i < step ? "bg-brand text-white" : i === step ? "bg-ink-strong text-white" : "bg-surface-soft text-muted"
              }`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-brand" : "bg-line"}`} />}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-ink-strong flex items-center gap-2 mb-5">
          <StepIcon size={18} className="text-brand-dark" /> {STEPS[step].title}
        </h2>

        {/* STEP 0 — ROUTE */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Service type</Label>
              <Select value={str("serviceCode")} onChange={(e) => set("serviceCode", e.target.value)}>
                {services.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Pickup address</Label><Input value={str("pickupAddress")} onChange={(e) => set("pickupAddress", e.target.value)} placeholder="e.g. London" /></div>
              <div><Label>Delivery address</Label><Input value={str("deliveryAddress")} onChange={(e) => set("deliveryAddress", e.target.value)} placeholder="e.g. Manchester" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Date</Label><Input type="date" value={str("date")} onChange={(e) => set("date", e.target.value)} /></div>
              <div><Label>Preferred time</Label><Input type="time" value={str("preferredTime")} onChange={(e) => set("preferredTime", e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* STEP 1 — PROPERTY */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Property type</Label>
              <Select value={str("propertyType")} onChange={(e) => set("propertyType", e.target.value)}>
                <option value="">Select…</option>
                {["Studio", "1-bed flat", "2-bed flat", "House", "Office", "Storage unit"].map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Pickup floor</Label><Input type="number" min={0} value={str("pickupFloor")} onChange={(e) => set("pickupFloor", e.target.value)} /></div>
              <div><Label>Delivery floor</Label><Input type="number" min={0} value={str("deliveryFloor")} onChange={(e) => set("deliveryFloor", e.target.value)} /></div>
            </div>
            <Toggle label="Lift available" checked={bool("liftAvailable")} onChange={(c) => set("liftAvailable", c)} />
          </div>
        )}

        {/* STEP 2 — MOVE */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Vehicle size</Label>
                <Select value={str("vehicleType")} onChange={(e) => set("vehicleType", e.target.value)}>
                  <option value="">Recommend for me</option>
                  {VEHICLE_TYPES.map((vt) => <option key={vt} value={vt}>{VEHICLE_LABELS[vt]}</option>)}
                </Select>
              </div>
              <div>
                <Label>Number of helpers</Label>
                <Select value={str("numberOfHelpers")} onChange={(e) => set("numberOfHelpers", e.target.value)}>
                  {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Cargo type</Label>
                <Select value={str("cargoType")} onChange={(e) => set("cargoType", e.target.value)}>
                  <option value="">Select…</option>
                  {CARGO_TYPES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </Select>
              </div>
              <div><Label>Weight (kg)</Label><Input type="number" min={0} value={str("cargoWeightKg")} onChange={(e) => set("cargoWeightKg", e.target.value)} placeholder="e.g. 100" /></div>
            </div>
            <div>
              <Label>Cargo dimensions (cm)</Label>
              <div className="grid grid-cols-3 gap-3">
                <Input type="number" min={0} value={str("cargoLengthCm")} onChange={(e) => set("cargoLengthCm", e.target.value)} placeholder="Length" />
                <Input type="number" min={0} value={str("cargoWidthCm")} onChange={(e) => set("cargoWidthCm", e.target.value)} placeholder="Width" />
                <Input type="number" min={0} value={str("cargoHeightCm")} onChange={(e) => set("cargoHeightCm", e.target.value)} placeholder="Height" />
              </div>
            </div>
            <div><Label>Item list</Label><Textarea value={str("itemsList")} onChange={(e) => set("itemsList", e.target.value)} placeholder="e.g. sofa, double bed, 10 boxes, fridge…" /></div>
            <div className="flex flex-wrap gap-4">
              <Toggle label="Fragile cargo" checked={bool("fragile")} onChange={(c) => set("fragile", c)} />
              <Toggle label="Help with loading" checked={bool("loadingHelp")} onChange={(c) => set("loadingHelp", c)} />
              <Toggle label="Packing" checked={bool("packing")} onChange={(c) => set("packing", c)} />
              <Toggle label="Assembly" checked={bool("assembly")} onChange={(c) => set("assembly", c)} />
              <Toggle label="Same day" checked={bool("sameDay")} onChange={(c) => set("sameDay", c)} />
            </div>
          </div>
        )}

        {/* STEP 3 — CONTACT */}
        {step === 3 && (
          <div className="space-y-4">
            <div><Label>Full name</Label><Input value={str("contactName")} onChange={(e) => set("contactName", e.target.value)} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={str("contactPhone")} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+44…" /></div>
              <div><Label>Email</Label><Input type="email" value={str("contactEmail")} onChange={(e) => set("contactEmail", e.target.value)} /></div>
            </div>
            <div><Label>Additional notes</Label><Textarea value={str("additionalNotes")} onChange={(e) => set("additionalNotes", e.target.value)} placeholder="Anything the carrier should know…" /></div>
            <p className="text-xs text-muted flex items-center gap-1"><Info size={13} /> No payment is taken online. You'll pay the carrier directly.</p>
          </div>
        )}

        {error && <p className="text-danger text-sm mt-4">{error}</p>}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={16} /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Next <ArrowRight size={16} /></Button>
          ) : (
            <Button onClick={submit} disabled={pending}>{pending ? "Sending…" : "Send booking request"}</Button>
          )}
        </div>
      </Card>

      {/* LIVE ESTIMATE */}
      <Card className="p-5 lg:sticky lg:top-24">
        <p className="text-sm text-muted">Booking with</p>
        <p className="font-bold text-ink-strong">{carrierName}</p>
        <div className="mt-4 pt-4 border-t border-line">
          <p className="text-sm text-muted mb-1">Estimated price</p>
          {estimate ? (
            <>
              <p className="text-3xl font-bold text-ink-strong">{formatPrice(estimate.total)}</p>
              <div className="mt-3 space-y-1 max-h-52 overflow-auto [mask-image:linear-gradient(to_bottom,#000_88%,transparent)] pr-1">
                {estimate.lines.map((l) => (
                  <div key={l.label} className="flex justify-between text-xs">
                    <span className="text-muted">{l.label}</span>
                    <span className="text-ink font-medium">{formatPrice(l.amount)}</span>
                  </div>
                ))}
                {estimate.minimumApplied && <p className="text-xs text-brand-dark pt-1">Minimum charge applied</p>}
              </div>
              <p className="text-[11px] text-muted mt-3">Estimate only — not an invoice. ~{estimate.distanceMiles} mi.</p>
            </>
          ) : (
            <p className="text-sm text-muted">Enter pickup & delivery to see your estimate.</p>
          )}
        </div>
        <p className="text-xs text-muted mt-4">
          Need another carrier?{" "}
          <Link href="/catalog" className="text-brand-dark hover:underline">Compare all</Link>
        </p>
      </Card>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-brand w-4 h-4" />
      {label}
    </label>
  );
}
