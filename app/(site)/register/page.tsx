import { TrendingUp, Users, Calculator, Star, CalendarCheck, Globe2 } from "lucide-react";
import { Container, SectionTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterForm } from "@/components/features/register-form";
import { prisma } from "@/lib/db";
import { SERVICE_TYPES } from "@/lib/enums";

export const metadata = { title: "Become a Partner" };

export default async function RegisterPage() {
  const areaRows = await prisma.area.findMany({ orderBy: { type: "asc" }, select: { name: true } });
  const areas = areaRows.map((a) => a.name);

  return (
    <>
      <section className="bg-ink-strong text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-25" />
        <Container className="relative">
          <div className="max-w-2xl">
            <Badge variant="soft" className="mb-5 bg-brand/20 text-brand-bright">Become a Carrier</Badge>
            <h1 className="display-lg text-white">Grow your moving business with REVORA MOVE</h1>
            <p className="text-white/70 mt-4 text-lg">
              Get new bookings, manage your calendar, set your own rates and receive online booking
              requests — all from one platform. No commission taken online.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-10 max-w-3xl">
            {[
              [Users, "New customers"], [Calculator, "Automatic quotes"], [Star, "Ratings & reviews"],
              [CalendarCheck, "Availability calendar"], [Globe2, "UK & Europe work"], [TrendingUp, "Grow your profile"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Users;
              return (
                <div key={label as string} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                  <I size={18} className="text-brand-bright" /> <span className="text-sm">{label as string}</span>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <SectionTitle eyebrow="Registration" title="Join in a few steps" align="center"
            subtitle="Your profile goes live only after our team verifies your documents." />
          <RegisterForm areas={areas} services={SERVICE_TYPES} />
        </Container>
      </section>
    </>
  );
}
