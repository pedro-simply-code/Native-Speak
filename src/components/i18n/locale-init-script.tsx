import { LOCALE_COOKIE, defaultLocale, locales } from "@/lib/i18n/config";

/**
 * Aligns <html lang> with ns_locale before React hydrates (SSR shell uses default until Suspense resolves).
 */
export function LocaleInitScript() {
  const script = `
(function (cookieName, allowed, fallback) {
  try {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      var prefix = cookieName + "=";
      if (part.indexOf(prefix) !== 0) continue;
      var loc = decodeURIComponent(part.slice(prefix.length));
      if (allowed.indexOf(loc) !== -1) {
        document.documentElement.lang = loc;
        return;
      }
    }
    document.documentElement.lang = fallback;
  } catch (e) {}
})(${JSON.stringify(LOCALE_COOKIE)}, ${JSON.stringify([...locales])}, ${JSON.stringify(defaultLocale)});
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
