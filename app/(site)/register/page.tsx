import {
  TrendingUp, Users, Star, CalendarCheck, Globe2, Wallet, ShieldCheck,
  CheckCircle2, Car, IdCard, Truck, Clock, HeartHandshake, FileCheck, RefreshCw, Inbox,
  Bell, History, LifeBuoy, ListChecks, UserSquare, MessageSquareQuote, Quote,
  ArrowRight, Sparkles,
} from "lucide-react";
import { Container, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/features/register-form";
import { PartnerHeroForm } from "@/components/features/partner-hero-form";
import { FaqAccordion } from "@/components/features/faq-accordion";
import { FeatureShowcase } from "@/components/features/feature-showcase";
import { StarRow } from "@/components/features/rating";
import { Marquee } from "@/components/motion/marquee";
import { Reveal, FadeUp, Stagger, StaggerItem } from "@/components/motion/reveal";
import { prisma } from "@/lib/db";
import { SERVICE_TYPES } from "@/lib/enums";

export const metadata = { title: "Become a Partner" };

// «Кого ми шукаємо» — критерії
const CRITERIA: [typeof Car, string][] = [
  [Car, "You own a vehicle (van or truck)"],
  [IdCard, "You hold a valid driving licence"],
  [Truck, "You're ready to provide transport services"],
  [Clock, "You have availability in your schedule"],
  [HeartHandshake, "You take a responsible approach to customers"],
  [FileCheck, "You're ready to pass document verification"],
  [RefreshCw, "You can keep your profile up to date"],
  [Inbox, "You're ready to receive bookings via the platform"],
];

// «Що дає платформа»
const PLATFORM: [typeof Inbox, string, string][] = [
  [Inbox, "Access to new bookings", "A steady stream of customer requests on your routes."],
  [UserSquare, "Your own carrier profile", "Company, vehicles, services and coverage in one place."],
  [Star, "Rating system", "Earn a public score that grows with every completed job."],
  [MessageSquareQuote, "Customer reviews", "Verified feedback that builds trust with new customers."],
  [TrendingUp, "Grow your bookings", "Better profile & ratings mean higher visibility."],
  [Bell, "Email notifications", "Instant alerts for new requests and status changes."],
  [History, "Completed jobs history", "A full record of every move you've delivered."],
  [LifeBuoy, "Admin support", "A real team to help with verification and disputes."],
  [ListChecks, "Transparent status system", "Clear order states from request to completion."],
];

// Переваги співпраці
const BENEFITS: [typeof Wallet, string, string][] = [
  [Wallet, "No online commission", "The platform never takes payment online — customers pay you directly, cash or as agreed."],
  [TrendingUp, "Set your own rates", "You control base rate, per-mile, per-hour and every surcharge."],
  [Globe2, "UK-wide & into Europe", "Take local moves in every UK nation and cross-border European work."],
  [CalendarCheck, "Flexible availability", "Block dates and manage your calendar — work when it suits you."],
  [ShieldCheck, "Verified badge", "A document-checked badge that reassures every customer."],
  [Users, "More customers, less chasing", "Get discovered by people already looking for your service."],
];

// Відгуки перевізників про платформу (демо)
const PARTNER_REVIEWS = [
  { name: "James Carter", role: "Man & Van · London", rating: 5, text: "Since joining REVORA MOVE I get steady bookings without paying for leads. Setting my own rates is a game-changer." },
  { name: "Marek Nowak", role: "Removals · Manchester", rating: 5, text: "Verification was straightforward and the support team actually replies. My profile fills up weeks in advance now." },
  { name: "Andriy Koval", role: "European Transport · Leeds", rating: 5, text: "The status system keeps customers informed so I get fewer calls. Cross-border jobs come in regularly." },
];

const PARTNER_FAQ = [
  { q: "How much does it cost to join?", a: "It's free to register. REVORA MOVE never takes a commission online — customers pay you directly, cash or however you agree." },
  { q: "How do I get verified?", a: "During registration you provide your documents (driving licence, MOT, insurance, etc.). Our team reviews them and approves your profile before it goes live." },
  { q: "How and when am I paid?", a: "You're paid directly by the customer — the platform never processes payments. Settle in cash or as you agree with each customer." },
  { q: "Can I set my own prices?", a: "Yes. You fully control your base rate, per-mile and per-hour rates plus every surcharge from your dashboard." },
  { q: "When does my profile go live?", a: "As soon as your documents pass verification. Until then your status is “Pending Verification” and you won't appear in the catalogue." },
  { q: "Can I choose which jobs to take?", a: "Absolutely. You can accept, decline or request more information on every incoming booking request." },
];

// Факти платформи для hero-стрічки (правдиві, з продукту — без cold-start метрик)
const HERO_FACTS: [string, string][] = [
  ["4", "UK nations covered"],
  ["9", "European countries"],
  ["0%", "Commission online"],
];

// Ambiance-фото для spotlight-панелі (під важким оверлеєм; по одному активному).
const CRITERIA_IMAGES = [
  "/images/dest-2.jpg", "/images/service-3.jpg", "/images/step-2.jpg", "/images/step-4.jpg",
  "/images/service-1.jpg", "/images/hero-secondary.webp", "/images/dest-4.jpg", "/images/warehouse-wide.webp",
];
const PLATFORM_IMAGES = [
  "/images/step-2.jpg", "/images/hero-secondary.webp", "/images/dest-1.jpg", "/images/service-3.jpg",
  "/images/warehouse-wide.webp", "/images/step-4.jpg", "/images/step-3.jpg", "/images/service-1.jpg",
  "/images/cta.jpg",
];

// Що підготувати до реєстрації (ліва панель форми — підтримка, не заміна контенту)
const PREP = [
  "Your vehicle details & photos",
  "Driving licence & insurance",
  "Areas and services you cover",
  "Your starting rates",
];

export default async function RegisterPage() {
  const areaRows = await prisma.area.findMany({ orderBy: { type: "asc" }, select: { name: true } });
  const areas = areaRows.map((a) => a.name);

  return (
    <>
      {/* ═══ 1 · HERO — full-bleed image (Haul "Let's get in touch") + our form ═══ */}
      <section className="relative overflow-hidden text-white">
        {/* Full-bleed background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/cta.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-strong/90 via-ink-strong/80 to-ink-strong/95" />
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
        <div className="absolute -top-40 right-[12%] w-[520px] h-[520px] rounded-full bg-brand/25 blur-[170px]" />

        <Container className="relative pt-16 lg:pt-24 pb-0">
          {/* Two-column — text left, our form right (over full-bleed image) */}
          <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-16 items-center">
            {/* Left — text */}
            <div>
              <FadeUp>
                <Badge variant="soft" className="mb-6 bg-brand/20 text-brand-bright">
                  <Sparkles size={13} /> Become a Partner
                </Badge>
              </FadeUp>
              <FadeUp delay={0.08}>
                <h1 className="display-xl text-white max-w-2xl">
                  Grow your moving business with <span className="text-brand-bright">REVORA MOVE</span>
                </h1>
              </FadeUp>
              <FadeUp delay={0.16}>
                <p className="text-white/75 mt-6 text-lead max-w-xl">
                  Get new bookings, manage your calendar, set your own rates and receive online
                  requests — all from one platform. No commission taken online.
                </p>
              </FadeUp>
              <FadeUp delay={0.24} className="mt-8 flex flex-wrap gap-x-3 gap-y-2.5">
                {[
                  [Wallet, "No online commission"],
                  [ShieldCheck, "Verified profiles"],
                  [Globe2, "UK & Europe work"],
                ].map(([Icon, label]) => {
                  const I = Icon as typeof Wallet;
                  return (
                    <span key={label as string} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-2 text-sm text-white/85 backdrop-blur-sm">
                      <I size={16} className="text-brand-bright" /> {label as string}
                    </span>
                  );
                })}
              </FadeUp>
            </div>

            {/* Right — our form */}
            <FadeUp delay={0.3} className="relative w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-3 rounded-[26px] bg-brand/10 blur-2xl" aria-hidden />
              <div className="relative">
                <PartnerHeroForm />
              </div>
            </FadeUp>
          </div>

          {/* Facts rail */}
          <Reveal className="mt-14 lg:mt-16 grid grid-cols-3 divide-x divide-white/10 rounded-t-[22px] border-x border-t border-white/10 bg-white/[0.04] backdrop-blur-sm">
            {HERO_FACTS.map(([n, label]) => (
              <div key={label} className="px-4 py-6 sm:py-7 text-center">
                <div className="display-md text-white">{n}</div>
                <div className="text-white/55 text-xs sm:text-sm mt-1">{label}</div>
              </div>
            ))}
          </Reveal>
        </Container>

        {/* Service marquee */}
        <div className="relative border-t border-white/10 bg-white/[0.03] py-4">
          <Marquee durationSec={55} gap="1rem">
            {SERVICE_TYPES.map((s) => (
              <span key={s.code} className="inline-flex items-center gap-2 text-sm text-white/50 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-bright/70" /> {s.name}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ═══ 2 · WHO WE'RE LOOKING FOR ═══════════════════════════════ */}
      <section className="section-y">
        <Container>
          <Reveal className="max-w-2xl mb-12">
            <div className="eyebrow mb-3">Who we're looking for</div>
            <h2 className="display-lg text-ink-strong">Is REVORA MOVE right for you?</h2>
            <p className="text-muted mt-4 text-[15px]">
              If most of these describe you, you're ready to become a partner.
            </p>
          </Reveal>

          <Reveal>
            <FeatureShowcase
              items={CRITERIA.map(([Icon, label], i) => ({
                icon: <Icon />,
                title: label,
                image: CRITERIA_IMAGES[i],
                tag: "Partner requirement",
              }))}
            />
          </Reveal>
        </Container>
      </section>

      {/* ═══ 3 · WHAT THE PLATFORM GIVES ═════════════════════════════ */}
      <section className="section-y bg-surface-soft border-y border-line">
        <Container>
          <Reveal className="max-w-2xl">
            <div className="eyebrow mb-3">What the platform gives</div>
            <h2 className="display-lg text-ink-strong">Everything you need to win more work</h2>
            <p className="text-muted mt-4 text-[15px]">
              A complete toolkit for running and growing your transport business — from your first
              request to a full history of completed moves.
            </p>
          </Reveal>

          <Stagger className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLATFORM.map(([Icon, title, desc], i) => {
              const hero = i === 0;
              const wide = i === PLATFORM.length - 1;
              const span = hero ? "sm:col-span-2 lg:col-span-2" : wide ? "sm:col-span-2 lg:col-span-3" : "";

              // ── Large hero tile (full-bleed image + overlay) ──
              if (hero) {
                return (
                  <StaggerItem key={title} className={span}>
                    <div className="img-overlay-hover card-hover group relative h-full min-h-[300px] rounded-[24px] overflow-hidden border border-ink-strong text-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={PLATFORM_IMAGES[i]} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-strong via-ink-strong/70 to-ink-strong/25" />
                      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand/30 blur-[80px]" />
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white/10 text-brand-bright backdrop-blur-sm"><Icon size={26} /></span>
                          <span className="font-[family-name:var(--font-display)] text-6xl font-semibold text-white/15 leading-none">01</span>
                        </div>
                        <div className="max-w-md">
                          <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white leading-tight">{title}</h3>
                          <p className="text-white/70 mt-2 text-[15px] leading-relaxed">{desc}</p>
                          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-bright">
                            The core of your partnership <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              }

              // ── Wide closing tile with status flow ──
              if (wide) {
                return (
                  <StaggerItem key={title} className={span}>
                    <div className="card-hover group relative h-full rounded-[24px] overflow-hidden border border-line bg-white grid sm:grid-cols-[1.15fr_1fr]">
                      <div className="p-8 flex flex-col justify-center">
                        <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand grid place-items-center mb-4"><Icon size={22} /></div>
                        <h3 className="font-semibold text-ink-strong text-xl">{title}</h3>
                        <p className="text-muted text-[15px] mt-2 leading-relaxed max-w-sm">{desc}</p>
                        <div className="flex flex-wrap items-center gap-y-1.5 mt-6">
                          {["Confirmed", "Scheduled", "In transit", "Completed"].map((st, k) => (
                            <span key={st} className="inline-flex items-center">
                              <span className={`text-xs font-medium rounded-full px-2.5 py-1 border ${k === 3 ? "bg-brand text-white border-brand" : "bg-surface-soft text-ink border-line"}`}>{st}</span>
                              {k < 3 && <ArrowRight size={13} className="text-muted mx-1" />}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="relative min-h-[200px] hidden sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={PLATFORM_IMAGES[i]} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent" />
                      </div>
                    </div>
                  </StaggerItem>
                );
              }

              // ── Standard image card (icon + title over photo, desc below) ──
              return (
                <StaggerItem key={title}>
                  <div className="card-hover group h-full rounded-[22px] overflow-hidden border border-line bg-white flex flex-col">
                    <div className="relative h-40 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={PLATFORM_IMAGES[i]} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-strong/90 via-ink-strong/45 to-ink-strong/10" />
                      <span className="absolute top-4 left-4 grid place-items-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md text-white border border-white/20"><Icon size={20} /></span>
                      <span className="absolute top-4 right-4 font-[family-name:var(--font-display)] text-xl font-semibold text-white/70">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="absolute left-4 right-4 bottom-3 font-semibold text-white text-[17px] leading-snug [text-shadow:0_1px_10px_rgba(0,0,0,.55)]">{title}</h3>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-muted text-[14px] leading-relaxed">{desc}</p>
                      <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Included <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* ═══ 4 · DETAILED REGISTRATION FORM ══════════════════════════ */}
      <section id="register" className="section-y scroll-mt-24">
        <Container>
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-start">
            {/* Left rail — reassurance (Contact-style) */}
            <Reveal className="lg:sticky lg:top-28">
              <div className="relative rounded-[24px] overflow-hidden bg-ink-strong text-white p-7 sm:p-8">
                <div className="absolute inset-0 bg-grid opacity-10" />
                <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-brand/20 blur-[90px]" />
                <div className="relative">
                  <div className="eyebrow mb-3 !text-brand-bright">Registration</div>
                  <h2 className="display-md text-white">Join in a few steps</h2>
                  <p className="text-white/65 mt-3 text-[15px]">
                    Your profile goes live only after our team verifies your documents.
                  </p>

                  <div className="mt-7 space-y-3">
                    <p className="text-xs uppercase tracking-wide text-white/40 font-semibold">What you'll need</p>
                    {PREP.map((p) => (
                      <div key={p} className="flex items-center gap-3 text-sm text-white/85">
                        <span className="grid place-items-center w-6 h-6 rounded-full bg-brand/20 text-brand-bright shrink-0"><CheckCircle2 size={14} /></span>
                        {p}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 text-sm text-white/70">
                    <ShieldCheck size={18} className="text-brand-bright shrink-0" />
                    Free to join — verified before your profile appears in the catalogue.
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right — the multi-step form (unchanged logic) */}
            <div>
              <RegisterForm areas={areas} services={SERVICE_TYPES} />
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ 5 · BENEFITS OF COOPERATION ═════════════════════════════ */}
      <section className="relative overflow-hidden bg-ink-strong text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-brand/15 blur-[150px]" />
        <Container className="relative section-y">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
            {/* Intro + image + CTA */}
            <Reveal className="lg:sticky lg:top-28">
              <p className="eyebrow mb-3 !text-brand-bright">Why partner with us</p>
              <h2 className="display-lg text-white">Benefits of working with REVORA MOVE</h2>
              <p className="text-white/60 mt-4 text-[15px] max-w-md">
                Built around trust and transparency — you stay in control of your rates, your calendar
                and every job you take.
              </p>
              <div className="img-overlay-hover mt-8 relative rounded-[22px] overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/warehouse-wide.webp" alt="REVORA partner loading a van" className="w-full h-52 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-strong to-transparent" />
              </div>
              <Button href="#register" size="lg" variant="primary" className="mt-8">
                Start your application <ArrowRight size={18} />
              </Button>
            </Reveal>

            {/* Benefit cards */}
            <Stagger className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map(([Icon, title, desc]) => (
                <StaggerItem key={title}>
                  <div className="card-hover group h-full rounded-[18px] border border-white/10 bg-white/5 p-6 hover:border-brand/50 hover:bg-white/[0.07]">
                    <div className="w-11 h-11 rounded-xl bg-white/10 text-brand-bright grid place-items-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors"><Icon size={20} /></div>
                    <h3 className="font-semibold text-white text-[16px]">{title}</h3>
                    <p className="text-white/60 text-[14px] mt-1.5 leading-relaxed">{desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* ═══ 6 · PARTNER TESTIMONIALS ════════════════════════════════ */}
      <section className="section-y">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <div className="eyebrow mb-3">Partner stories</div>
              <h2 className="display-lg text-ink-strong">What carriers say about the platform</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <StarRow value={5} size={16} />
              <span className="font-medium text-ink-strong">Trusted by movers across the UK</span>
            </div>
          </Reveal>

          <Stagger className="grid gap-5 md:grid-cols-3">
            {PARTNER_REVIEWS.map((r, i) => {
              const featured = i === 1;
              return (
                <StaggerItem key={r.name}>
                  <div className={`card-hover h-full rounded-[22px] p-7 flex flex-col ${
                    featured
                      ? "bg-ink-strong text-white border border-ink-strong relative overflow-hidden"
                      : "bg-white border border-line shadow-[var(--shadow-whisper)]"
                  }`}>
                    {featured && <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-brand/25 blur-[70px]" />}
                    <div className="relative flex items-center justify-between">
                      <Quote className={featured ? "text-brand-bright" : "text-brand"} size={26} />
                      <StarRow value={r.rating} size={15} />
                    </div>
                    <p className={`relative mt-5 text-[15px] leading-relaxed ${featured ? "text-white/90" : "text-ink"}`}>
                      “{r.text}”
                    </p>
                    <div className={`relative mt-6 pt-5 border-t flex items-center gap-3 ${featured ? "border-white/15" : "border-line"}`}>
                      <span className={`grid place-items-center w-11 h-11 rounded-full font-semibold text-sm shrink-0 ${featured ? "bg-white/10 text-brand-bright" : "bg-brand-soft text-brand"}`}>
                        {r.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${featured ? "text-white" : "text-ink-strong"}`}>{r.name}</p>
                        <p className={`text-xs truncate ${featured ? "text-white/55" : "text-muted"}`}>{r.role}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* ═══ 7 · FAQ ═════════════════════════════════════════════════ */}
      <section className="section-y bg-surface-soft border-t border-line">
        <Container>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <div className="eyebrow mb-3">FAQ</div>
              <h2 className="display-md text-ink-strong">Partner questions, answered</h2>
              <p className="text-muted mt-3 text-[15px]">Everything about joining, verification and payment.</p>

              <div className="mt-7 rounded-[18px] border border-line bg-white p-5 shadow-[var(--shadow-whisper)]">
                <div className="flex items-center gap-2 text-sm text-brand-dark font-medium">
                  <CheckCircle2 size={16} /> Free to join — no online commission
                </div>
                <p className="text-muted text-sm mt-2">Still deciding? Start your application — verification comes after.</p>
                <Button href="#register" size="md" variant="primary" className="mt-4 w-full sm:w-auto">
                  Become a partner <ArrowRight size={16} />
                </Button>
              </div>
            </Reveal>
            <Reveal><FaqAccordion items={PARTNER_FAQ} /></Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
