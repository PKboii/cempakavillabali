import { useMemo, useState } from "react";

const RATE = 620;
const CLEANING = 150;
const TAX_RATE = 0.1;

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(base: string, days: number) {
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() + days);
  return iso(d);
}

const usd = (n: number) => "$" + n.toLocaleString();

export default function BookingForm() {
  const today = iso(new Date());
  const [checkIn, setCheckIn] = useState(addDays(today, 14));
  const [checkOut, setCheckOut] = useState(addDays(today, 19));
  const [guests, setGuests] = useState(4);
  const [sent, setSent] = useState(false);
  const [refCode, setRefCode] = useState("");

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut + "T12:00:00").getTime() - new Date(checkIn + "T12:00:00").getTime();
    return Math.round(ms / 86400000);
  }, [checkIn, checkOut]);

  const valid = nights >= 2;
  const subtotal = nights * RATE;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + CLEANING;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setRefCode("CDY-" + String(1000 + Math.floor(Math.random() * 9000)));
    setSent(true);
  };

  if (sent) {
    return (
      <div className="pop border border-gold/40 bg-[rgba(226,168,86,0.06)] p-8 md:p-10 text-center">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="mx-auto mb-5" aria-hidden>
          <circle cx="22" cy="22" r="20" stroke="#e2a856" strokeWidth="1.4" />
          <path d="M13.5 22.5l5.5 5.5L30.5 16" stroke="#f6c97c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="label text-gold mb-3">Request received</p>
        <h3 className="font-display text-3xl md:text-4xl mb-3">
          Ref <em className="italic text-flare">{refCode}</em>
        </h3>
        <p className="text-dim text-sm leading-relaxed max-w-sm mx-auto mb-6">
          {nights} nights · {guests} guest{guests > 1 ? "s" : ""} · {checkIn} → {checkOut}. Our house team in Ubud
          replies within four hours to confirm availability and arrange your airport transfer.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-[12px] font-bold tracking-[0.18em] uppercase text-ink/70 border-b border-line pb-1 hover:text-flare hover:border-gold transition-colors duration-300"
        >
          Amend request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-line bg-[rgba(8,14,11,0.72)] backdrop-blur-sm p-7 md:p-9">
      <div className="flex items-baseline justify-between mb-7">
        <h3 className="font-display text-2xl">Reserve the estate</h3>
        <span className="label text-dim">From {usd(RATE)} / night</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <label className="block">
          <span className="label text-dim block mb-2">Arrival</span>
          <input
            type="date"
            className="field"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (nights < 1) setCheckOut(addDays(e.target.value, 5));
            }}
          />
        </label>
        <label className="block">
          <span className="label text-dim block mb-2">Departure</span>
          <input
            type="date"
            className="field"
            value={checkOut}
            min={addDays(checkIn, 1)}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center justify-between mb-7">
        <span className="label text-dim">Guests</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Fewer guests"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="w-9 h-9 border border-line flex items-center justify-center text-ink/70 hover:border-gold hover:text-flare transition-colors duration-300"
          >
            <svg width="12" height="2" viewBox="0 0 12 2" aria-hidden><rect width="12" height="2" fill="currentColor" /></svg>
          </button>
          <span className="font-display text-2xl w-8 text-center tabular-nums">{guests}</span>
          <button
            type="button"
            aria-label="More guests"
            onClick={() => setGuests((g) => Math.min(8, g + 1))}
            className="w-9 h-9 border border-line flex items-center justify-center text-ink/70 hover:border-gold hover:text-flare transition-colors duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <rect width="12" height="2" y="5" fill="currentColor" /><rect width="2" height="12" x="5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <div className="hairline mb-6" />

      <dl className="space-y-2.5 text-sm mb-6">
        <div className="flex justify-between text-ink/80">
          <dt>{usd(RATE)} × {Math.max(nights, 0)} night{nights === 1 ? "" : "s"}</dt>
          <dd className="tabular-nums">{usd(Math.max(subtotal, 0))}</dd>
        </div>
        <div className="flex justify-between text-ink/80">
          <dt>Taxes &amp; service (10%)</dt>
          <dd className="tabular-nums">{usd(valid ? tax : 0)}</dd>
        </div>
        <div className="flex justify-between text-ink/80">
          <dt>Estate preparation</dt>
          <dd className="tabular-nums">{usd(CLEANING)}</dd>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-line">
          <dt className="label text-dim">Total</dt>
          <dd key={valid ? total : 0} className="pop font-display text-3xl text-flare tabular-nums">
            {usd(valid ? total : 0)}
          </dd>
        </div>
      </dl>

      {!valid && (
        <p className="text-[12px] text-gold/90 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-gold rounded-full pulse-dot inline-block" />
          Minimum stay is two nights — the house insists.
        </p>
      )}

      <button
        type="submit"
        disabled={!valid}
        className={`w-full h-13 py-4 text-[13px] font-extrabold tracking-[0.2em] uppercase transition-all duration-400 ${
          valid
            ? "bg-gold text-[#141008] hover:bg-flare hover:shadow-[0_0_36px_rgba(226,168,86,0.4)]"
            : "bg-bark text-dim cursor-not-allowed"
        }`}
      >
        {valid ? "Request these dates" : "Select two nights or more"}
      </button>

      <p className="text-[12px] text-dim mt-4 leading-relaxed">
        Includes full staff of seven, daily breakfast, and return transfer from DPS for stays of four nights or more.
      </p>
    </form>
  );
}
