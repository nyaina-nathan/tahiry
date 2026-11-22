import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Tahiry — Every coin, in plain sight",
  description:
    "Track what comes in, what goes out, and what is left across every account. Tahiry keeps your everyday money clear.",
};

export default function Home() {
  return <LandingPage />;
}
