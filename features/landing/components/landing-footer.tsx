import Image from "next/image";
import Link from "next/link";

const GITHUB_URL = "https://github.com/nyaina-nathan/tahiry";
const CONTACT_EMAIL = "nyaina.nathan.2@gmail.com";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
  { label: "GitHub", href: GITHUB_URL, external: true },
  { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
] as const;

export function LandingFooter() {
  return (
    <footer className="bg-[#053a2c] text-white">
      <div className="mx-auto w-full max-w-[87.5rem] px-5 py-9 sm:px-8 sm:py-11 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div>
            <Link
              href="/"
              aria-label="Tahiry home"
              className="flex w-fit items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a7f3d0]"
            >
              <Image
                src="/icon.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded-[0.55rem] object-cover ring-1 ring-white/15"
              />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-white">
                Tahiry
              </span>
            </Link>

            <p className="mt-3 text-[11px] leading-5 text-white/45">
              © {new Date().getFullYear()} Tahiry
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {FOOTER_LINKS.map((link) => {
              const isExternal = "external" in link && link.external;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer noopener" : undefined}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a7f3d0]"
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
