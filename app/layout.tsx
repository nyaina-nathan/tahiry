import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";
import { JetBrains_Mono, Limelight } from "next/font/google";
import "./globals.css";

const limelight = Limelight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tahiry. 'cause you are broke(or not)",
  description: "Manage your money my friend",
};

const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${limelight.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>

      <SpeedInsights />
    </html>
  );
}
