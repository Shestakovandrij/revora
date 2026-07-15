import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-strong mb-1">Reset your password</h1>
      <p className="text-muted mb-6 text-sm">Enter your email and we&apos;ll send you a reset link.</p>
      <form className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <Button type="submit" size="lg" className="w-full">Send Reset Link</Button>
      </form>
      <p className="text-sm text-muted mt-4">
        Remembered it? <Link href="/login" className="text-brand-dark font-medium hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
