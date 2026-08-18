import { useEffect, useState } from "react";
import { CHAPTERS } from "../data";
import { scrollToTarget } from "../lib/scroll";

export default function ProgressRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const idx = CHAPTERS.findIndex((c) => c.id === active);
  const chapter = CHAPTERS[idx] ?? CHAPTERS[0];

  return (
    <>
      {/* dots — right edge */}
      <div className="fixed right-5 lg:right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-4">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            aria-label={`Go to ${c.label}`}
            onClick={() => scrollToTarget(`#${c.id}`)}
            className="group relative flex items-center"
          >
            <span className="rail-dot block w-[7px] h-[7px] rounded-full bg-ink/30" data-active={c.id === active}
              style={c.id === active ? { background: "var(--color-gold)", transform: "scale(1.5)", boxShadow: "0 0 14px rgba(226,168,86,0.55)" } : undefined}
            />
            <span className="absolute right-5 whitespace-nowrap label text-ink/0 group-hover:text-ink/80 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
              {String(i).padStart(2, "0")} · {c.label}
            </span>
          </button>
        ))}
      </div>

      {/* current chapter — bottom left */}
      <div className="fixed left-5 lg:left-10 bottom-6 z-50 hidden sm:flex items-center gap-3 pointer-events-none">
        <span className="w-8 h-px bg-gold/70" />
        <span key={chapter.id} className="pop label text-ink/70 body-shadow">
          {String(idx).padStart(2, "0")} — {chapter.label}
        </span>
      </div>
    </>
  );
}
