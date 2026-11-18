import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#accounts", label: "Accounts" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/login", label: "Log in" },
];

export function LandingFooter() {
  return (
    <footer className="px-5 pb-10 pt-12 sm:px-8 sm:pb-12 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-8 border-t border-black pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              aria-label="Tahiry home"
              className="inline-flex items-center gap-2"
            >
              <Image
                src="/icon.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-[5px] border border-black"
              />
              <span className="uc-display text-2xl leading-none">Tahiry</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-[1.4] text-[#6e6e6e]">
              A clearer view of your spending, income, and the small choices
              that shape your everyday life.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium"
          >
            {FOOTER_LINKS.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-[#6e6e6e]"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-[#6e6e6e]"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-black pt-6 text-xs text-[#6e6e6e] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tahiry. Built for brokies.</p>
          <p className="uc-kicker text-[#3a3a3a]">Money, made visible.</p>
        </div>
      </div>
    </footer>
  );
}
