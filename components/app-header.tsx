"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MoonIcon, NavIcon, SignOutIcon, SunIcon } from "@/components/app-header-icons";

export type AppHeaderLink = {
  href: string;
  label: string;
};

export const PRIMARY_NAV_LINKS: AppHeaderLink[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/expenses", label: "Expenses" },
  { href: "/incomes", label: "Incomes" },
  { href: "/categories", label: "Categories" },
  { href: "/accounts", label: "Accounts" },
];

type AppHeaderProps = {
  links?: AppHeaderLink[];
};

const linkClassName =
  "font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]";

function isActiveLink(href: string, pathname: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function linkClassNameFor(href: string, pathname: string) {
  return `${linkClassName} ${
    isActiveLink(href, pathname)
      ? "text-[var(--color-ink)]"
      : "text-[var(--color-muted)]"
  }`;
}

const iconButtonClassName =
  "group relative flex h-10 w-10 shrink-0 items-center justify-center border border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]";

const labelChipClassName =
  "pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 translate-y-1 whitespace-nowrap border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 font-mono font-bold uppercase opacity-0 transition-[opacity,transform] duration-[90ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[90ms] group-hover:duration-[140ms] group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none";

function HoverLabel({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden="true" className={labelChipClassName}>
      {children}
    </span>
  );
}

const SIGN_OUT_ERROR = "You could not be signed out. Please try again.";

const THEME_EVENT = "themechange";
const PROFILE_EVENT = "profilechange";

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

function subscribeToTheme(onChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === "theme") {
      onChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

export function AppHeader({ links = [] }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [username, setUsername] = useState("");
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { username?: string };
        if (!cancelled && data.username) {
          setUsername(data.username);
        }
      } catch {
        // The header remains usable if the profile request fails.
      }
    }

    function handleProfileChange() {
      void loadProfile();
    }

    void loadProfile();
    window.addEventListener(PROFILE_EVENT, handleProfileChange);

    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_EVENT, handleProfileChange);
    };
  }, []);

  function handleToggleTheme() {
    const next = !getThemeSnapshot();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage may be unavailable; the class toggle still applies.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

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

  const profileInitial = username.trim().charAt(0).toUpperCase() || "?";

  function renderProfileCard(onNavigate?: () => void) {
    return (
      <div className="flex items-center gap-2 border border-[var(--color-line)] bg-[var(--color-canvas)] p-2">
        <div className="flex items-center gap-2 px-1">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--color-strong)] font-display text-lg text-white"
          >
            {profileInitial}
          </div>
          <span className="max-w-28 truncate font-mono text-[10px] font-bold tracking-[0.04em] text-[var(--color-ink)]">
            {username || "Profile"}
          </span>
        </div>
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex min-h-9 items-center justify-center border border-[var(--color-line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          aria-current={isActiveLink("/settings", pathname) ? "page" : undefined}
        >
          Profile
        </Link>
      </div>
    );
  }

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
          href="/dashboard"
          aria-label="Tahiry"
          className="group relative flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
        >
          <img alt="" className="w-[5ch]" src={"/icon.png"} />
          <HoverLabel>
            <span className="text-xs tracking-[0.2em]">Tahiry</span>
          </HoverLabel>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {links.map((link) => {
            const isActive = isActiveLink(link.href, pathname);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                aria-current={isActive ? "page" : undefined}
                className={`${iconButtonClassName} hover:border-[var(--color-line)] ${
                  isActive
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                <NavIcon href={link.href} />
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 bg-[var(--color-ink)]"
                  />
                )}
                <HoverLabel>
                  <span className="text-[10px] tracking-[0.14em]">{link.label}</span>
                </HoverLabel>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            aria-label={isLoggingOut ? "Signing out" : "Sign out"}
            className={`${iconButtonClassName} cursor-pointer text-[var(--color-muted)] hover:border-[var(--color-line)] hover:text-[var(--color-negative)] focus-visible:outline-[var(--color-negative)] disabled:opacity-60`}
          >
            <SignOutIcon />
            <HoverLabel>
              <span className="text-[10px] tracking-[0.14em]">
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </span>
            </HoverLabel>
          </button>
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`${iconButtonClassName} cursor-pointer text-[var(--color-muted)] hover:border-[var(--color-line)] hover:text-[var(--color-ink)]`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            <HoverLabel>
              <span className="text-[10px] tracking-[0.14em]">
                {isDark ? "Light" : "Dark"}
              </span>
            </HoverLabel>
          </button>
          <div className="ml-2">{renderProfileCard()}</div>
        </nav>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-[var(--color-line)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] md:hidden"
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
          className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActiveLink(link.href, pathname) ? "page" : undefined}
                className={`${linkClassNameFor(link.href, pathname)} min-h-11 flex items-center gap-3 border-b border-[var(--color-line)] pb-3`}
              >
                <NavIcon href={link.href} />
                {link.label}
              </Link>
            ))}
            {renderProfileCard(() => setIsMenuOpen(false))}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                void handleLogout();
              }}
              disabled={isLoggingOut}
              className="min-h-11 flex items-center gap-3 pt-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-negative)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-negative)] disabled:opacity-60"
            >
              <SignOutIcon />
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                handleToggleTheme();
              }}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="min-h-11 flex items-center gap-3 pt-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>
          </div>
        </nav>
      )}
      {logoutError && (
        <div
          role="alert"
          className="border-t border-[var(--color-negative)] px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-negative)]"
        >
          {logoutError}
        </div>
      )}
    </header>
  );
}
