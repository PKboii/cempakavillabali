import { useState } from "react";
import { Reveal, RevealLine } from "../components/Reveal";
import { EXPERIENCES, GALLERY } from "../data";

export function Rituals() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="rituals" className="relative py-28 md:py-40 px-5 md:px-10 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-4 mb-6">
              <span className="font-display italic text-gold text-lg">04</span>
              <span className="w-10 h-px bg-gold/60" />
              <span className="label text-gold">Rituals</span>
            </p>
            <h2 className="font-display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[1.02] display-shadow">
              <RevealLine>Days here run on</RevealLine>
              <br />
              <RevealLine delay={120}>
                <em className="italic text-flare">river time</em>
              </RevealLine>
            </h2>
          </div>
          <Reveal delay={200} className="lg:col-span-4 lg:col-start-9 self-end">
            <p className="text-dim leading-relaxed text-[15px]">
              Nothing is compulsory and everything is arranged — tap a ritual and the house takes care of the rest.
              Your butler replies in minutes, not hours.
            </p>
          </Reveal>
        </div>

        <div className="border-t border-line">
          {EXPERIENCES.map((e, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={e.index} delay={i * 70}>
                <div className="border-b border-line">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="exp-row w-full flex items-center gap-6 md:gap-10 py-6 md:py-7 text-left group"
                  >
                    <span className={`font-display italic text-lg md:text-xl w-10 shrink-0 transition-colors duration-300 ${isOpen ? "text-gold" : "text-dim"}`}>
                      {e.index}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block font-display text-2xl md:text-[2.1rem] leading-tight transition-colors duration-300 ${isOpen ? "text-flare" : "text-ink group-hover:text-flare"}`}>
                        {e.title}
                      </span>
                      <span className="label text-dim block mt-1.5">{e.meta}</span>
                    </span>
                    <span
                      className={`w-10 h-10 shrink-0 border flex items-center justify-center transition-all duration-500 ${
                        isOpen ? "border-gold bg-gold/10 rotate-45" : "border-line group-hover:border-gold/60"
                      }`}
                      aria-hidden
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div className={`exp-body ${isOpen ? "open" : ""}`}>
                    <div>
                      <p className="max-w-2xl lg:ml-[4.5rem] lg:pl-10 pb-7 text-dim leading-relaxed text-[15px]">
                        {e.body}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Moments() {
  return (
    <section id="moments" className="relative py-28 md:py-40 px-5 md:px-10 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <p className="flex items-center gap-4 mb-6">
          <span className="font-display italic text-gold text-lg">05</span>
          <span className="w-10 h-px bg-gold/60" />
          <span className="label text-gold">Moments</span>
        </p>
        <h2 className="font-display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[1.02] display-shadow mb-16 max-w-3xl">
          <RevealLine>Three frames the</RevealLine>{" "}
          <RevealLine delay={100}>
            <em className="italic text-flare">house remembers</em>
          </RevealLine>
        </h2>

        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          <Reveal className="md:col-span-5">
            <figure className="img-frame border border-line" data-hot>
              <img src={GALLERY[0].src} alt={GALLERY[0].caption} className="w-full aspect-[4/3] object-cover" loading="lazy" />
            </figure>
            <figcaption className="mt-3">
              <p className="label text-flare">{GALLERY[0].caption}</p>
              <p className="text-dim text-[13px] mt-1.5 leading-relaxed">{GALLERY[0].note}</p>
            </figcaption>
          </Reveal>

          <Reveal delay={160} className="md:col-span-4 md:mt-24">
            <figure className="img-frame border border-line" data-hot>
              <img src={GALLERY[1].src} alt={GALLERY[1].caption} className="w-full aspect-[3/4] object-cover" loading="lazy" />
            </figure>
            <figcaption className="mt-3">
              <p className="label text-flare">{GALLERY[1].caption}</p>
              <p className="text-dim text-[13px] mt-1.5 leading-relaxed">{GALLERY[1].note}</p>
            </figcaption>
          </Reveal>

          <Reveal delay={300} className="md:col-span-3 md:mt-10">
            <figure className="img-frame border border-line" data-hot>
              <img src={GALLERY[2].src} alt={GALLERY[2].caption} className="w-full aspect-[3/4] object-cover" loading="lazy" />
            </figure>
            <figcaption className="mt-3">
              <p className="label text-flare">{GALLERY[2].caption}</p>
              <p className="text-dim text-[13px] mt-1.5 leading-relaxed">{GALLERY[2].note}</p>
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
