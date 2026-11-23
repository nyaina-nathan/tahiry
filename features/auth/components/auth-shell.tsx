import Link from "next/link";
import { AuthBackground } from "@/features/auth/components/auth-background";
import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthMobileBrand } from "@/features/auth/components/auth-mobile-brand";
import { AuthSecurityNote } from "@/features/auth/components/auth-security-note";
import { LoginForm } from "@/features/auth/components/login-form";

export function AuthShell() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--color-canvas)]">
      <AuthBackground />
      <AuthHero />

      <section className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[56%] lg:px-12">
        <div className="auth-panel w-full max-w-[460px]">
          <AuthMobileBrand />
          <LoginForm />
          <AuthSecurityNote />
          <Link
            href="/"
            className="mx-auto mt-4 flex min-h-11 w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--color-muted)] underline underline-offset-4 transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
          >
            <span aria-hidden="true">←</span>
            Return to home page
          </Link>
        </div>
      </section>
    </main>
  );
}
