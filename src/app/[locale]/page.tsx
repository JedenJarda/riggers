import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Hero } from "@/components/Hero";
import { WhoWeAre } from "@/components/WhoWeAre";
import { WhatWeDo } from "@/components/WhatWeDo";
import { Work } from "@/components/Work";
import { Crew } from "@/components/Crew";
import { BookUs } from "@/components/BookUs";
import {
  COUNTRIES,
  PROJECTED_CITIES,
  ROUTES,
  GLOBE,
  VIEW_X,
  VIEW_Y,
  VIEW_W,
  VIEW_H,
} from "@/lib/europe-geo";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <main>
      <Hero
        countries={COUNTRIES}
        cities={PROJECTED_CITIES}
        routes={ROUTES}
        globe={GLOBE}
        viewX={VIEW_X}
        viewY={VIEW_Y}
        viewW={VIEW_W}
        viewH={VIEW_H}
      />
      <WhoWeAre />
      <WhatWeDo />
      <Work />
      <Crew />
      <BookUs />
    </main>
  );
}
