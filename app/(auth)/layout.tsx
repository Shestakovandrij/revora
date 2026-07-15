import { ShieldCheck, Star, Wallet } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md mx-auto">
          <Logo className="mb-10" />
          {children}
        </div>
      </div>
      <div className="hidden lg:flex flex-col justify-center bg-ink-strong text-white p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-brand/25 blur-[130px]" />
        <div className="absolute -bottom-32 -left-10 w-96 h-96 rounded-full bg-brand/15 blur-[130px]" />
        <div className="relative z-10 max-w-md">
          <div className="eyebrow mb-6 !text-brand-bright">REVORA MOVE</div>
          <h2 className="display-lg text-white mb-5">
            Compare & book verified movers across the UK
          </h2>
          <p className="text-white/60 text-lead">
            Instant quotes, real ratings, secure booking. No upfront payment — you pay your
            driver directly.
          </p>
          <div className="mt-10 space-y-4">
            {[
              [ShieldCheck, "Verified, document-checked carriers"],
              [Star, "Real ratings from completed jobs"],
              [Wallet, "No online payment — pay the driver directly"],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Star;
              return (
                <div key={text as string} className="flex items-center gap-3 text-white/80">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/10 text-brand-bright shrink-0">
                    <I size={17} />
                  </span>
                  <span className="text-[15px]">{text as string}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
