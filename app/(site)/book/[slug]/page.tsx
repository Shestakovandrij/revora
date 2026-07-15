import { notFound } from "next/navigation";
import { Container } from "@/components/ui/card";
import { BookingForm } from "@/components/features/booking-form";
import { prisma } from "@/lib/db";
import { SERVICE_TYPES } from "@/lib/enums";

export const metadata = { title: "Book a carrier" };

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const carrier = await prisma.carrier.findFirst({
    where: { slug, isPublished: true },
    include: {
      pricing: true,
      user: { select: { name: true } },
      services: { include: { service: true } },
    },
  });
  if (!carrier || !carrier.pricing) notFound();

  const carrierName = carrier.companyName || carrier.user.name || "Carrier";
  const services =
    carrier.services.length > 0
      ? carrier.services.map((s) => ({ code: s.service.code, name: s.service.name }))
      : SERVICE_TYPES;

  const rates = {
    currency: carrier.pricing.currency,
    baseRate: carrier.pricing.baseRate,
    perMileRate: carrier.pricing.perMileRate,
    perHourRate: carrier.pricing.perHourRate,
    minimumCharge: carrier.pricing.minimumCharge,
    helperRate: carrier.pricing.helperRate,
    floorSurcharge: carrier.pricing.floorSurcharge,
    noLiftSurcharge: carrier.pricing.noLiftSurcharge,
    packingSurcharge: carrier.pricing.packingSurcharge,
    assemblySurcharge: carrier.pricing.assemblySurcharge,
    sameDaySurcharge: carrier.pricing.sameDaySurcharge,
    internationalBase: carrier.pricing.internationalBase,
    tollsFlat: carrier.pricing.tollsFlat,
  };

  return (
    <Container className="py-10">
      <div className="eyebrow mb-3">Booking</div>
      <h1 className="display-md text-ink-strong mb-1">Book your move</h1>
      <p className="text-muted mb-8">Fill in your details to send a booking request to {carrierName}.</p>
      <BookingForm carrierSlug={carrier.slug} carrierName={carrierName} rates={rates} services={services} />
    </Container>
  );
}
