import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updatePricingAction } from "../actions";

const GROUPS: { title: string; fields: { name: string; label: string }[] }[] = [
  {
    title: "Core rates",
    fields: [
      { name: "baseRate", label: "Base rate (£)" },
      { name: "perMileRate", label: "Per mile (£)" },
      { name: "perHourRate", label: "Per hour (£)" },
      { name: "minimumCharge", label: "Minimum charge (£)" },
    ],
  },
  {
    title: "Labour & access",
    fields: [
      { name: "helperRate", label: "Per helper (£)" },
      { name: "floorSurcharge", label: "Per floor, no lift (£)" },
      { name: "noLiftSurcharge", label: "No lift surcharge (£)" },
    ],
  },
  {
    title: "Items & services",
    fields: [
      { name: "heavyItemSurcharge", label: "Heavy item (£)" },
      { name: "bulkyItemSurcharge", label: "Bulky item (£)" },
      { name: "packingSurcharge", label: "Packing (£)" },
      { name: "assemblySurcharge", label: "Assembly (£)" },
    ],
  },
  {
    title: "Timing",
    fields: [
      { name: "urgencySurcharge", label: "Urgency (£)" },
      { name: "sameDaySurcharge", label: "Same day (£)" },
      { name: "eveningNightSurcharge", label: "Evening / night (£)" },
      { name: "weekendHolidaySurcharge", label: "Weekend / holiday (£)" },
    ],
  },
  {
    title: "International & extras",
    fields: [
      { name: "internationalBase", label: "International base (£)" },
      { name: "tollsFlat", label: "Tolls (£)" },
      { name: "parkingFlat", label: "Parking (£)" },
      { name: "waitingPerHour", label: "Waiting / hour (£)" },
      { name: "extraStopRate", label: "Extra stop (£)" },
    ],
  },
];

export default async function PricingPage() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({
    where: { userId: session!.sub },
    include: { pricing: true },
  });
  if (!carrier) return <p>No carrier profile.</p>;
  const p = carrier.pricing as Record<string, number | null> | null;

  return (
    <form action={updatePricingAction} className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-ink-strong">Pricing settings</h2>
        <p className="text-muted text-sm mt-1">
          These rates drive your automatic quote estimates. Leave a field blank to skip that surcharge.
        </p>
      </div>

      {GROUPS.map((g) => (
        <Card key={g.title} className="p-5">
          <h3 className="font-semibold text-ink-strong mb-4">{g.title}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {g.fields.map((f) => (
              <div key={f.name}>
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  name={f.name}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={p?.[f.name] ?? ""}
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" size="lg">Save pricing</Button>
      </div>
    </form>
  );
}
