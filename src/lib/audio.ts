/**
 * Generative gamelan-tinged ambience: soft metallic plucks in a slendro-ish
 * pentatonic set, plus a slow breathing drone. Pure WebAudio, no assets.
 */
export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private droneNodes: OscillatorNode[] = [];
  playing = false;

  private ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp);
    comp.connect(this.ctx.destination);
  }

  private pluck(freq: number, when: number, gainPeak = 0.16, decay = 2.6) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const osc2 = this.ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = freq * 2.003; // slightly detuned overtone, gong-like
    const g = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gainPeak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(gainPeak * 0.18, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.4);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    osc.connect(g); g.connect(lp);
    osc2.connect(g2); g2.connect(lp);
    lp.connect(this.master);
    osc.start(t); osc2.start(t);
    osc.stop(t + decay + 0.2); osc2.stop(t + decay + 0.2);
  }

  private scheduleLoop() {
    // slendro-ish ratios over A3
    const base = 220;
    const scale = [1, 1.135, 1.352, 1.568, 1.872, 2, 2.27, 2.704];
    const tick = () => {
      if (!this.playing) return;
      const n = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const f = base * scale[Math.floor(Math.random() * scale.length)] * (Math.random() < 0.25 ? 0.5 : 1);
        this.pluck(f, i * 0.14, 0.1 + Math.random() * 0.09, 2.2 + Math.random() * 2.2);
      }
      this.timer = window.setTimeout(tick, 900 + Math.random() * 2200);
    };
    tick();
  }

  private startDrone() {
    if (!this.ctx || !this.master) return;
    const mk = (freq: number, detune: number) => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = this.ctx!.createGain();
      g.gain.value = 0.028;
      const lp = this.ctx!.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 420;
      osc.connect(g); g.connect(lp); lp.connect(this.master!);
      osc.start();
      this.droneNodes.push(osc);
    };
    mk(110, 0);
    mk(164.8, 6);
    mk(220, -5);
  }

  async toggle(): Promise<boolean> {
    this.ensure();
    const ctx = this.ctx!;
    if (ctx.state === "suspended") await ctx.resume();
    if (this.playing) {
      this.playing = false;
      if (this.timer) window.clearTimeout(this.timer);
      this.master!.gain.cancelScheduledValues(ctx.currentTime);
      this.master!.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(() => {
        if (!this.playing) {
          this.droneNodes.forEach((o) => { try { o.stop(); } catch { /* noop */ } });
          this.droneNodes = [];
        }
      }, 1000);
    } else {
      this.playing = true;
      if (this.droneNodes.length === 0) this.startDrone();
      this.master!.gain.cancelScheduledValues(ctx.currentTime);
      this.master!.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.2);
      this.scheduleLoop();
    }
    return this.playing;
  }
}

export const ambience = new AmbientAudio();
