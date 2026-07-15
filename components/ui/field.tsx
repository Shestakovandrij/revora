import * as React from "react";
import { cn } from "@/lib/utils";

const baseInput =
  "w-full h-12 rounded-xl border border-line bg-white px-4 text-[15px] text-ink placeholder:text-muted/60 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 hover:border-muted/40 transition-all duration-200";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseInput, className)} {...props} />;
  }
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseInput, "h-auto min-h-24 py-2.5 resize-y", className)}
      {...props}
    />
  );
});

/** Синій шеврон-стрілка як inline SVG data-URI — рендериться праворуч у кожному Select. */
const CHEVRON_BG =
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_0.9rem_center] bg-no-repeat";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(baseInput, "appearance-none bg-white cursor-pointer pr-10", CHEVRON_BG, className)}
      {...props}
    />
  );
});

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-[13px] font-semibold text-ink-strong mb-2", className)} {...props} />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-danger text-xs mt-1">{children}</p>;
}
