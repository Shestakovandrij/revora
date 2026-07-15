import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRow } from "@/components/features/rating";
import { prisma } from "@/lib/db";
import { moderateReviewAction } from "../actions";
import { shortName } from "@/lib/utils";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { carrier: { select: { companyName: true, user: { select: { name: true } } } } },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-ink-strong">Reviews moderation</h2>
      <p className="text-sm text-muted">Only PUBLISHED reviews appear publicly and count towards ratings.</p>

      {reviews.length === 0 && (
        <Card className="p-10 text-center text-muted">No reviews to moderate yet.</Card>
      )}
      <div className="space-y-3">
        {reviews.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-strong">{shortName(r.authorName)}</span>
                  <StarRow value={r.overall} size={13} />
                  <Badge variant={r.status === "PUBLISHED" ? "soft" : r.status === "PENDING" ? "warning" : "neutral"} size="sm">{r.status.charAt(0) + r.status.slice(1).toLowerCase()}</Badge>
                  {r.isDemo && <Badge variant="neutral" size="sm">Demo</Badge>}
                </div>
                <p className="text-xs text-muted mt-0.5">for {r.carrier.companyName || r.carrier.user?.name}</p>
                {r.text && <p className="text-sm text-ink mt-2">{r.text}</p>}
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                <ModBtn id={r.id} status="PUBLISHED" label="Publish" variant="primary" />
                <ModBtn id={r.id} status="HIDDEN" label="Hide" variant="outline" />
                <ModBtn id={r.id} status="REJECTED" label="Reject" variant="ghost" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ModBtn({ id, status, label, variant }: { id: string; status: string; label: string; variant: "primary" | "outline" | "ghost" }) {
  return (
    <form action={moderateReviewAction}>
      <input type="hidden" name="reviewId" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>{label}</Button>
    </form>
  );
}
