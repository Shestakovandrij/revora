import Link from "next/link";
import {
  Zap, Scale, ShieldCheck, Star, Wallet,
  MapPinned, Globe2, Truck, Eye, ArrowRight, ArrowUpRight, CheckCircle2,
} from "lucide-react";
import { Container, SectionTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/features/search-form";
import { CarrierCard } from "@/components/features/carrier-card";
import { StarRow } from "@/components/features/rating";
import { getTopCarriers, getPopularAreas, getPublishedReviews } from "@/server/services/carriers";
import { shortName } from "@/lib/utils";
import { Reveal, FadeUp, Stagger, StaggerItem, ZoomImage } from "@/components/motion/reveal";
import { ReviewsCarousel } from "@/components/features/reviews-carousel";
import { FaqAccordion } from "@/components/features/faq-accordion";

// Різкіші зображення (dest-*.jpg були низькороздільні → блюр при масштабуванні).
const DEST_IMAGES = [
  "/images/service-1.jpg",
  "/images/step-1.jpg",
  "/images/warehouse-wide.webp",
  "/images/service-2.jpg",
  "/images/step-3.jpg",
  "/images/cta.jpg",
  "/images/service-3.jpg",
  "/images/step-4.jpg",
];

// Карта покриття (детальна карта Європи, viewBox у map-space).
// Перша точка — хаб (London), решта — напрямки з дугами від хабу.
const MAP_VIEWBOX = "360 352 115 78";
const MAP_ORIGIN = { x: 360, y: 352, w: 115, h: 78 };
const MAP_CITIES = [
  { mx: 405, my: 389, label: "London", flag: "gb", hub: true },
  { mx: 410, my: 409, label: "France", flag: "fr" },
  { mx: 431, my: 391, label: "Germany", flag: "de" },
  { mx: 450, my: 388, label: "Poland", flag: "pl" },
];
const pinPct = (mx: number, my: number) => ({
  left: ((mx - MAP_ORIGIN.x) / MAP_ORIGIN.w) * 100,
  top: ((my - MAP_ORIGIN.y) / MAP_ORIGIN.h) * 100,
});

export default async function HomePage() {
  const [topCarriers, areas, reviews] = await Promise.all([
    getTopCarriers(4),
    getPopularAreas(),
    getPublishedReviews(12),
  ]);

  // Coverage layout: дві великі 2×2-картки по діагоналі (London зверху-ліворуч,
  // Northern Ireland знизу-праворуч). Впорядковуємо так, щоб NI став 8-м елементом —
  // тоді CSS grid auto-flow ставить його 2×2 у нижній правий кут.
  const FEATURED_COVERAGE = ["London", "Northern Ireland"];
  const coverageAreas = (() => {
    const london = areas.find((a) => a.name === "London");
    const ni = areas.find((a) => a.name === "Northern Ireland");
    const rest = areas.filter((a) => a.name !== "London" && a.name !== "Northern Ireland");
    const out: typeof areas = [];
    if (london) out.push(london);
    out.push(...rest.slice(0, 6));
    if (ni) out.push(ni);
    out.push(...rest.slice(6));
    return out.length ? out : areas;
  })();

  return (
    <>
      {/* ═══ HERO — split composition + integrated quote form ═══ */}
      <section className="relative overflow-hidden bg-halo border-b border-line">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <Container className="relative pt-8 lg:pt-12 pb-16">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
            <div>
              <FadeUp><div className="eyebrow mb-5">Secure & reliable moving · UK ↔ Europe</div></FadeUp>
              <FadeUp delay={0.08}>
                <h1 className="display-xl text-ink-strong">
                  Compare & book <span className="text-brand">verified movers</span> across the UK
                </h1>
              </FadeUp>
              <FadeUp delay={0.16}>
                <p className="text-lead text-muted mt-6 max-w-xl">
                  Enter your move, get instant quotes from available carriers, compare prices and
                  ratings, and book online. No upfront payment — you pay your driver directly.
                </p>
              </FadeUp>
            </div>

            <FadeUp delay={0.2} className="relative">
              <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[5/4] max-w-xl ml-auto rounded-[30px] overflow-hidden border border-line shadow-[var(--shadow-lift)]">
                <ZoomImage className="w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/hero-courier.webp" alt="Verified REVORA mover checking a delivery" className="w-full h-full object-cover" />
                </ZoomImage>
                <div className="absolute inset-0 bg-gradient-to-t from-ink-strong/30 via-transparent to-transparent" />
              </div>
              {/* Floating badges */}
              <div className="absolute -left-3 sm:-left-6 top-6 bg-white rounded-2xl border border-line shadow-[var(--shadow-soft)] px-4 py-3 flex items-center gap-2">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand-soft text-brand"><CheckCircle2 size={18} /></span>
                <div>
                  <p className="text-[11px] text-muted leading-none">Every carrier</p>
                  <p className="text-sm font-semibold text-ink-strong">Document-verified</p>
                </div>
              </div>
              <div className="absolute -right-2 sm:-right-4 bottom-8 bg-white rounded-2xl border border-line shadow-[var(--shadow-soft)] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <StarRow value={5} size={13} />
                  <span className="text-sm font-semibold text-ink-strong">4.8</span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">Avg. carrier rating</p>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.32} className="mt-12">
            <SearchForm />
          </FadeUp>

        </Container>
      </section>

      {/* ═══ CITIES & DIRECTIONS — image-led destination cards ═══ */}
      <section className="section-y">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <SectionTitle eyebrow="Coverage" title="Popular cities & directions"
              subtitle="From local Man & Van moves to international UK ↔ Europe transport." className="mb-0" />
            <Button href="/catalog" variant="primary" size="sm" className="hidden sm:inline-flex shrink-0">
              Browse all coverage <ArrowRight size={16} />
            </Button>
          </Reveal>

          <Stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[168px] gap-3.5">
            {coverageAreas.map((a, i) => {
              const featured = FEATURED_COVERAGE.includes(a.name);
              const isCountry = a.type === "COUNTRY";
              const href = isCountry ? `/catalog?to=${encodeURIComponent(a.name)}` : `/catalog?from=${encodeURIComponent(a.name)}`;
              return (
                <StaggerItem key={a.id} className={featured ? "col-span-2 row-span-2" : ""}>
                  <Link href={href} className="img-overlay-hover card-hover group relative block h-full w-full rounded-[18px] overflow-hidden border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={DEST_IMAGES[i % DEST_IMAGES.length]} alt={a.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-strong/95 via-ink-strong/55 to-ink-strong/10" />
                    <div className="img-overlay bg-brand/15" />
                    <div className="relative h-full flex flex-col justify-between p-4 [text-shadow:0_1px_8px_rgba(0,0,0,.45)]">
                      <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1">
                        <span className="relative inline-grid place-items-center">
                          <span className="pulse-dot col-start-1 row-start-1 w-2.5 h-2.5" />
                          <span className="col-start-1 row-start-1 w-1.5 h-1.5 rounded-full bg-brand-bright ring-1 ring-white/40" />
                        </span>
                        {isCountry ? "International" : "UK"}
                      </span>
                      <div>
                        <p className={`font-semibold text-white flex items-center gap-1.5 ${featured ? "text-2xl" : "text-[15px]"}`}>
                          {isCountry ? <Globe2 size={featured ? 20 : 15} /> : <MapPinned size={featured ? 20 : 15} />}
                          {isCountry ? `UK → ${a.name}` : a.name}
                        </p>
                        <p className="text-xs text-white/70 mt-1 flex items-center justify-between">
                          <span>{a._count.carriers} carrier{a._count.carriers === 1 ? "" : "s"}</span>
                          <ArrowUpRight size={16} className="text-white/70 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </p>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* ═══ COVERAGE MAP — pulsing pins over UK ↔ Europe ═══ */}
      <section className="pb-4">
        <Container>
          <Reveal className="rounded-[28px] border border-line bg-surface-soft/60 overflow-hidden relative">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] items-center gap-6 p-8 sm:p-10">
              <div>
                <div className="eyebrow mb-3">One platform, two continents</div>
                <h3 className="display-md text-ink-strong">Moving across the UK & into Europe</h3>
                <p className="text-muted mt-3 text-[15px] max-w-md">
                  Local moves in every UK nation and cross-border transport to nine European
                  countries — matched to carriers who actually run your route.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["England", "Scotland", "Wales", "NI", "France", "Germany", "Poland"].map((c) => (
                    <span key={c} className="text-xs font-medium rounded-full border border-line bg-white px-3 py-1.5 text-ink">{c}</span>
                  ))}
                </div>
              </div>
              <div className="relative w-full rounded-[18px] overflow-hidden ring-1 ring-line/70 shadow-[var(--shadow-soft)]" style={{ aspectRatio: "115 / 78" }}>
                {/* Детальна карта Європи (море + суша, країни покриття — синім) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/europe-map.svg" alt="Coverage across the UK and Europe" className="absolute inset-0 h-full w-full object-cover" />

                {/* Пунктирні дуги від London до напрямків */}
                <svg viewBox={MAP_VIEWBOX} preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                  {MAP_CITIES.filter((c) => !c.hub).map((c) => {
                    const hub = MAP_CITIES[0];
                    const cx = (hub.mx + c.mx) / 2;
                    const cy = Math.min(hub.my, c.my) - 12;
                    return (
                      <path
                        key={c.label}
                        d={`M ${hub.mx} ${hub.my} Q ${cx} ${cy} ${c.mx} ${c.my}`}
                        fill="none"
                        stroke="#146ef5"
                        strokeWidth="1.1"
                        strokeDasharray="3 3"
                        opacity="0.7"
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </svg>

                {/* Точки + завжди-видимі пігулки-мітки */}
                {MAP_CITIES.map((c) => {
                  const pos = pinPct(c.mx, c.my);
                  return (
                    <span
                      key={c.label}
                      className="absolute z-10 flex items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white pl-1 pr-2.5 py-1 shadow-[var(--shadow-lift)] border border-line/70 ring-1 ring-black/5"
                      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    >
                      <span className="relative grid place-items-center">
                        {c.hub && <span className={`pulse-dot col-start-1 row-start-1 rounded-full ${c.hub ? "w-6 h-6" : ""}`} />}
                        <span className={`relative col-start-1 row-start-1 rounded-full overflow-hidden ring-2 ring-white shadow-sm ${c.hub ? "w-7 h-7" : "w-6 h-6"}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/images/flags/${c.flag}.svg`} alt={c.label} className="h-full w-full object-cover" />
                        </span>
                      </span>
                      <span className="text-[13px] font-semibold text-ink-strong whitespace-nowrap">{c.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ═══ TOP CARRIERS ═══ */}
      <section className="section-y bg-surface-soft border-y border-line">
        <Container>
          <Reveal className="flex items-end justify-between mb-10 gap-4">
            <SectionTitle eyebrow="Top drivers" title="Trusted movers on REVORA" className="mb-0" />
            <Button href="/catalog" variant="primary" size="sm" className="hidden sm:inline-flex shrink-0">
              View all <ArrowRight size={16} />
            </Button>
          </Reveal>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {topCarriers.map((c) => <StaggerItem key={c.id}><CarrierCard carrier={c} /></StaggerItem>)}
          </Stagger>
        </Container>
      </section>

      {/* ═══ ADVANTAGES — asymmetric media rail + icon tiles ═══ */}
      <section id="services" className="section-y">
        <Container>
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
            {/* Left media rail */}
            <Reveal className="lg:sticky lg:top-28">
              <div className="eyebrow mb-3">Why REVORA MOVE</div>
              <h2 className="display-lg text-ink-strong">Everything you need to move with confidence</h2>
              <p className="text-muted mt-4 text-[15px] max-w-md">
                A self-serve marketplace built around trust: transparent estimates, verified
                carriers and real reviews — with no money ever changing hands online.
              </p>
              <div className="img-overlay-hover mt-7 relative rounded-[22px] overflow-hidden border border-line shadow-[var(--shadow-soft)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-1.jpg" alt="Professional movers loading a van" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-strong/70 via-ink-strong/10 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                  <p className="text-white font-semibold text-[15px]">Instant, transparent estimates</p>
                  <p className="text-white/70 text-xs mt-1">See exactly how each quote is built — base rate, distance, helpers and options.</p>
                </div>
              </div>
            </Reveal>

            {/* Right icon-tile grid */}
            <Stagger className="grid sm:grid-cols-2 gap-4">
              {[
                [Zap, "Instant Price Calculation", "Get estimated quotes in seconds based on carrier tariffs and your route."],
                [Scale, "Compare Multiple Drivers", "Side-by-side prices, ratings, vehicles and services."],
                [ShieldCheck, "Verified Carriers", "Every carrier is document-checked and manually approved."],
                [Star, "Real Ratings & Reviews", "Only from customers with completed jobs."],
                [Wallet, "No Upfront Payment", "Pay your driver directly — cash or as agreed. No deposit online."],
                [Globe2, "UK-Wide & Europe", "England, Scotland, Wales, NI + UK ↔ Europe transport."],
                [Truck, "Wide Vehicle Selection", "From small vans to 7.5t trucks and Luton vans."],
                [Eye, "Transparent Pricing", "See exactly how each estimate is built up."],
              ].map(([Icon, title, desc], i) => {
                const I = Icon as typeof Zap;
                const dark = i === 4; // "No Upfront Payment" — accent tile
                return (
                  <StaggerItem key={title as string}>
                    <div className={`card-hover h-full rounded-[18px] border p-5 ${dark ? "bg-ink-strong border-ink-strong text-white relative overflow-hidden" : "bg-white border-line shadow-[var(--shadow-whisper)]"}`}>
                      {dark && <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-brand/25 blur-[60px]" />}
                      <div className={`relative w-11 h-11 rounded-xl grid place-items-center mb-4 ${dark ? "bg-white/10 text-brand-bright" : "bg-brand-soft text-brand"}`}>
                        <I size={20} />
                      </div>
                      <h3 className={`relative font-semibold text-[16px] ${dark ? "text-white" : "text-ink-strong"}`}>{title as string}</h3>
                      <p className={`relative text-[14px] mt-1.5 leading-relaxed ${dark ? "text-white/65" : "text-muted"}`}>{desc as string}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* ═══ HOW IT WORKS — sticky-stacking image cards ═══ */}
      <section id="how" className="section-y bg-ink-strong text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/15 blur-[140px]" />
        <Container className="relative">
          <Reveal className="text-center mb-14 max-w-2xl mx-auto">
            <p className="eyebrow justify-center mb-3 !text-brand-bright">How it works</p>
            <h2 className="display-lg text-white">Book your move in 4 simple steps</h2>
            <p className="text-white/55 mt-4">Scroll through the flow — from your first quote to settling up with your driver.</p>
          </Reveal>

          <div className="space-y-6">
            {[
              ["Enter your move", "Route, date, property and items — takes under a minute.", "/images/step-1.jpg"],
              ["Compare quotes", "Instant estimates from available carriers, side by side.", "/images/step-2.jpg"],
              ["Book online", "Pick a carrier and send your request. They confirm.", "/images/step-3.jpg"],
              ["Pay the driver", "Settle directly — cash or as agreed. No online payment.", "/images/step-4.jpg"],
            ].map(([t, d, img], i) => (
              <div
                key={t}
                className="lg:sticky"
                style={{ top: `calc(96px + ${i * 22}px)` }}
              >
                <div className="rounded-[24px] border border-white/10 bg-[#0f0f12] overflow-hidden grid md:grid-cols-2 items-stretch shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]">
                  <div className={`p-8 sm:p-10 flex flex-col justify-center ${i % 2 === 1 ? "md:order-2" : ""}`}>
                    <div className="w-12 h-12 rounded-2xl bg-brand text-white font-semibold grid place-items-center mb-5 shadow-[var(--shadow-brand)] font-[family-name:var(--font-display)] text-lg">{i + 1}</div>
                    <h3 className="font-semibold text-2xl text-white">{t}</h3>
                    <p className="text-white/60 text-[15px] mt-3 max-w-sm">{d}</p>
                  </div>
                  <div className={`img-overlay-hover relative min-h-[220px] md:min-h-full ${i % 2 === 1 ? "md:order-1" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img as string} alt={t as string} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-ink-strong/60 to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ REVIEWS — paginated carousel ═══ */}
      {reviews.length > 0 && (
        <section className="section-y">
          <Container>
            <Reveal><SectionTitle eyebrow="Reviews" title="What customers say" align="center" /></Reveal>
            <Reveal className="mt-4">
              <ReviewsCarousel
                reviews={reviews.map((r) => ({
                  id: r.id,
                  overall: r.overall,
                  text: r.text,
                  authorName: shortName(r.authorName),
                  carrierName: r.carrier.companyName || r.carrier.user?.name || "REVORA carrier",
                }))}
              />
            </Reveal>
          </Container>
        </section>
      )}

      {/* ═══ FAQ — two-column with sticky heading ═══ */}
      <section id="faq" className="section-y bg-surface-soft border-t border-line">
        <Container>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <div className="eyebrow mb-3">FAQ</div>
              <h2 className="display-md text-ink-strong">Frequently asked questions</h2>
              <p className="text-muted mt-3 text-[15px]">
                Everything about quotes, payment and verification. Still unsure?
              </p>
              <Button href="/register" variant="primary" size="sm" className="mt-5">
                Become a partner <ArrowRight size={16} />
              </Button>
            </Reveal>
            <Reveal><FaqAccordion items={FAQ} /></Reveal>
          </div>
        </Container>
      </section>

      {/* ═══ CTA — full-bleed image + floating card ═══ */}
      <section className="section-y">
        <Container>
          <Reveal>
            <div className="relative rounded-[32px] overflow-hidden min-h-[420px] flex items-center border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/cta.jpg" alt="Moving van on the road" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink-strong/90 via-ink-strong/70 to-ink-strong/30" />
              <div className="relative z-10 p-8 sm:p-14 max-w-lg">
                <div className="eyebrow mb-4 !text-brand-bright">Ready when you are</div>
                <h2 className="display-lg text-white">Ready to move?</h2>
                <p className="text-white/70 mt-4 text-lead">
                  Compare verified carriers and book your move in minutes. Are you a driver?
                  Grow your business with REVORA MOVE.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Button href="/catalog" variant="primary" size="lg">Find a Driver</Button>
                  <Button href="/register" variant="white" size="lg">Become a Partner</Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

const FAQ = [
  { q: "How is the price calculated?", a: "Automatically, based on each carrier's rates, route distance, vehicle size, number of helpers, property access and any additional services. It's an estimate to help you compare — not a final invoice." },
  { q: "How do I pay for my booking?", a: "You pay the carrier directly — in cash or however you agree with them. REVORA MOVE does not process payments and never asks for a deposit online." },
  { q: "Are all drivers verified?", a: "Yes. Carriers must provide the required documents (licence, MOT, insurance, etc.) and be manually approved before appearing in the catalogue." },
  { q: "Are my belongings insured?", a: "All verified carriers are required to hold valid Goods In Transit insurance. You can see each carrier's verification status on their profile." },
  { q: "Can I book a same-day move?", a: "Yes, if suitable drivers are available in your area for your date." },
  { q: "Can I book transport between the UK and Europe?", a: "Yes. European transport is available with verified international carriers for selected countries." },
  { q: "How do I leave a review?", a: "After your job is marked completed, you'll receive a personal link by email to rate the carrier and leave a review." },
];
