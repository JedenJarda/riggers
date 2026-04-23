import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

// Plus Jakarta Sans — double-story "g" (closed loop bottom) avoids the
// left-leaning tail Space Grotesk has on "gg". Clean geometric display.
const display = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "riggers.cz — Your Local Riggers across Europe",
  description:
    "A collective of freelance riggers based in the Czech Republic, working across Europe as a local extension of your team.",
  metadataBase: new URL("https://riggers.cz"),
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink-950 text-cream">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
