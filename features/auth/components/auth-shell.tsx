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
        </div>
      </section>
    </main>
  );
}
