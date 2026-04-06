import { useState } from "react";
import { t, getLocalePath, type Locale } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface Props {
  locale: Locale;
  currentPath: string;
}

export default function HamburgerMenu({ locale, currentPath }: Props) {
  const otherLocale: Locale = locale === "ja" ? "en" : "ja";
  const otherPath = getLocalePath(otherLocale, currentPath);
  const [isOpen, setIsOpen] = useState(false);
  const i = t(locale);

  const pages = [
    { label: i.nav.home, sub: i.sections.home, href: getLocalePath(locale, "/") },
    { label: i.schedule.label, sub: "SCHEDULE", href: getLocalePath(locale, "/schedule") },
    { label: i.nav.tournaments, sub: i.sections.tournaments, href: getLocalePath(locale, "/tournaments") },
  ];

  const homeHref = getLocalePath(locale, "/");
  const isHome = currentPath === "/" || currentPath === "";
  const anchorHref = (id: string) => (isHome ? `#${id}` : `${homeHref}#${id}`);

  const anchors = [
    { label: i.menu.schedule, href: anchorHref("schedule") },
    { label: i.menu.activities, href: anchorHref("activities") },
    { label: i.menu.info, href: anchorHref("info") },
    { label: i.menu.lessons, href: anchorHref("lessons") },
    { label: i.menu.contact, href: anchorHref("contact") },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="flex flex-col items-center justify-center gap-[5px] h-auto w-auto p-3 -m-3 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <span className="w-6 h-[2px] bg-[#171717]" aria-hidden="true" />
          <span className="w-6 h-[2px] bg-[#171717]" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="full"
        aria-label="Navigation menu"
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="bg-[#171717] text-[#fafafa] border-0 p-0 [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>

        <div className="max-w-4xl mx-auto flex items-center justify-between px-5 py-4">
          <span className="text-xs tracking-[3px] text-[#737373]" aria-hidden="true">
            SAPPORO CHESS CLUB
          </span>
          <SheetClose
            aria-label="Close navigation menu"
            className="text-2xl font-extralight cursor-pointer p-3 -m-3 text-[#fafafa] focus:outline-none focus-visible:ring-0"
          >
            <span aria-hidden="true">✕</span>
          </SheetClose>
        </div>

        <nav className="max-w-4xl mx-auto px-5 pt-8" aria-label="Main navigation">
          {pages.map((page, idx) => (
            <a
              key={page.href}
              href={page.href}
              className="group block mb-6 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
              aria-current={page.href === getLocalePath(locale, currentPath) ? "page" : undefined}
            >
              <span className="text-4xl font-light group-hover:text-white transition-colors duration-150 inline-flex items-center gap-3">
                {page.label}
                <span className="text-2xl text-[#d4d4d4] group-hover:text-white group-hover:translate-x-2 transition-all duration-150" aria-hidden="true">→</span>
              </span>
              <span className="block text-xs tracking-[1px] text-[#d4d4d4] mt-1">
                {page.sub}
              </span>
            </a>
          ))}

          <div className="border-t border-[#2a2a2a] my-5" role="separator" />

          <p className="text-xs uppercase tracking-wider text-[#737373] mb-3">
            {i.menu.sectionLabel}
          </p>
          <div className="flex flex-col gap-3">
            {anchors.map((anchor, idx) => {
              const isSamePage = anchor.href.startsWith("#");
              const anchorEl = (
                <a
                  href={anchor.href}
                  className="group flex items-center gap-2 text-sm text-[#d4d4d4] hover:text-[#fafafa] transition-colors duration-150 animate-fade-in-up"
                  style={{ animationDelay: `${(pages.length + idx) * 0.05}s` }}
                >
                  {anchor.label}
                  <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150" aria-hidden="true">→</span>
                </a>
              );
              return isSamePage ? (
                <SheetClose asChild key={anchor.href}>
                  {anchorEl}
                </SheetClose>
              ) : (
                <span key={anchor.href}>{anchorEl}</span>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[#2a2a2a]">
          <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
            <a
              href="mailto:sapporochessclub@gmail.com"
              className="text-xs text-[#d4d4d4] hover:text-[#fafafa] transition-colors duration-150"
            >
              sapporochessclub@gmail.com
            </a>
            <a
              href={otherPath}
              className="text-xs tracking-[2px] text-[#d4d4d4] hover:text-[#fafafa] transition-colors duration-150"
              aria-label={locale === "ja" ? "Switch to English" : "日本語に切り替え"}
              hrefLang={otherLocale}
            >
              {locale === "ja" ? "EN" : "JA"}
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
