"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#accounts", label: "Accounts" },
  { href: "#how-it-works", label: "How it works" },
];

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-[1080px] -translate-x-1/2 sm:top-5">
      <div className="rounded-2xl border border-black bg-white">
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-5 sm:py-2.5">
          <Link
            href="/"
            aria-label="Tahiry home"
            className="flex shrink-0 items-center gap-2"
          >
            <Image
              src="/icon.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-[5px] border border-black"
              priority
            />
            <span className="uc-display text-[1.55rem] leading-none tracking-[-0.02em]">
              Tahiry
            </span>
          </Link>

          <nav
            aria-label="Landing page navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[#f2f2f2]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-2xl border border-black bg-white py-1.5 pl-1.5 pr-3 text-[13px] font-medium transition-colors hover:bg-[#e7e3bf]"
            >
              <span className="flex h-5 w-5 items-center justify-center bg-black text-white">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </span>
              Open app
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="landing-mobile-nav"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-xl border border-black bg-white transition-colors hover:bg-[#f2f2f2] md:hidden"
            >
              <span
                aria-hidden="true"
                className={`h-[2px] w-4 bg-black transition-transform ${
                  isMenuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                aria-hidden="true"
                className={`h-[2px] w-4 bg-black transition-opacity ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                aria-hidden="true"
                className={`h-[2px] w-4 bg-black transition-transform ${
                  isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            id="landing-mobile-nav"
            aria-label="Mobile landing navigation"
            className="border-t border-black px-3 pb-3 pt-2 md:hidden"
          >
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-11 items-center border-b border-black/15 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-black bg-[#adff02] px-4 text-sm font-bold"
              >
                Start tracking free
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
