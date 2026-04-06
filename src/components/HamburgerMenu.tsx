import { useState, useEffect } from "react";
import { t, getLocalePath, type Locale } from "@/i18n";

interface Props {
  locale: Locale;
}

export default function HamburgerMenu({ locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const i = t(locale);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const pages = [
    { label: i.nav.home, sub: i.sections.home, href: getLocalePath(locale, "/") },
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
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="flex flex-col items-center justify-center gap-[5px] cursor-pointer p-3 -m-3"
      >
        <span className="w-6 h-[2px] bg-[#171717]" />
        <span className="w-6 h-[2px] bg-[#171717]" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#171717] text-[#fafafa] animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between px-5 py-4">
            <span className="text-xs tracking-[3px] text-[#525252]">
              SAPPORO CHESS CLUB
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="text-2xl font-extralight cursor-pointer p-3 -m-3"
            >
              ✕
            </button>
          </div>

          <nav className="max-w-4xl mx-auto px-5 pt-8">
            {pages.map((page, idx) => (
              <a
                key={page.href}
                href={page.href}
                className="group block mb-6 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span className="text-4xl font-light group-hover:text-white transition-colors duration-150 inline-flex items-center gap-3">
                  {page.label}
                  <span className="text-2xl text-[#525252] group-hover:text-white group-hover:translate-x-2 transition-all duration-150">→</span>
                </span>
                <span className="block text-xs tracking-[1px] text-[#525252] mt-1">
                  {page.sub}
                </span>
              </a>
            ))}

            <div className="border-t border-[#2a2a2a] my-5" />

            <p className="text-xs tracking-[1px] text-[#525252] mb-3">
              {i.menu.sectionLabel}
            </p>
            <div className="flex flex-col gap-3">
              {anchors.map((anchor, idx) => (
                <a
                  key={anchor.href}
                  href={anchor.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-[#fafafa] transition-colors duration-150 animate-fade-in-up"
                  style={{ animationDelay: `${(pages.length + idx) * 0.05}s` }}
                >
                  {anchor.label}
                  <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150">→</span>
                </a>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-[#2a2a2a]">
            <div className="max-w-4xl mx-auto px-5 py-4">
              <span className="text-xs text-[#525252]">sapporochessclub@gmail.com</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
