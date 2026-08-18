import { useEffect, useState } from "react";
import { NAV_LINKS } from "../data";
import { scrollToTarget } from "../lib/scroll";
import { ambience } from "../lib/audio";

function BrandMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 3.5L26.5 27H21.6L16 14.6 10.4 27H5.5L16 3.5Z" fill="#e2a856" />
      <path d="M16 20.5L19.4 28H12.6L16 20.5Z" fill="#efe6d0" opacity="0.9" />
    </svg>
  );
}

export default function Nav() {
  const [soundOn, setSoundOn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(id);
  };

  const toggleSound = async () => {
    const playing = await ambience.toggle();
    setSoundOn(playing);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[rgba(8,14,11,0.82)] backdrop-blur-md border-b border-line" : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* scroll progress */}
      <div className="absolute top-0 left-0 h-[2px] w-full bg-gold/80 progress-bar" />

      <div className="max-w-[1400px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-6">
        <a
          href="#top"
          onClick={go("#top")}
          className="flex items-center gap-3 group"
          aria-label="Villa Cahaya — back to top"
        >
          <span className="transition-transform duration-500 group-hover:rotate-12">
            <BrandMark />
          </span>
          <span className="font-display text-lg tracking-wide">
            Villa <em className="italic text-gold">Cahaya</em>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.slice(0, 5).map((l) => (
            <a
              key={l.id}
              href={l.id}
              onClick={go(l.id)}
              className="relative text-[13px] font-semibold tracking-[0.14em] uppercase text-ink/70 hover:text-flare transition-colors duration-300 after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-400 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            aria-label={soundOn ? "Mute ambience" : "Play ambience"}
            className={`h-9 px-3 flex items-center gap-2 border transition-all duration-300 ${
              soundOn ? "border-gold/70 text-flare bg-gold/10" : "border-line text-ink/60 hover:text-ink hover:border-ink/40"
            }`}
          >
            <span className="flex items-end gap-[3px] h-3.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-[2.5px] bg-current transition-all duration-300 ${soundOn ? "pulse-dot" : ""}`}
                  style={{ height: `${[5, 9, 6, 11][i]}px`, animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </span>
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase">{soundOn ? "On" : "Gamelan"}</span>
          </button>

          <a
            href="#book"
            onClick={go("#book")}
            className="h-9 px-5 bg-gold text-[#141008] text-[12px] font-extrabold tracking-[0.16em] uppercase flex items-center gap-2 transition-all duration-300 hover:bg-flare hover:shadow-[0_0_28px_rgba(226,168,86,0.45)]"
          >
            Book
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 6h7M6 2.5L9.5 6 6 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
