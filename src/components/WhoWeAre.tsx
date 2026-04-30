import { useTranslations } from "next-intl";
import { Eyebrow, SectionFrame } from "./SectionFrame";

export function WhoWeAre() {
  const t = useTranslations("About");

  return (
    <SectionFrame id="about" className="bg-ink-950 py-28 md:py-36">
      <div className="relative mx-auto max-w-4xl px-6 md:px-12 lg:px-20">
        {/* Vertical accent rail running down the left side of the copy */}
        <span
          aria-hidden
          className="absolute left-6 top-8 hidden h-40 w-px bg-gradient-to-b from-neon-400 via-neon-500/40 to-transparent md:block md:left-12 lg:left-20"
        />
        <div className="md:pl-10">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <div className="space-y-6 font-display text-xl leading-relaxed text-cream sm:text-2xl md:text-[26px] md:leading-[1.35]">
            <p>{t("p1")}</p>
            <p className="text-mist/80">{t("p2")}</p>
            <p className="text-cream">{t("p4")}</p>
            <p className="text-mist/80">{t("p3")}</p>
            <p>{t("p5")}</p>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
