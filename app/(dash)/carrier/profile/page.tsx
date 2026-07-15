import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/field";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfileAction } from "../actions";

export default async function CarrierProfilePage() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({
    where: { userId: session!.sub },
    include: { areas: { include: { area: true } }, services: { include: { service: true } } },
  });
  if (!carrier) return <p>No carrier profile.</p>;

  return (
    <form action={updateProfileAction} className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-ink-strong">Profile settings</h2>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label htmlFor="companyName">Company name</Label><Input id="companyName" name="companyName" defaultValue={carrier.companyName ?? ""} placeholder="Owner driver" /></div>
          <div><Label htmlFor="city">Base city</Label><Input id="city" name="city" defaultValue={carrier.city} required /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label htmlFor="experienceYears">Experience (years)</Label><Input id="experienceYears" name="experienceYears" type="number" min="0" defaultValue={carrier.experienceYears} /></div>
          <div>
            <Label>Coverage</Label>
            <label className="flex items-center gap-2 text-sm text-ink h-12 rounded-xl border border-line bg-white px-4 cursor-pointer hover:border-brand transition-colors">
              <input type="checkbox" name="europeTransport" defaultChecked={carrier.europeTransport} className="accent-brand w-4 h-4 shrink-0" />
              Offers Europe transport
            </label>
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={carrier.description ?? ""} rows={4} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-ink-strong mb-3">Coverage & services</h3>
        <p className="text-sm text-muted mb-2">Areas: {carrier.areas.map((a) => a.area.name).join(", ") || "—"}</p>
        <p className="text-sm text-muted">Services: {carrier.services.map((s) => s.service.name).join(", ") || "—"}</p>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">Save profile</Button>
      </div>
    </form>
  );
}
