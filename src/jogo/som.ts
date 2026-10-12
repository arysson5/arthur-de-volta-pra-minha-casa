let ctx: AudioContext | null = null;
let musicaLigada = false;
let passo = 0;
let timerMusica = 0;

const notas = [262, 311, 349, 392, 349, 311, 262, 392];

function audio(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tom(freq: number, dur: number, tipo: OscillatorType, ganho: number, atraso = 0): void {
  const ac = audio();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, ac.currentTime + atraso);
  g.gain.setValueAtTime(ganho, ac.currentTime + atraso);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + atraso + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + atraso);
  osc.stop(ac.currentTime + atraso + dur);
}

export const som = {
  acordar(): void {
    audio();
  },
  pular(): void {
    tom(460, 0.09, 'square', 0.035);
  },
  moeda(): void {
    tom(880, 0.06, 'square', 0.03);
    tom(1200, 0.09, 'square', 0.03, 0.06);
  },
  dano(): void {
    tom(150, 0.18, 'sawtooth', 0.04);
    tom(90, 0.22, 'square', 0.03, 0.05);
  },
  pisar(): void {
    tom(220, 0.06, 'square', 0.03);
  },
  fase(): void {
    tom(523, 0.1, 'square', 0.035);
    tom(659, 0.1, 'square', 0.035, 0.1);
    tom(784, 0.18, 'square', 0.035, 0.2);
  },
  poder(): void {
    tom(660, 0.08, 'square', 0.03);
    tom(880, 0.12, 'square', 0.03, 0.08);
  },
  ponto(): void {
    tom(494, 0.1, 'triangle', 0.04);
    tom(740, 0.14, 'triangle', 0.035, 0.08);
  },
  decolar(): void {
    tom(180, 0.4, 'sawtooth', 0.02);
    tom(240, 0.5, 'sawtooth', 0.02, 0.2);
    tom(320, 0.6, 'triangle', 0.025, 0.45);
  },
};

export function iniciarMusica(): void {
  if (musicaLigada) return;
  musicaLigada = true;
  const tick = (): void => {
    if (!musicaLigada) return;
    tom(notas[passo % notas.length], 0.16, 'triangle', 0.012);
    passo += 1;
    timerMusica = window.setTimeout(tick, 460);
  };
  tick();
}

export function pararMusica(): void {
  musicaLigada = false;
  window.clearTimeout(timerMusica);
}
