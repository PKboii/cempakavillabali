import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { VillaScene } from "./three/VillaScene";
import { setLenis } from "./lib/scroll";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import ProgressRail from "./components/ProgressRail";
import SourceOverlay from "./components/SourceOverlay";
import Opening from "./sections/Opening";
import { Arrival, Water, Pavilion } from "./sections/Story";
import { Rituals, Moments } from "./sections/RitualsMoments";
import { BookStay, Footer } from "./sections/Closing";

export default function App() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scene = new VillaScene(stage);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(lenis);

    const root = document.documentElement;
    root.style.setProperty("--sy", "0");
    root.style.setProperty("--prog", "0");

    const onScroll = () => {
      const scroll = lenis.scroll;
      const limit = lenis.limit;
      root.style.setProperty("--sy", String(scroll));
      root.style.setProperty("--prog", limit > 0 ? String(scroll / limit) : "0");
      scene.setScrollProgress(limit > 0 ? scroll / limit : 0);
    };
    lenis.on("scroll", onScroll);
    onScroll();

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onLoad = () => lenis.resize();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      lenis.destroy();
      setLenis(null as never);
      scene.dispose();
    };
  }, []);

  return (
    <div className="relative">
      {/* three.js stage — fixed behind everything */}
      <div ref={stageRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden />
      <div className="vignette" aria-hidden />

      <Cursor />
      <Nav />
      <ProgressRail />
      <SourceOverlay />

      <main className="relative z-10">
        <Opening />
        <Arrival />
        <Water />
        <Pavilion />
        <Rituals />
        <Moments />
        <BookStay />
        <Footer />
      </main>

      {/* film grain on top */}
      <div className="noise" aria-hidden />
    </div>
  );
}
