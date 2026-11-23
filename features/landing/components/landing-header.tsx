import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

export function LandingHeader() {
  return (
    <header className="relative z-20 mx-auto w-full max-w-[87.5rem] px-5 pt-5 sm:px-8 sm:pt-7 lg:px-12 lg:pt-8 xl:px-16">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Tahiry home"
          className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a7f3d0]"
        >
          <Image
            src="/icon.png"
            alt=""
            width={36}
            height={36}
            loading="eager"
            className="h-9 w-9 rounded-[0.65rem] object-cover ring-1 ring-white/15"
          />
          <span className="text-sm font-bold uppercase tracking-[0.24em] text-white">
            Tahiry
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#022c22]/45 p-1.5 backdrop-blur-md md:flex"
        >
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.label}
              href={link.href}
              className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-150 ${
                index === 0
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="landing-pill inline-flex min-h-10 items-center justify-center rounded-full bg-(--color-accent-inverse) px-5 text-sm font-bold text-[#022c22] shadow-[0_10px_36px_-14px_rgba(52,211,153,0.9)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a7f3d0] sm:min-h-11 sm:px-6"
        >
          Signup
        </Link>
      </div>
    </header>
  );
}
