"use client";

import { useState } from "react";
import { ArrowRight, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

// Швидка форма в банері: збирає контакт, зберігає в sessionStorage і плавно
// прокручує до детальної форми реєстрації (яка підхопить значення).
export function PartnerHeroForm() {
  const [v, setV] = useState({ firstName: "", phone: "", email: "" });
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      sessionStorage.setItem("partner_lead", JSON.stringify(v));
    } catch {}
    // Форма реєстрації вже змонтована нижче — повідомляємо її подією.
    window.dispatchEvent(new CustomEvent("partner-lead", { detail: v }));
    const el = document.getElementById("register");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[20px] border border-brand/25 shadow-[var(--shadow-lift)] p-5 sm:p-6 bg-gradient-to-br from-brand-soft/80 via-white to-brand-soft/50"
    >
      <p className="font-semibold text-ink-strong text-lg">Start your application</p>
      <p className="text-sm text-muted mt-1">Takes under a minute to begin — verification follows.</p>
      <div className="space-y-3 mt-5">
        <Field icon={<User size={16} />}>
          <Input placeholder="Full name" value={v.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field icon={<Phone size={16} />}>
          <Input placeholder="Phone (+44…)" value={v.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field icon={<Mail size={16} />}>
          <Input type="email" placeholder="Email" value={v.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
      </div>
      <Button type="submit" size="lg" className="w-full mt-4">
        Continue application <ArrowRight size={18} />
      </Button>
      <p className="text-[11px] text-muted mt-3 text-center">Free to join · No online commission</p>
    </form>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
      <div className="[&_input]:pl-9">{children}</div>
    </div>
  );
}
