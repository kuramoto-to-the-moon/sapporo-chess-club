import { useState, useEffect } from "react";

export default function ScrollTop() {
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 400;
          const nearBottom =
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 120;
          setVisible(scrolled && !nearBottom);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!visible && pressed) setPressed(false);
  }, [visible, pressed]);

  function scrollToTop(e: React.MouseEvent<HTMLButtonElement>) {
    setPressed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    e.currentTarget.blur();
  }

  const colorClass = pressed
    ? "border-[#2563eb] text-[#2563eb]"
    : "border-[#e5e5e5] text-[#171717] [@media(hover:hover)]:hover:border-[#2563eb] [@media(hover:hover)]:hover:text-[#2563eb]";

  const visibilityClass = visible
    ? "opacity-100 translate-y-0 pointer-events-auto"
    : "opacity-0 translate-y-2 pointer-events-none";

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{ right: "max(1.5rem, calc((100vw - 56rem) / 2 - 1rem))" }}
      className={`fixed bottom-6 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-md bg-white border shadow-sm text-sm font-medium transition-all duration-150 cursor-pointer ${colorClass} ${visibilityClass}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <span className="text-xs font-semibold uppercase tracking-wider">Top</span>
    </button>
  );
}
