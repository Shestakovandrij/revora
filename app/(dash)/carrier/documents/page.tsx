import { CheckCircle2, Clock, XCircle, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DOCUMENT_TYPES, DOCUMENT_LABELS, DOCUMENT_STATUS_LABELS, type DocumentType, type DocumentStatus } from "@/lib/enums";

export default async function DocumentsPage() {
  const session = await getSession();
  const carrier = await prisma.carrier.findUnique({
    where: { userId: session!.sub },
    include: { documents: true },
  });
  if (!carrier) return <p>No carrier profile.</p>;
  const docMap = new Map(carrier.documents.map((d) => [d.type, d]));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-ink-strong">Document management</h2>
        <p className="text-muted text-sm mt-1">Upload and keep your documents up to date. Only verification status is shown publicly — never the files.</p>
      </div>

      <div className="space-y-3">
        {DOCUMENT_TYPES.map((dt) => {
          const doc = docMap.get(dt);
          const status = doc?.status ?? "NOT_UPLOADED";
          const verified = status === "VERIFIED";
          return (
            <Card key={dt} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {verified ? <CheckCircle2 className="text-brand-dark" size={20} /> : status === "PENDING" ? <Clock className="text-warning" size={20} /> : <XCircle className="text-muted" size={20} />}
                <div>
                  <p className="font-medium text-ink">{DOCUMENT_LABELS[dt as DocumentType]}</p>
                  {doc?.expiryDate && <p className="text-xs text-muted">Expires {new Date(doc.expiryDate).toLocaleDateString("en-GB")}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={verified ? "soft" : status === "REJECTED" || status === "EXPIRED" ? "warning" : "neutral"} size="sm">{DOCUMENT_STATUS_LABELS[status as DocumentStatus]}</Badge>
                <Button variant="outline" size="sm"><Upload size={14} /> Upload</Button>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted">Note: file upload UI is wired for the storage endpoint; in this demo statuses come from seeded data.</p>
    </div>
  );
}
