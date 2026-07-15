import Link from "next/link";
import { CheckCircle2, XCircle, HelpCircle, PauseCircle, Star as StarIcon, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { verifyCarrierAction, toggleFeaturedAction } from "../actions";
import type { Prisma } from "@prisma/client";

const TABS = [
  { key: "pending", label: "Pending", where: { verificationStatus: "PENDING" } },
  { key: "all", label: "All carriers", where: {} },
  { key: "published", label: "Published", where: { isPublished: true } },
  { key: "suspended", label: "Suspended", where: { verificationStatus: "SUSPENDED" } },
];

const STATUS_VARIANT: Record<string, "soft" | "neutral" | "warning"> = {
  APPROVED: "soft", PENDING: "warning", REJECTED: "neutral", MORE_INFO_REQUIRED: "warning", SUSPENDED: "neutral",
};

export default async function AdminCarriersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "all" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[1];

  const carriers = await prisma.carrier.findMany({
    where: active.where as Prisma.CarrierWhereInput,
    include: { user: { select: { name: true, email: true } }, documents: true, _count: { select: { orders: true } } },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-line overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/carriers?tab=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${t.key === active.key ? "border-brand text-ink-strong" : "border-transparent text-muted hover:text-ink"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {carriers.length === 0 ? (
        <Card className="p-12 text-center text-muted">No carriers in this view.</Card>
      ) : (
        <div className="space-y-4">
          {carriers.map((c) => {
            const verifiedDocs = c.documents.filter((d) => d.status === "VERIFIED").length;
            return (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-ink-strong">{c.companyName || c.user.name}</h3>
                      <Badge variant={STATUS_VARIANT[c.verificationStatus] ?? "neutral"} size="sm">{c.verificationStatus.replaceAll("_", " ")}</Badge>
                      {c.isFeatured && <Badge variant="brand" size="sm">★ Featured</Badge>}
                      {c.isDemo && <Badge variant="neutral" size="sm">Demo</Badge>}
                    </div>
                    <p className="text-sm text-muted mt-1">{c.city} · {c.user.email}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
                      <span>Docs verified: {verifiedDocs}/{c.documents.length}</span>
                      <span>Orders: {c._count.orders}</span>
                      <span>Rating: {c.avgRating != null ? c.avgRating.toFixed(1) : "New"}</span>
                      <span>Completeness: {c.profileCompleteness}%</span>
                    </div>
                  </div>
                  {c.isPublished && (
                    <Button href={`/carrier/${c.slug}`} variant="ghost" size="sm"><ExternalLink size={14} /> View</Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-line">
                  <VerifyBtn id={c.id} decision="APPROVED" label="Approve" icon={<CheckCircle2 size={14} />} variant="primary" />
                  <VerifyBtn id={c.id} decision="MORE_INFO_REQUIRED" label="Request info" icon={<HelpCircle size={14} />} variant="outline" />
                  <VerifyBtn id={c.id} decision="REJECTED" label="Reject" icon={<XCircle size={14} />} variant="ghost" />
                  <VerifyBtn id={c.id} decision="SUSPENDED" label="Suspend" icon={<PauseCircle size={14} />} variant="ghost" />
                  <form action={toggleFeaturedAction} className="ml-auto">
                    <input type="hidden" name="carrierId" value={c.id} />
                    <Button type="submit" variant="outline" size="sm"><StarIcon size={14} /> {c.isFeatured ? "Unfeature" : "Feature"}</Button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VerifyBtn({ id, decision, label, icon, variant }: { id: string; decision: string; label: string; icon: React.ReactNode; variant: "primary" | "outline" | "ghost" }) {
  return (
    <form action={verifyCarrierAction}>
      <input type="hidden" name="carrierId" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <Button type="submit" size="sm" variant={variant}>{icon} {label}</Button>
    </form>
  );
}
