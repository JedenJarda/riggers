import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "de", "cs"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Brief mandates EN as the default. Don't auto-redirect Czech-speaking
  // browsers to /cs — only navigate there when the user picks it.
  localeDetection: false,
});
