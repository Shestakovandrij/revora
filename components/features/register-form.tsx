"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { BUSINESS_TYPES, VEHICLE_TYPES, VEHICLE_LABELS } from "@/lib/enums";
import { registerCarrierAction, type RegisterResult } from "@/app/(auth)/register/actions";

const STEPS = ["Account", "Personal", "Company", "Vehicle", "Coverage", "Services", "Documents", "Pricing", "Review"];

export function RegisterForm({
  areas,
  services,
}: {
  areas: string[];
  services: { code: string; name: string }[];
}) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Record<string, string | boolean>>({ businessType: "OWNER_DRIVER", vehicleType: "VAN_LARGE" });
  const [areaSel, setAreaSel] = useState<string[]>([]);
  const [svcSel, setSvcSel] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Підхопити контакт із швидкої форми банера (PartnerHeroForm):
  // 1) при монтуванні — із sessionStorage (напр. після переходу зі сторінки);
  // 2) наживо — через подію partner-lead (форма вже змонтована на цій сторінці).
  useEffect(() => {
    const merge = (d: Record<string, string>) =>
      setV((p) => ({ ...p, ...Object.fromEntries(Object.entries(d).filter(([, val]) => val)) }));
    try {
      const raw = sessionStorage.getItem("partner_lead");
      if (raw) { merge(JSON.parse(raw)); sessionStorage.removeItem("partner_lead"); }
    } catch {}
    const onLead = (e: Event) => merge((e as CustomEvent).detail as Record<string, string>);
    window.addEventListener("partner-lead", onLead);
    return () => window.removeEventListener("partner-lead", onLead);
  }, []);

  const set = (k: string, val: string | boolean) => setV((p) => ({ ...p, [k]: val }));
  const s = (k: string) => String(v[k] ?? "");
  const b = (k: string) => Boolean(v[k]);
  const toggle = (arr: string[], setArr: (a: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  function submit() {
    setError(null);
    const payload = {
      ...v,
      areas: areaSel,
      services: svcSel,
      europeTransport: b("europeTransport"),
      tailLift: b("tailLift"),
    };
    start(async () => {
      const res: RegisterResult = await registerCarrierAction(payload);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-brand-soft grid place-items-center mx-auto mb-4">
          <ShieldCheck className="text-brand-dark" />
        </div>
        <h2 className="text-2xl font-bold text-ink-strong">Application submitted!</h2>
        <p className="text-muted mt-2">
          Your profile status is <span className="font-semibold text-ink">Pending Verification</span>. Our team
          reviews your documents before your profile goes live in the catalogue.
        </p>
        <Button href="/carrier" size="lg" className="mt-6">Go to dashboard</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 max-w-2xl mx-auto rounded-[24px] shadow-[var(--shadow-soft)]">
      {/* Progress header */}
      <div className="mb-7">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <div className="eyebrow mb-1.5">Carrier registration</div>
            <h2 className="text-xl font-bold text-ink-strong leading-tight">{STEPS[step]}</h2>
          </div>
          <div className="text-right shrink-0">
            <div className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-none">
              <span className="text-brand">{String(step + 1).padStart(2, "0")}</span>
              <span className="text-line">/{String(STEPS.length).padStart(2, "0")}</span>
            </div>
            <div className="text-[11px] text-muted mt-1">{Math.round((step / (STEPS.length - 1)) * 100)}% complete</div>
          </div>
        </div>

        {/* Full-width connected stepper — completed steps are clickable */}
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
              <button
                type="button"
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                aria-label={label}
                aria-current={i === step ? "step" : undefined}
                className={`relative grid place-items-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[11px] sm:text-xs font-semibold shrink-0 transition-all duration-300 ${
                  i < step
                    ? "bg-brand text-white hover:bg-brand-dark cursor-pointer"
                    : i === step
                    ? "bg-ink-strong text-white ring-4 ring-ink-strong/10"
                    : "bg-surface-soft text-muted border border-line cursor-not-allowed"
                }`}
              >
                {i < step ? <Check size={13} /> : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[3px] mx-1 sm:mx-1.5 rounded-full bg-line overflow-hidden">
                  <div className={`h-full rounded-full bg-brand origin-left transition-transform duration-500 ${i < step ? "scale-x-100" : "scale-x-0"}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div><Label>Email</Label><Input type="email" value={s("email")} onChange={(e) => set("email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={s("phone")} onChange={(e) => set("phone", e.target.value)} placeholder="+44…" /></div>
          <div><Label>Password</Label><Input type="password" value={s("password")} onChange={(e) => set("password", e.target.value)} /></div>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>First name</Label><Input value={s("firstName")} onChange={(e) => set("firstName", e.target.value)} /></div>
            <div><Label>Last name</Label><Input value={s("lastName")} onChange={(e) => set("lastName", e.target.value)} /></div>
          </div>
          <div><Label>Base city</Label><Input value={s("city")} onChange={(e) => set("city", e.target.value)} placeholder="e.g. London" /></div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div><Label>Company name (optional)</Label><Input value={s("companyName")} onChange={(e) => set("companyName", e.target.value)} /></div>
          <div>
            <Label>Business type</Label>
            <Select value={s("businessType")} onChange={(e) => set("businessType", e.target.value)}>
              {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
            </Select>
          </div>
          <div><Label>Experience (years)</Label><Input type="number" min="0" value={s("experienceYears")} onChange={(e) => set("experienceYears", e.target.value)} /></div>
          <div><Label>About you / company</Label><Textarea value={s("description")} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label>Vehicle type</Label>
            <Select value={s("vehicleType")} onChange={(e) => set("vehicleType", e.target.value)}>
              {VEHICLE_TYPES.map((vt) => <option key={vt} value={vt}>{VEHICLE_LABELS[vt]}</option>)}
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Make</Label><Input value={s("make")} onChange={(e) => set("make", e.target.value)} /></div>
            <div><Label>Model</Label><Input value={s("model")} onChange={(e) => set("model", e.target.value)} /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><Label>Year</Label><Input type="number" value={s("year")} onChange={(e) => set("year", e.target.value)} placeholder="2020" /></div>
            <div><Label>Reg. number</Label><Input value={s("registrationNumber")} onChange={(e) => set("registrationNumber", e.target.value)} /></div>
            <div><Label>Max load (kg)</Label><Input type="number" value={s("loadCapacityKg")} onChange={(e) => set("loadCapacityKg", e.target.value)} placeholder="e.g. 1200" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand w-4 h-4" checked={b("tailLift")} onChange={(e) => set("tailLift", e.target.checked)} /> Has tail lift</label>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <Label>Areas covered</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {areas.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-brand transition-colors">
                <input type="checkbox" className="accent-brand w-4 h-4 shrink-0" checked={areaSel.includes(a)} onChange={() => toggle(areaSel, setAreaSel, a)} /> {a}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" className="accent-brand w-4 h-4" checked={b("europeTransport")} onChange={(e) => set("europeTransport", e.target.checked)} /> Offer UK ↔ Europe transport</label>
        </div>
      )}
      {step === 5 && (
        <div className="space-y-2">
          <Label>Services offered</Label>
          <div className="grid sm:grid-cols-2 gap-2">
            {services.map((sv) => (
              <label key={sv.code} className="flex items-center gap-2 text-sm border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-brand transition-colors">
                <input type="checkbox" className="accent-brand w-4 h-4 shrink-0" checked={svcSel.includes(sv.code)} onChange={() => toggle(svcSel, setSvcSel, sv.code)} /> {sv.name}
              </label>
            ))}
          </div>
        </div>
      )}
      {step === 6 && (
        <div className="space-y-3 text-sm text-muted">
          <p>You'll upload the required documents (Driving Licence, MOT, Motor Insurance, Goods In Transit, Public Liability{v.companyName ? ", Company Registration" : ""}) after signing up.</p>
          <p>Records are created with status <b className="text-ink">Pending Verification</b>. Only the status is ever shown publicly — never your files.</p>
        </div>
      )}
      {step === 7 && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Set your starting rates — you can fine-tune everything later in your dashboard.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Base rate (£)</Label><Input type="number" step="0.01" value={s("baseRate")} onChange={(e) => set("baseRate", e.target.value)} /></div>
            <div><Label>Per mile (£)</Label><Input type="number" step="0.01" value={s("perMileRate")} onChange={(e) => set("perMileRate", e.target.value)} /></div>
            <div><Label>Per hour (£)</Label><Input type="number" step="0.01" value={s("perHourRate")} onChange={(e) => set("perHourRate", e.target.value)} /></div>
            <div><Label>Minimum charge (£)</Label><Input type="number" step="0.01" value={s("minimumCharge")} onChange={(e) => set("minimumCharge", e.target.value)} /></div>
          </div>
        </div>
      )}
      {step === 8 && (
        <div className="space-y-2 text-sm">
          <Row label="Name" value={`${s("firstName")} ${s("lastName")}`} />
          <Row label="Email" value={s("email")} />
          <Row label="Company" value={s("companyName") || "Owner driver"} />
          <Row label="City" value={s("city")} />
          <Row label="Vehicle" value={`${s("make")} ${s("model")} (${VEHICLE_LABELS[s("vehicleType") as keyof typeof VEHICLE_LABELS] ?? s("vehicleType")})`} />
          <Row label="Areas" value={areaSel.join(", ") || "—"} />
          <Row label="Services" value={`${svcSel.length} selected`} />
          <Row label="Base / mile / hour" value={`£${s("baseRate") || 0} / £${s("perMileRate") || 0} / £${s("perHourRate") || 0}`} />
        </div>
      )}

      {error && <p className="text-danger text-sm mt-4">{error}</p>}

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
        <Button variant="ghost" onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0}><ArrowLeft size={16} /> Back</Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((x) => Math.min(STEPS.length - 1, x + 1))}>Next <ArrowRight size={16} /></Button>
        ) : (
          <Button onClick={submit} disabled={pending}>{pending ? "Submitting…" : "Submit application"}</Button>
        )}
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-line last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink text-right">{value}</span>
    </div>
  );
}
