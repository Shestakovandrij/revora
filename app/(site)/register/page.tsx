import {
  TrendingUp, Users, Star, CalendarCheck, Globe2, Wallet, ShieldCheck,
  CheckCircle2, Car, IdCard, Truck, Clock, HeartHandshake, FileCheck, RefreshCw, Inbox,
  Bell, History, LifeBuoy, ListChecks, UserSquare, MessageSquareQuote, Quote,
} from "lucide-react";
import { Container, SectionTitle, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegisterForm } from "@/components/features/register-form";
import { PartnerHeroForm } from "@/components/features/partner-hero-form";
import { FaqAccordion } from "@/components/features/faq-accordion";
import { StarRow } from "@/components/features/rating";
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

export default async function RegisterPage() {
  const areaRows = await prisma.area.findMany({ orderBy: { type: "asc" }, select: { name: true } });
  const areas = areaRows.map((a) => a.name);

  return (
    <>
      {/* ═══ HERO BANNER + FORM ═══ */}
      <section className="bg-ink-strong text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-32 right-1/4 w-[520px] h-[520px] rounded-full bg-brand/20 blur-[150px]" />
        <Container className="relative py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-16 items-center">
            <div>
              <FadeUp><Badge variant="soft" className="mb-5 bg-brand/20 text-brand-bright">Become a Partner</Badge></FadeUp>
              <FadeUp delay={0.08}>
                <h1 className="display-lg text-white">Grow your moving business with REVORA MOVE</h1>
              </FadeUp>
              <FadeUp delay={0.16}>
                <p className="text-white/70 mt-5 text-lead max-w-xl">
                  Get new bookings, manage your calendar, set your own rates and receive online
                  requests — all from one platform. No commission taken online.
                </p>
              </FadeUp>
              <FadeUp delay={0.24} className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                <span className="inline-flex items-center gap-2"><Wallet size={17} className="text-brand-bright" /> No online commission</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-brand-bright" /> Verified profiles</span>
                <span className="inline-flex items-center gap-2"><Globe2 size={17} className="text-brand-bright" /> UK & Europe work</span>
              </FadeUp>
            </div>
            <FadeUp delay={0.2}><PartnerHeroForm /></FadeUp>
          </div>
        </Container>
      </section>

      {/* ═══ WHO WE'RE LOOKING FOR ═══ */}
      <section className="section-y">
        <Container>
          <Reveal><SectionTitle eyebrow="Who we're looking for" title="Is REVORA MOVE right for you?"
            subtitle="If most of these describe you, you're ready to become a partner." align="center" /></Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {CRITERIA.map(([Icon, label]) => (
              <StaggerItem key={label}>
                <Card className="card-hover h-full p-5">
                  <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center mb-4"><Icon size={20} /></div>
                  <p className="text-[15px] font-medium text-ink-strong leading-snug">{label}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ═══ WHAT THE PLATFORM GIVES ═══ */}
      <section className="section-y bg-surface-soft border-y border-line">
        <Container>
          <Reveal><SectionTitle eyebrow="What the platform gives" title="Everything you need to win more work" align="center" /></Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {PLATFORM.map(([Icon, title, desc]) => (
              <StaggerItem key={title}>
                <Card className="card-hover h-full p-6">
                  <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center mb-4"><Icon size={20} /></div>
                  <h3 className="font-semibold text-ink-strong text-[16px]">{title}</h3>
                  <p className="text-muted text-[14px] mt-1.5 leading-relaxed">{desc}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ═══ DETAILED REGISTRATION FORM ═══ */}
      <section id="register" className="section-y scroll-mt-24">
        <Container>
          <Reveal><SectionTitle eyebrow="Registration" title="Join in a few steps" align="center"
            subtitle="Your profile goes live only after our team verifies your documents." /></Reveal>
          <RegisterForm areas={areas} services={SERVICE_TYPES} />
        </Container>
      </section>

      {/* ═══ BENEFITS OF COOPERATION ═══ */}
      <section className="section-y bg-ink-strong text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/15 blur-[150px]" />
        <Container className="relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow justify-center mb-3 !text-brand-bright">Why partner with us</p>
            <h2 className="display-lg text-white">Benefits of working with REVORA MOVE</h2>
          </Reveal>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(([Icon, title, desc]) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-[18px] border border-white/10 bg-white/5 p-6">
                  <div className="w-11 h-11 rounded-xl bg-white/10 text-brand-bright grid place-items-center mb-4"><Icon size={20} /></div>
                  <h3 className="font-semibold text-white text-[16px]">{title}</h3>
                  <p className="text-white/60 text-[14px] mt-1.5 leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ═══ PARTNER TESTIMONIALS ═══ */}
      <section className="section-y">
        <Container>
          <Reveal><SectionTitle eyebrow="Partner stories" title="What carriers say about the platform" align="center" /></Reveal>
          <Stagger className="grid gap-6 md:grid-cols-3 mt-4">
            {PARTNER_REVIEWS.map((r) => (
              <StaggerItem key={r.name}>
                <Card className="card-hover h-full p-6">
                  <div className="flex items-center justify-between">
                    <Quote className="text-brand" size={22} />
                    <StarRow value={r.rating} />
                  </div>
                  <p className="text-ink mt-4 text-[15px] leading-relaxed">“{r.text}”</p>
                  <div className="mt-5 pt-5 border-t border-line flex items-center gap-3">
                    <span className="grid place-items-center w-10 h-10 rounded-full bg-brand-soft text-brand font-semibold text-sm shrink-0">{r.name.slice(0, 1)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-strong truncate">{r.name}</p>
                      <p className="text-xs text-muted truncate">{r.role}</p>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="section-y bg-surface-soft border-t border-line">
        <Container>
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
            <Reveal className="lg:sticky lg:top-28">
              <div className="eyebrow mb-3">FAQ</div>
              <h2 className="display-md text-ink-strong">Partner questions, answered</h2>
              <p className="text-muted mt-3 text-[15px]">Everything about joining, verification and payment.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-brand-dark font-medium">
                <CheckCircle2 size={16} /> Free to join — no online commission
              </div>
            </Reveal>
            <Reveal><FaqAccordion items={PARTNER_FAQ} /></Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
