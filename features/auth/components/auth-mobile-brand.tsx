import { AuthBrand } from "@/features/auth/components/auth-brand";

export function AuthMobileBrand() {
  return (
    <div className="mb-10 lg:hidden">
      <AuthBrand className="mb-8" />
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Your money. Your rules.
      </p>
    </div>
  );
}
