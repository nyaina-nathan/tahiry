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
  title: "Pennywise. 'cause you are broke(or not)",
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
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
