type SoundEvent = 'shoot' | 'pickup' | 'damage' | 'door' | 'level' | 'enemyDown';

export class SoundSystem {
  private ctx: AudioContext | null = null;

  private ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  unlock() {
    this.ensureContext();
  }

  play(event: SoundEvent) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const makeOsc = (type: OscillatorType, freq: number, gainValue: number, duration: number, rampTo = 0.0001) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainValue, now);
      gain.gain.exponentialRampToValueAtTime(rampTo, now + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
      return { osc, gain };
    };

    if (event === 'shoot') {
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      filter.type = 'highpass';
      filter.frequency.value = 600;
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      noise.buffer = noiseBuffer;
      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.08);
      const { osc } = makeOsc('square', 180, 0.06, 0.08);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
      return;
    }

    if (event === 'pickup') {
      const a = makeOsc('triangle', 740, 0.05, 0.12);
      a.osc.frequency.exponentialRampToValueAtTime(1080, now + 0.12);
      return;
    }

    if (event === 'damage') {
      const a = makeOsc('sawtooth', 160, 0.06, 0.18);
      a.osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
      return;
    }

    if (event === 'door') {
      const a = makeOsc('square', 260, 0.04, 0.15);
      a.osc.frequency.linearRampToValueAtTime(320, now + 0.05);
      a.osc.frequency.linearRampToValueAtTime(220, now + 0.15);
      return;
    }

    if (event === 'level') {
      const one = makeOsc('triangle', 420, 0.05, 0.14);
      one.osc.frequency.linearRampToValueAtTime(560, now + 0.14);
      const two = makeOsc('triangle', 630, 0.04, 0.18);
      two.osc.start?.();
      return;
    }

    if (event === 'enemyDown') {
      const a = makeOsc('sawtooth', 240, 0.05, 0.2);
      a.osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);
    }
  }
}
