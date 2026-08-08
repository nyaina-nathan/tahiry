"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AppHeaderLink = {
  href: string;
  label: string;
};

type AppHeaderProps = {
  links?: AppHeaderLink[];
};

const linkClassName =
  "font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]";

const SIGN_OUT_ERROR = "You could not be signed out. Please try again.";

export function AppHeader({ links = [] }: AppHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error(SIGN_OUT_ERROR);
      }

      router.replace("/login");
    } catch {
      setLogoutError(SIGN_OUT_ERROR);
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
        >
          <img alt="pennywise-logo" className="w-[5ch]" src={"/icon.png"} />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">
            Pennywise
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-4 sm:flex sm:gap-6"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClassName}>
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60 cursor-pointer"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </nav>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-[var(--color-line)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] sm:hidden"
        >
          <span
            aria-hidden="true"
            className={`h-[2px] w-5 bg-[var(--color-ink)] transition-transform ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`h-[2px] w-5 bg-[var(--color-ink)] transition-opacity ${isMenuOpen ? "opacity-0" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`h-[2px] w-5 bg-[var(--color-ink)] transition-transform ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`${linkClassName} min-h-11 flex items-center border-b border-[var(--color-line)] pb-3`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                void handleLogout();
              }}
              disabled={isLoggingOut}
              className="min-h-11 flex items-center pt-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-danger)] disabled:opacity-60"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </nav>
      )}
      {logoutError && (
        <div
          role="alert"
          className="border-t border-[var(--color-danger)] px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-danger)]"
        >
          {logoutError}
        </div>
      )}
    </header>
  );
}
