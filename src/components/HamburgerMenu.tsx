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
    { label: i.menu.links, href: "#links" },
    { label: i.menu.contact, href: "#contact" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="flex flex-col gap-[3px] cursor-pointer"
      >
        <span className="w-4 h-[1.5px] bg-[#171717]" />
        <span className="w-4 h-[1.5px] bg-[#171717]" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#171717] text-[#fafafa] animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-xs tracking-[3px] text-[#525252]">
              SAPPORO CHESS CLUB
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="text-xl font-extralight cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="px-5 pt-8">
            {pages.map((page, idx) => (
              <a
                key={page.href}
                href={page.href}
                onClick={() => setIsOpen(false)}
                className="block mb-6 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span className="text-4xl font-light">{page.label}</span>
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
                  className="text-base text-[#a3a3a3] hover:text-[#fafafa] transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${(pages.length + idx) * 0.05}s` }}
                >
                  {anchor.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-[#2a2a2a]">
            <span className="text-xs text-[#525252]">sapporochessclub@gmail.com</span>
          </div>
        </div>
      )}
    </>
  );
}
