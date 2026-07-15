"use client";

import { useState, useTransition } from "react";
import { Star, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { REVIEW_CRITERIA, REVIEW_CRITERION_LABELS, type ReviewCriterion } from "@/lib/enums";
import { submitReviewAction } from "@/app/(site)/review/actions";

export function ReviewForm({ orderId, token, carrierName }: { orderId: string; token: string; carrierName: string }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    if (!scores.overall) { setError("Please give an overall rating."); return; }
    const fd = new FormData();
    fd.set("orderId", orderId);
    fd.set("token", token);
    fd.set("text", text);
    Object.entries(scores).forEach(([k, val]) => fd.set(k, String(val)));
    start(async () => {
      const res = await submitReviewAction(fd);
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  if (done) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-brand-soft grid place-items-center mx-auto mb-4"><PartyPopper className="text-brand-dark" /></div>
        <h2 className="text-2xl font-bold text-ink-strong">Thank you for your review!</h2>
        <p className="text-muted mt-2">Your feedback helps other customers and improves {carrierName}&apos;s profile.</p>
        <Button href="/" size="lg" className="mt-6">Back to home</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-ink-strong">Rate your move with {carrierName}</h1>
      <p className="text-muted text-sm mt-1 mb-6">Your review is linked to your completed booking.</p>

      <div className="space-y-4">
        {REVIEW_CRITERIA.map((c) => (
          <div key={c} className="flex items-center justify-between">
            <span className={`text-sm ${c === "overall" ? "font-semibold text-ink-strong" : "text-muted"}`}>
              {REVIEW_CRITERION_LABELS[c as ReviewCriterion]}
            </span>
            <StarInput value={scores[c] ?? 0} onChange={(val) => setScores((p) => ({ ...p, [c]: val }))} />
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Label>Your review (optional)</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Tell others about your experience…" />
      </div>

      {error && <p className="text-danger text-sm mt-3">{error}</p>}

      <Button onClick={submit} size="lg" className="w-full mt-5" disabled={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </Card>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="p-0.5"
          aria-label={`${i} stars`}
        >
          <Star size={22} className={i <= (hover || value) ? "fill-brand text-brand" : "text-line"} />
        </button>
      ))}
    </div>
  );
}
