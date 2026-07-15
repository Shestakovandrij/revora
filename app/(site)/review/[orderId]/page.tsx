import { AlertCircle } from "lucide-react";
import { Container, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/features/review-form";
import { prisma } from "@/lib/db";
import { verifyReviewToken } from "@/lib/review-token";

export const metadata = { title: "Leave a review" };

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const { token = "" } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true, carrier: { select: { companyName: true, user: { select: { name: true } } } } },
  });

  const valid = order && verifyReviewToken(orderId, token);
  const carrierName = order ? order.carrier.companyName || order.carrier.user?.name || "your carrier" : "";

  let problem: string | null = null;
  if (!valid) problem = "This review link is invalid or has expired.";
  else if (order!.status !== "COMPLETED") problem = "You can leave a review once your job is completed.";
  else if (order!.review) problem = "This booking has already been reviewed. Thank you!";

  return (
    <Container className="py-14">
      {problem ? (
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="mx-auto text-muted mb-3" size={28} />
          <h1 className="text-xl font-bold text-ink-strong">Can&apos;t leave a review</h1>
          <p className="text-muted mt-2">{problem}</p>
          <Button href="/" className="mt-6">Back to home</Button>
        </Card>
      ) : (
        <ReviewForm orderId={orderId} token={token} carrierName={carrierName} />
      )}
    </Container>
  );
}
