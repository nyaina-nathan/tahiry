import type { Metadata } from "next";
import { Caveat_Brush, Inter, Roboto_Condensed } from "next/font/google";

const display = Roboto_Condensed({
  variable: "--font-landing-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-landing-body",
  subsets: ["latin"],
  display: "swap",
});

const hand = Caveat_Brush({
  variable: "--font-landing-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tahiry — money, made obvious",
  description:
    "Tahiry is the loud, simple money tracker that shows you where every coin went. Log expenses and income, track your accounts, and see your cashflow clearly.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${display.variable} ${body.variable} ${hand.variable} uc-landing min-h-screen`}
    >
      {children}
    </div>
  );
}
