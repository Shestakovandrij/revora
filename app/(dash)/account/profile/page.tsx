import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AccountProfilePage() {
  const session = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session!.sub } });
  if (!user) return <p>Not found.</p>;

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-bold text-ink-strong">Profile</h2>
      <Card className="p-5 space-y-3 text-sm">
        <Row label="Name" value={user.name ?? "—"} />
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone ?? "—"} />
        <Row label="Member since" value={new Date(user.createdAt).toLocaleDateString("en-GB")} />
      </Card>
      <p className="text-sm text-muted">
        You pay carriers directly — REVORA MOVE never charges you online, so there are no saved
        payment methods here.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-line last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
