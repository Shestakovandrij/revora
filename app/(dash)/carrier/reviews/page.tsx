import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { StarRow } from "@/components/features/rating";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { shortName } from "@/lib/utils";
import { respondReviewAction } from "../actions";

export default async function CarrierReviewsPage() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({
    where: { userId: session!.sub },
    include: { reviews: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } } },
  });
  if (!carrier) return <p>No carrier profile.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-ink-strong">Reviews</h2>
        {carrier.avgRating != null ? (
          <span className="flex items-center gap-2 text-sm"><StarRow value={carrier.avgRating} /> <b>{carrier.avgRating.toFixed(1)}</b> ({carrier.reviewCount})</span>
        ) : (
          <span className="text-sm text-muted">No reviews yet</span>
        )}
      </div>

      {carrier.reviews.length === 0 ? (
        <Card className="p-10 text-center text-muted">
          No reviews yet. They appear here after customers complete jobs and rate you.
        </Card>
      ) : (
        <div className="space-y-4">
          {carrier.reviews.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink-strong">{shortName(r.authorName)}</span>
                <StarRow value={r.overall} size={14} />
              </div>
              {r.text && <p className="text-sm text-ink mt-2">{r.text}</p>}

              {r.carrierResponse ? (
                <div className="mt-3 pl-3 border-l-2 border-brand bg-surface-soft rounded p-2 text-sm text-muted">
                  <span className="font-medium text-ink">Your response:</span> {r.carrierResponse}
                </div>
              ) : (
                <form action={respondReviewAction} className="mt-3 space-y-2">
                  <input type="hidden" name="reviewId" value={r.id} />
                  <Textarea name="response" rows={2} placeholder="Write a public response…" />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" variant="outline">Reply</Button>
                  </div>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
