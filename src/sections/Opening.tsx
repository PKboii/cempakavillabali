import { useEffect, useState } from "react";
import { scrollToTarget } from "../lib/scroll";

function WitaClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Makassar",
      hour: "2-digit",
      minute: "2-digit",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time} WITA</span>;
}

function Seal() {
  return (
    <div className="relative w-32 h-32" aria-hidden>
      <svg viewBox="0 0 120 120" className="w-full h-full spin-slow">
        <defs>
          <path id="seal-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="label" fill="rgba(239,230,208,0.65)" fontSize="8.2" letterSpacing="2.6">
          <textPath href="#seal-circle">VILLA CAHAYA · UBUD · BALI · AYUNG GORGE ·</textPath>
        </text>
      </svg>
      <svg viewBox="0 0 32 32" className="absolute inset-0 m-auto w-8 h-8 floaty" fill="none">
        <path d="M16 5l9 20h-4.6l-4.4-10.4L11.6 25H7L16 5Z" fill="#e2a856" />
      </svg>
    </div>
  );
}

export default function Opening() {
  return (
    <section id="top" className="relative min-h-screen flex flex-col justify-between px-5 md:px-10 lg:px-16 pt-24 pb-8 overflow-hidden">
      {/* top strip */}
      <div className="hero-fade flex items-center justify-between label text-ink/60 body-shadow">
        <span className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-gold pulse-dot" />
          Private estate — Ubud, Bali
        </span>
        <span className="hidden sm:block text-dim">
          <WitaClock /> · sunset 18:04
        </span>
      </div>

      {/* the name */}
      <div data-drift style={{ "--drift": -0.06 } as React.CSSProperties} className="hero-fade relative z-10 -mb-4">
        <p className="flex items-center gap-4 mb-5">
          <span className="w-12 h-px bg-gold/80" />
          <span className="label text-gold body-shadow">Est. 2016 · three pavilions · sleeps eight</span>
        </p>
        <h1 className="font-display leading-[0.85] display-shadow">
          <span className="block font-body font-extrabold text-ink/90 text-[clamp(1.05rem,2.6vw,1.9rem)] tracking-[0.5em] uppercase mb-3 md:mb-5 pl-1">
            Villa
          </span>
          <span className="block italic font-light text-ink text-[clamp(4.3rem,16vw,14rem)]">
            Cahaya<span className="text-gold not-italic">.</span>
          </span>
        </h1>
      </div>

      {/* bottom row */}
      <div data-drift style={{ "--drift": -0.02 } as React.CSSProperties} className="hero-fade relative z-10 mt-10 grid md:grid-cols-12 gap-8 items-end">
        <p className="md:col-span-5 text-[15px] leading-relaxed text-ink/85 body-shadow max-w-md">
          A walled compound of teak and black stone, cut into the jungle a hundred feet above the Ayung river.
          Scroll, and the house will walk you through itself — gate to pool to lantern hour.
        </p>

        <div className="hidden md:flex md:col-span-4 justify-center">
          <button
            onClick={() => scrollToTarget("#arrival")}
            className="group flex flex-col items-center gap-3"
            data-hot
            aria-label="Scroll to the gate"
          >
            <span className="label text-ink/60 group-hover:text-flare transition-colors duration-300">Descend</span>
            <span className="relative w-px h-14 bg-line overflow-hidden scrollcue" />
          </button>
        </div>

        <div className="hidden md:flex md:col-span-3 justify-end items-end gap-8">
          <div className="text-right">
            <p className="label text-dim mb-1.5">Coordinates</p>
            <a
              href="https://maps.google.com/?q=-8.5069,115.2625"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-ink/80 hover:text-flare transition-colors duration-300 tabular-nums"
            >
              8.5069° S — 115.2625° E
            </a>
          </div>
          <Seal />
        </div>
      </div>

      {/* vertical edge note */}
      <div className="absolute right-4 lg:right-7 top-1/2 -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] label text-ink/40 body-shadow hidden lg:block">
        Above the Ayung gorge — altitude 340 m
      </div>
    </section>
  );
}
