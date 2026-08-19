import { Reveal, RevealLine, CountUp } from "../components/Reveal";
import { STATS, AMENITIES, IMAGES } from "../data";

/* ---------------------------------------------------------------- */
/* Interactive compound plan                                          */
/* ---------------------------------------------------------------- */
function CompoundPlan() {
  const hotspot = "opacity-0 group-hover:opacity-100 transition-opacity duration-300";
  return (
    <div className="border border-line bg-[rgba(8,14,11,0.6)] p-4 md:p-6">
      <svg viewBox="0 0 420 310" className="w-full h-auto" role="img" aria-label="Plan of the Villa Cahaya compound">
        {/* boundary */}
        <rect x="16" y="16" width="388" height="278" fill="rgba(17,28,21,0.55)" stroke="rgba(239,230,208,0.18)" strokeDasharray="5 5" />
        {/* river */}
        <path d="M34 24 C 50 80, 22 130, 40 190 S 60 260, 36 292" fill="none" stroke="#4fae8f" strokeOpacity="0.45" strokeWidth="7" strokeLinecap="round" />
        <text x="20" y="160" fill="#4fae8f" fillOpacity="0.7" fontSize="9" letterSpacing="3" transform="rotate(-78 20 160)" className="uppercase">Ayung</text>

        {/* main pavilion */}
        <g className="group" data-hot>
          <rect x="170" y="52" width="76" height="56" fill="rgba(226,168,86,0.08)" stroke="#e2a856" strokeWidth="1.2" />
          <rect x="186" y="64" width="44" height="32" fill="none" stroke="#e2a856" strokeOpacity="0.6" transform="rotate(45 208 80)" />
          <circle cx="208" cy="80" r="2.4" fill="#f6c97c" />
          <text x="208" y="42" textAnchor="middle" fill="#efe6d0" fontSize="10" letterSpacing="2" className={hotspot + " uppercase"}>Main pavilion</text>
        </g>

        {/* pool */}
        <g className="group" data-hot>
          <rect x="146" y="136" width="124" height="48" fill="rgba(79,174,143,0.16)" stroke="#4fae8f" strokeWidth="1.2" />
          <line x1="152" y1="160" x2="264" y2="160" stroke="#4fae8f" strokeOpacity="0.35" strokeDasharray="3 4" />
          <text x="208" y="165" textAnchor="middle" fill="#efe6d0" fontSize="10" letterSpacing="2" className={hotspot + " uppercase"}>25 m infinity pool</text>
        </g>

        {/* bale */}
        <g className="group" data-hot>
          <rect x="300" y="140" width="42" height="42" fill="rgba(226,168,86,0.06)" stroke="#e2a856" strokeOpacity="0.8" />
          <rect x="310" y="150" width="22" height="22" fill="none" stroke="#e2a856" strokeOpacity="0.5" transform="rotate(45 321 161)" />
          <text x="321" y="130" textAnchor="middle" fill="#efe6d0" fontSize="10" letterSpacing="2" className={hotspot + " uppercase"}>Yoga bale</text>
        </g>

        {/* gardens */}
        <g className="group" data-hot>
          {[
            [110, 60], [90, 120], [120, 210], [300, 60], [350, 100], [350, 220], [100, 260], [310, 262],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="9" fill="none" stroke="rgba(239,230,208,0.3)" />
              <circle cx={x} cy={y} r="1.6" fill="rgba(239,230,208,0.5)" />
            </g>
          ))}
          <text x="352" y="44" textAnchor="middle" fill="#efe6d0" fontSize="10" letterSpacing="2" className={hotspot + " uppercase"}>Frangipani gardens</text>
        </g>

        {/* gate + path */}
        <g className="group" data-hot>
          <line x1="208" y1="268" x2="208" y2="190" stroke="rgba(239,230,208,0.4)" strokeDasharray="2 6" />
          <rect x="192" y="268" width="12" height="14" fill="rgba(226,168,86,0.25)" stroke="#e2a856" />
          <rect x="212" y="268" width="12" height="14" fill="rgba(226,168,86,0.25)" stroke="#e2a856" />
          <text x="208" y="302" textAnchor="middle" fill="#efe6d0" fontSize="10" letterSpacing="2" className={hotspot + " uppercase"}>Candi bentar gate</text>
        </g>

        <text x="404" y="26" textAnchor="end" fill="rgba(239,230,208,0.4)" fontSize="9" letterSpacing="2">N ↑ · 6,200 m²</text>
      </svg>
      <p className="label text-dim mt-3 text-center">Hover the plan — the compound answers</p>
    </div>
  );
}

function Diamond() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" className="mt-1.5 shrink-0" aria-hidden>
      <rect x="2.2" y="2.2" width="5.6" height="5.6" transform="rotate(45 5 5)" fill="none" stroke="#e2a856" strokeWidth="1.1" />
    </svg>
  );
}

const chapterLabel = (n: string, t: string) => (
  <p className="flex items-center gap-4 mb-6">
    <span className="font-display italic text-gold text-lg">{n}</span>
    <span className="w-10 h-px bg-gold/60" />
    <span className="label text-gold">{t}</span>
  </p>
);

/* ---------------------------------------------------------------- */
export function Arrival() {
  return (
    <section id="arrival" className="relative py-28 md:py-40 px-5 md:px-10 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            {chapterLabel("01", "The Gate")}
            <h2 className="font-display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[1.02] display-shadow mb-8">
              <RevealLine>Through the</RevealLine>
              <br />
              <RevealLine delay={120}>
                <em className="italic text-flare">split gate</em>
              </RevealLine>
            </h2>
            <Reveal delay={200}>
              <p className="text-ink/85 leading-relaxed mb-5 text-[15px]">
                Every Balinese compound begins with a <em className="text-flare">candi bentar</em> — a single gate split
                down the middle, so that good and bad spirits may enter together and be weighed inside. Ours was carved
                from river stone by the same family of masons who built it, over eleven weeks, in 2016.
              </p>
              <p className="text-dim leading-relaxed text-[15px]">
                Pass beneath it and the noise of the road ends. What follows is two hundred metres of lantern-lit
                stepping stone, frangipani dropping white onto black, and the first long view of the pool held level
                with the ridge.
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={150}>
              <CompoundPlan />
            </Reveal>
          </div>
        </div>

        {/* stats */}
        <div className="mt-20 md:mt-28 pt-10 border-t border-line grid grid-cols-2 lg:grid-cols-4 gap-y-10">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 110} className={i > 0 ? "lg:border-l lg:border-line lg:pl-10" : ""}>
              <p className="font-display text-4xl md:text-5xl text-ink">
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="label text-dim mt-3">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
export function Water() {
  return (
    <section id="water" className="relative py-28 md:py-40 px-5 md:px-10 lg:px-16">
      <div className="max-w-[1400px] mx-auto relative">
        <span
          aria-hidden
          className="absolute -top-16 -right-4 md:right-0 font-display italic text-[clamp(7rem,22vw,20rem)] leading-none text-gold/[0.07] select-none pointer-events-none"
        >
          25m
        </span>
        <div className="grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-6 lg:order-1 order-2">
            {chapterLabel("02", "The Water")}
            <h2 className="font-display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[1.02] display-shadow mb-8">
              <RevealLine>Twenty-five metres</RevealLine>
              <br />
              <RevealLine delay={120}>
                of <em className="italic text-flare">stillness</em>
              </RevealLine>
            </h2>
            <Reveal delay={200}>
              <p className="text-ink/85 leading-relaxed text-[15px] mb-5">
                The pool is cut from black andesite and run a degree warmer than the air, so dusk swims dissolve the
                line between water and sky. Its far edge drops silently into the gorge — an infinity lip aligned, by
                the surveyor's stubbornness, with the ridge where the sun goes down.
              </p>
              <p className="text-dim leading-relaxed text-[15px] mb-9">
                At lantern hour the surface fills with floating lights and slow frangipani, and the whole estate
                smells of rain that hasn't arrived yet.
              </p>
            </Reveal>
            <div className="grid grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ["1.4 m", "depth, edge to edge"],
                ["29 °C", "held all year"],
                ["18:04", "lantern hour begins"],
              ].map(([v, l], i) => (
                <Reveal key={l} delay={i * 120}>
                  <p className="font-display text-2xl md:text-3xl text-flare">{v}</p>
                  <p className="text-[12px] text-dim mt-1.5 leading-snug">{l}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={150} className="lg:col-span-6 lg:order-2 order-1">
            <figure className="img-frame border border-line" data-hot>
              <img src={IMAGES.pool} alt="The black-stone infinity pool at dusk" className="w-full aspect-[16/11] object-cover" loading="lazy" />
            </figure>
            <figcaption className="flex justify-between label text-dim mt-3">
              <span>The infinity edge, 18:12</span>
              <span className="hidden sm:inline">held level with the ridge</span>
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
export function Pavilion() {
  return (
    <section id="pavilion" className="relative py-28 md:py-40 px-5 md:px-10 lg:px-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-14 items-center">
          <Reveal className="lg:col-span-6">
            <figure className="img-frame border border-line relative" data-hot>
              <img src={IMAGES.pavilion} alt="Main pavilion interior at lantern hour" className="w-full aspect-[4/3] object-cover" loading="lazy" />
              <span className="absolute top-4 left-4 label bg-[rgba(8,14,11,0.75)] px-3 py-1.5 text-gold border border-gold/30">
                Lantern hour
              </span>
            </figure>
            <figcaption className="flex justify-between label text-dim mt-3">
              <span>Main pavilion, reclaimed teak</span>
              <span className="hidden sm:inline">thatch replaced yearly</span>
            </figcaption>
          </Reveal>

          <div className="lg:col-span-6">
            {chapterLabel("03", "The Pavilion")}
            <h2 className="font-display text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[1.02] display-shadow mb-8">
              <RevealLine>Teak, thatch,</RevealLine>
              <br />
              <RevealLine delay={120}>
                and <em className="italic text-flare">lantern light</em>
              </RevealLine>
            </h2>
            <Reveal delay={200}>
              <p className="text-ink/85 leading-relaxed text-[15px] mb-5">
                The main pavilion rises under eleven tiers of alang-alang thatch on columns of reclaimed teak, its
                walls nothing more than shadows between the posts. Kingsized daybeds face the pool; above them the
                roof breathes, and the whole room hums at the frequency of the river below.
              </p>
              <p className="text-dim leading-relaxed text-[15px] mb-9">
                Two sleeping pavilions and the open bale complete the compound — everything connected by stone paths,
                everything open to the garden air.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5 border-t border-line pt-7">
                {AMENITIES.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-[14px] text-ink/80">
                    <Diamond />
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
