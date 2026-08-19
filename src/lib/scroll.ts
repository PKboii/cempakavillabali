import Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(l: Lenis) {
  lenis = l;
}

export function scrollToTarget(target: string | number, opts?: { offset?: number; duration?: number }) {
  if (!lenis) {
    if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
    else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (typeof target === "number") {
    lenis.scrollTo(target, { duration: opts?.duration ?? 1.6 });
  } else {
    const el = document.querySelector(target);
    if (el) lenis.scrollTo(el as HTMLElement, { offset: opts?.offset ?? -64, duration: opts?.duration ?? 1.6 });
  }
}

export function getLenis() {
  return lenis;
}
