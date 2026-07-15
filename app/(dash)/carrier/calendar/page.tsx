import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toggleAvailabilityAction } from "../actions";

function nextDays(count: number): Date[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

export default async function CalendarPage() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({ where: { userId: session!.sub } });
  if (!carrier) return <p>No carrier profile.</p>;

  const days = nextDays(28);
  const blocks = await prisma.availability.findMany({
    where: { carrierId: carrier.id, date: { gte: days[0], lte: days[days.length - 1] } },
  });
  const blockedSet = new Set(blocks.filter((b) => b.isBlocked).map((b) => new Date(b.date).toDateString()));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-ink-strong">Availability calendar</h2>
        <p className="text-muted text-sm mt-1">Tap a day to block or unblock it. Blocked days hide you from search for that date.</p>
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const blocked = blockedSet.has(d.toDateString());
            return (
              <form key={d.toISOString()} action={toggleAvailabilityAction}>
                <input type="hidden" name="date" value={d.toISOString().slice(0, 10)} />
                <button
                  type="submit"
                  className={`w-full aspect-square rounded-xl border text-center flex flex-col items-center justify-center transition-colors ${
                    blocked
                      ? "bg-surface-soft border-line text-muted line-through"
                      : "bg-brand-soft/40 border-brand/30 text-ink-strong hover:border-brand"
                  }`}
                >
                  <span className="text-[10px] uppercase">{d.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                  <span className="text-base font-bold">{d.getDate()}</span>
                </button>
              </form>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-soft border border-brand/30" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-surface-soft border border-line" /> Blocked</span>
        </div>
      </Card>
    </div>
  );
}
