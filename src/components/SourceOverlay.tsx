import { useCallback, useEffect, useRef, useState } from "react";
import { onOpenSource } from "../lib/sourceBus";
import type { SourceBundle } from "../lib/downloadSource";

type State = "closed" | "busy" | "ready" | "error";
const FILENAME = "villa-cahaya-source.zip";

export default function SourceOverlay() {
  const [state, setState] = useState<State>("closed");
  const [bundle, setBundle] = useState<SourceBundle | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const attempted = useRef(false);

  const open = useCallback(async () => {
    if (bundle && url) {
      setState("ready"); // already prepared — just show it again
      return;
    }
    setState("busy");
    try {
      const { buildSourceZip, triggerDownload } = await import("../lib/downloadSource");
      const b = await buildSourceZip();
      const u = URL.createObjectURL(b.blob);
      setBundle(b);
      setUrl(u);
      setState("ready");
      // best-effort automatic save; the panel stays open so a manual
      // click can finish the job if the browser blocked it.
      if (!attempted.current) {
        attempted.current = true;
        try {
          triggerDownload(b.blob, FILENAME);
        } catch {
          /* manual link below covers it */
        }
      }
    } catch {
      setState("error");
    }
  }, [bundle, url]);

  useEffect(() => onOpenSource(open), [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState((s) => (s === "busy" ? s : "closed"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (state === "closed") return null;
  const kb = bundle ? Math.max(1, Math.round(bundle.bytes / 1024)) : 0;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-5 bg-[rgba(5,9,7,0.82)] backdrop-blur-sm fade-in"
      onClick={() => state !== "busy" && setState("closed")}
      role="dialog"
      aria-modal="true"
      aria-label="Source bundle"
    >
      <div
        className="pop relative w-full max-w-md border border-gold/30 bg-[#0d1712] shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(226,168,86,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <button
          onClick={() => setState("closed")}
          disabled={state === "busy"}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center text-ink/50 hover:text-flare transition-colors duration-300 disabled:opacity-30"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M1.5 1.5l10 10m0-10l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="p-8 md:p-9">
          {state === "busy" && (
            <div className="py-6 text-center">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="mx-auto mb-5 spin" aria-hidden>
                <circle cx="19" cy="19" r="16" stroke="rgba(239,230,208,0.15)" strokeWidth="2.5" />
                <path d="M19 3a16 16 0 0 1 16 16" stroke="#e2a856" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className="label text-gold mb-2">Gathering the estate</p>
              <p className="text-dim text-sm">Bundling every source file into a zip…</p>
            </div>
          )}

          {state === "error" && (
            <div className="py-4 text-center">
              <p className="label text-gold mb-2">Something snapped a rattan</p>
              <p className="text-dim text-sm mb-6">The bundle could not be built. Give it another try.</p>
              <button
                onClick={() => {
                  setState("busy");
                  open();
                }}
                className="h-11 px-6 bg-gold text-[#141008] text-[12px] font-extrabold tracking-[0.18em] uppercase hover:bg-flare transition-colors duration-300"
              >
                Retry
              </button>
            </div>
          )}

          {state === "ready" && url && (
            <>
              <p className="label text-gold mb-3">Source bundle ready</p>
              <h3 className="font-display text-2xl md:text-[1.7rem] leading-snug mb-2">{FILENAME}</h3>
              <p className="text-dim text-[13px] mb-7">
                {bundle?.fileCount} files · {kb} KB — everything needed to run the villa locally, plus a README and{" "}
                <code className="text-ink/70">.gitignore</code>.
              </p>

              <a
                href={url}
                download={FILENAME}
                className="group flex items-center justify-center gap-3 h-13 py-4 bg-gold text-[#141008] text-[13px] font-extrabold tracking-[0.18em] uppercase hover:bg-flare hover:shadow-[0_0_36px_rgba(226,168,86,0.4)] transition-all duration-300"
              >
                <svg width="15" height="16" viewBox="0 0 15 16" fill="none" aria-hidden>
                  <path d="M7.5 1v9.5M3.5 7l4 4 4-4M1.5 14.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Save the zip
              </a>

              <div className="flex items-center justify-between mt-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-ink/60 hover:text-flare border-b border-line hover:border-gold transition-colors duration-300 pb-0.5"
                >
                  Open in a new tab
                </a>
                <span className="text-[11px] text-dim tabular-nums">{kb} KB</span>
              </div>

              <div className="mt-6 pt-5 border-t border-line">
                <p className="text-[12px] text-dim leading-relaxed">
                  <span className="text-gold font-bold">Nothing happened?</span> Your browser preview can block
                  automatic downloads. Click <span className="text-ink/80">Save the zip</span> above — or open this
                  site in its own browser tab and press Source again.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
