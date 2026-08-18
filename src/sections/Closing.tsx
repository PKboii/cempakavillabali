import BookingForm from "../components/BookingForm";
import { Reveal, RevealLine } from "../components/Reveal";
import { MARQUEE_ITEMS } from "../data";
import { scrollToTarget } from "../lib/scroll";

export function BookStay() {
  return (
    <section id="book" className="relative py-28 md:py-40 px-5 md:px-10 lg:px-16">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-14 items-start">
        <div className="lg:col-span-6">
          <p className="flex items-center gap-4 mb-6">
            <span className="font-display italic text-gold text-lg">06</span>
            <span className="w-10 h-px bg-gold/60" />
            <span className="label text-gold">The Stay</span>
          </p>
          <h2 className="font-display text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.98] display-shadow mb-8">
            <RevealLine>Come watch the</RevealLine>
            <br />
            <RevealLine delay={120}>
              <em className="italic text-flare">lanterns turn on</em>
            </RevealLine>
          </h2>
          <Reveal delay={200}>
            <p className="text-ink/85 leading-relaxed text-[15px] max-w-md mb-10">
              The estate is rented whole — never by the room. Rates hold year-round, staff included, and the river
              does not charge extra for the view. Tell us your dates; the house answers the same day.
            </p>
          </Reveal>

          <Reveal delay={280}>
            <div className="space-y-5 border-t border-line pt-8 max-w-md">
              {[
                { k: "Write", v: "stay@villacahaya.id", href: "mailto:stay@villacahaya.id" },
                { k: "Call · WhatsApp", v: "+62 361 555 016", href: "tel:+62361555016" },
                { k: "Find us", v: "8.5069° S — 115.2625° E", href: "https://maps.google.com/?q=-8.5069,115.2625" },
              ].map((c) => (
                <a key={c.k} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                  className="group flex items-baseline justify-between gap-6 py-1 border-b border-line/60 hover:border-gold/50 transition-colors duration-300">
                  <span className="label text-dim group-hover:text-gold transition-colors duration-300">{c.k}</span>
                  <span className="font-display text-lg text-ink/90 group-hover:text-flare transition-colors duration-300">{c.v}</span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="lg:col-span-6">
          <BookingForm />
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative pt-10 border-t border-line overflow-hidden">
      <div className="marquee py-6 select-none" aria-hidden>
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {MARQUEE_ITEMS.map((item, i) => (
                <span key={i} className="flex items-center">
                  <span className={`px-8 font-display italic text-3xl md:text-5xl ${i % 2 ? "text-ink/25" : "text-gold/60"}`}>
                    {item}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                    <rect x="2.2" y="2.2" width="5.6" height="5.6" transform="rotate(45 5 5)" fill="#e2a856" opacity="0.5" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="hairline" />

      <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <p className="label text-dim">
          © {new Date().getFullYear()} Villa Cahaya · imagined &amp; hand-built in Bali
        </p>
        <div className="flex items-center gap-6">
          <a
            href="mailto:stay@villacahaya.id"
            className="text-[13px] text-ink/70 hover:text-flare transition-colors duration-300"
          >
            stay@villacahaya.id
          </a>
          <button
            onClick={async () => {
              const { downloadSourceZip } = await import("../lib/downloadSource");
              await downloadSourceZip();
            }}
            className="text-[13px] text-ink/70 hover:text-flare transition-colors duration-300 border-b border-line hover:border-gold pb-0.5"
          >
            Download source (.zip)
          </button>
          <button
            onClick={() => scrollToTarget(0)}
            className="group flex items-center gap-2.5 border border-line px-4 py-2.5 text-[11px] font-bold tracking-[0.2em] uppercase text-ink/70 hover:text-flare hover:border-gold transition-all duration-300"
          >
            Back to the gate
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden>
              <path d="M5 11V1M1 4.5L5 1l4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
