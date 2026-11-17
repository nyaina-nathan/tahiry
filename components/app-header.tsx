"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export type AppHeaderLink = {
  href: string;
  label: string;
};

export const PRIMARY_NAV_LINKS: AppHeaderLink[] = [
  { href: "/", label: "Overview" },
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
          href="/"
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
        >
          <img alt="tahiry-logo" className="w-[5ch]" src={"/icon.png"} />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-ink)]">
            Tahiry
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-4 sm:flex sm:gap-6"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActiveLink(link.href, pathname) ? "page" : undefined}
              className={linkClassNameFor(link.href, pathname)}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-negative)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-negative)] disabled:opacity-60 cursor-pointer"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] cursor-pointer"
          >
            {isDark ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
            <span>{isDark ? "Light" : "Dark"}</span>
          </button>
          {renderProfileCard()}
        </nav>
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-[var(--color-line)] transition-colors hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] sm:hidden"
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
                aria-current={isActiveLink(link.href, pathname) ? "page" : undefined}
                className={`${linkClassNameFor(link.href, pathname)} min-h-11 flex items-center border-b border-[var(--color-line)] pb-3`}
              >
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
              className="min-h-11 flex items-center pt-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-negative)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-negative)] disabled:opacity-60"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                handleToggleTheme();
              }}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="min-h-11 flex items-center gap-2 pt-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
            >
              {isDark ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                  />
                </svg>
              )}
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
