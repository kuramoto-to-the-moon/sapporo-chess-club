import { useState, useEffect } from "react";

export default function ScrollTop() {
  const [visible, setVisible] = useState(false);

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

  function scrollToTop(e: React.MouseEvent<HTMLButtonElement>) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    e.currentTarget.blur();
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-white border border-[#e5e5e5] text-[#171717] active:border-[#2563eb] active:text-[#2563eb] [@media(hover:hover)]:hover:border-[#2563eb] [@media(hover:hover)]:hover:text-[#2563eb] transition-all duration-150 cursor-pointer shadow-sm ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
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
