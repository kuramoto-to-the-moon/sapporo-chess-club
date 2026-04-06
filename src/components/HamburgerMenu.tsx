import { useState, useEffect, useRef } from "react";
import { t, getLocalePath, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
  currentPath: string;
}

export default function HamburgerMenu({ locale, currentPath }: Props) {
  const otherLocale: Locale = locale === "ja" ? "en" : "ja";
  const otherPath = getLocalePath(otherLocale, currentPath);
  const [isOpen, setIsOpen] = useState(false);
  const i = t(locale);

  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Move focus to close button when dialog opens
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      // Return focus to open button when dialog closes
      openButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key; trap focus within dialog
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const pages = [
    { label: i.nav.home, sub: i.sections.home, href: getLocalePath(locale, "/") },
    { label: i.schedule.label, sub: "SCHEDULE", href: getLocalePath(locale, "/schedule") },
    { label: i.nav.tournaments, sub: i.sections.tournaments, href: getLocalePath(locale, "/tournaments") },
  ];

  const anchors = [
    { label: i.menu.schedule, href: "#schedule" },
    { label: i.menu.activities, href: "#activities" },
    { label: i.menu.info, href: "#info" },
    { label: i.menu.lessons, href: "#lessons" },
    { label: i.menu.contact, href: "#contact" },
  ];

  return (
    <>
      <button
        ref={openButtonRef}
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex flex-col items-center justify-center gap-[5px] cursor-pointer p-3 -m-3"
      >
        <span className="w-6 h-[2px] bg-[#171717]" aria-hidden="true" />
        <span className="w-6 h-[2px] bg-[#171717]" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 bg-[#171717] text-[#fafafa] animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between px-5 py-4">
            <span className="text-xs tracking-[3px] text-[#737373]" aria-hidden="true">
              SAPPORO CHESS CLUB
            </span>
            <button
              ref={closeButtonRef}
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              className="text-2xl font-extralight cursor-pointer p-3 -m-3 text-[#fafafa]"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <nav className="max-w-4xl mx-auto px-5 pt-8" aria-label="Main navigation">
            {pages.map((page, idx) => (
              <a
                key={page.href}
                href={page.href}
                onClick={() => setIsOpen(false)}
                className="group block mb-6 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
                aria-current={page.href === currentPath ? "page" : undefined}
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

            <p className="text-xs tracking-[1px] text-[#d4d4d4] mb-3">
              {i.menu.sectionLabel}
            </p>
            <div className="flex flex-col gap-3">
              {anchors.map((anchor, idx) => (
                <a
                  key={anchor.href}
                  href={anchor.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-2 text-sm text-[#d4d4d4] hover:text-[#fafafa] transition-colors duration-150 animate-fade-in-up"
                  style={{ animationDelay: `${(pages.length + idx) * 0.05}s` }}
                >
                  {anchor.label}
                  <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[#2a2a2a]">
            <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
              <span className="text-xs text-[#d4d4d4]">sapporochessclub@gmail.com</span>
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
        </div>
      )}
    </>
  );
}
