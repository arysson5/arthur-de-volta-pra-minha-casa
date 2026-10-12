import { gerarBichos, gerarBlocos, gerarCenarios, gerarFundos } from './arte-nitida';

const FONTE: Record<string, string[]> = {
  A: ['#.#', '###', '#.#', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['###', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '##.', '#..', '##.', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '#.#', '#.#', '#.#'],
  N: ['#.#', '###', '###', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '.##', '..#'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '.##'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '#.#', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['.#.', '#.#', '#.#', '#.#', '.#.'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.##', '#..', '###'],
  '3': ['##.', '..#', '.##', '..#', '##.'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '##.', '#.#', '.##'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['.#.', '#.#', '.#.', '#.#', '.#.'],
  '9': ['.#.', '#.#', '.##', '..#', '##.'],
  ' ': ['...', '...', '...', '...', '...'],
};

function escrever(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  cor: string,
  escala = 1,
): void {
  ctx.fillStyle = cor;
  let cx = x;
  for (const ch of texto) {
    const glifo = FONTE[ch] ?? FONTE[' '];
    for (let j = 0; j < glifo.length; j += 1) {
      for (let i = 0; i < glifo[j].length; i += 1) {
        if (glifo[j][i] === '#') ctx.fillRect(cx + i * escala, y + j * escala, escala, escala);
      }
    }
    cx += (glifo[0].length + 1) * escala;
  }
}

function tela(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

function registrar(scene: Phaser.Scene, chave: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(chave)) scene.textures.remove(chave);
  scene.textures.addCanvas(chave, canvas);
}

function grade(texto: string): string[] {
  return texto
    .split('\n')
    .filter((linha) => linha.includes('|'))
    .map((linha) => linha.slice(linha.indexOf('|') + 1, linha.lastIndexOf('|')));
}

function pintar(scene: Phaser.Scene, chave: string, linhasOriginais: string[], paleta: Record<string, string>): void {
  const w = Math.max(...linhasOriginais.map((linha) => linha.length));
  const linhas = linhasOriginais.map((linha) => linha.padEnd(w, '.'));
  const h = linhas.length;
  const { canvas, ctx } = tela(w, h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < linhas[y].length; x += 1) {
      const cor = paleta[linhas[y][x]];
      if (!cor) continue;
      ctx.fillStyle = cor;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  registrar(scene, chave, canvas);
}

function ret(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cor: string): void {
  ctx.fillStyle = cor;
  ctx.fillRect(x, y, w, h);
}

const pele = {
  k: '#1a120c',
  K: '#3a2a22',
  s: '#c68642',
  S: '#a56b34',
  e: '#f7f3ea',
  p: '#1a120c',
  m: '#8d3a48',
  d: '#fff8ee',
  j: '#1b1b1b',
  J: '#141414',
  y: '#f0c43a',
  b: '#243044',
  h: '#4a3428',
  '.': '',
};

function corpoArthur(pernas: string[]): string[] {
  const topo = grade(`
|................|
|....kkkkkkk.....|
|...kkKKKKKKk....|
|...kKKsKsSKKk...|
|...kKepKepSKk...|
|...kKKsKsSKKk...|
|...kKKKmmKKKk...|
|...kKKKddKKKk...|
|....kkKKKKkk....|
|......ssss......|
|....ssssssss....|
|...sjjjjjjjjs...|
|..yjJJJJJJJJys..|
|..yjJJJJJJJJys..|
|...jjjjjjjjjj...|
|...jjjjjjjjjj...|
`);
  return [...topo, ...pernas];
}

function gerarArthur(scene: Phaser.Scene): void {
  const parado = [
    '....bb....bb....',
    '....bb....bb....',
    '....bb....bb....',
    '...hhh....hhh...',
    '...hhh....hhh...',
    '................',
    '................',
    '................',
  ];
  const correA = [
    '...bb......bb...',
    '...bb......bb...',
    '..bb........bb..',
    '..hh........hh..',
    '..hh............',
    '................',
    '................',
    '................',
  ];
  const correB = [
    '....bbbbbbbb....',
    '....bb....bb....',
    '....bb....bb....',
    '....hh....hh....',
    '....hh....hh....',
    '................',
    '................',
    '................',
  ];
  const correC = [
    '..bb........bb..',
    '..bb........bb..',
    '...bb......bb...',
    '........hh..hh..',
    '............hh..',
    '................',
    '................',
    '................',
  ];
  const pulo = [
    '...bbbbbbbbb....',
    '...bb......bb...',
    '...bb......bb...',
    '...hh......hh...',
    '...hh......hh...',
    '................',
    '................',
    '................',
  ];
  const agacha = [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '....kkkkkkk.....',
    '...kKepKepKk....',
    '...kKKKmmKKk....',
    '..ssjjjjjjjjss..',
    '.yjJJJJJJJJJJys.',
    '..ybbbbbbbbbb...',
    '...bb......bb...',
    '...hh......hh...',
    '................',
    '................',
  ];

  pintar(scene, 'arthur-parado-0', corpoArthur(parado), pele);
  const piscando = corpoArthur(parado);
  piscando[4] = '...kKKsssSSKKk...';
  pintar(scene, 'arthur-parado-1', piscando, pele);
  pintar(scene, 'arthur-corre-0', corpoArthur(correA), pele);
  pintar(scene, 'arthur-corre-1', corpoArthur(correB), pele);
  pintar(scene, 'arthur-corre-2', corpoArthur(correC), pele);
  pintar(scene, 'arthur-pulo-0', corpoArthur(pulo), pele);
  pintar(scene, 'arthur-agacha-0', agacha, pele);

  scene.anims.create({
    key: 'arthur-parado',
    frames: [{ key: 'arthur-parado-0' }, { key: 'arthur-parado-1' }],
    frameRate: 2,
    repeat: -1,
  });
  scene.anims.create({
    key: 'arthur-corre',
    frames: [{ key: 'arthur-corre-0' }, { key: 'arthur-corre-1' }, { key: 'arthur-corre-2' }, { key: 'arthur-corre-1' }],
    frameRate: 8,
    repeat: -1,
  });
  scene.anims.create({
    key: 'arthur-pulo',
    frames: [{ key: 'arthur-pulo-0' }],
    frameRate: 1,
  });
  scene.anims.create({
    key: 'arthur-agacha',
    frames: [{ key: 'arthur-agacha-0' }],
    frameRate: 1,
  });
}

function gerarMae(scene: Phaser.Scene): void {
  pintar(
    scene,
    'mae',
    grade(`
|....kkkkkkk.....|
|...kkkkkkkkk....|
|...kkkkkkkkk....|
|...kseeeeesk....|
|...ksppppsk.....|
|...kksssskk.....|
|....kkkkkkk.....|
|.....ssss.......|
|...jyjyjyjyj....|
|...jyjyjyjyj....|
|...jyjyjyjyj....|
|...jyjyjyjyj....|
|....jjjjjj......|
|....bbbbbb......|
|....bb..bb......|
|....bb..bb......|
|....bb..bb......|
|...hh....hh.....|
|...hh....hh.....|
|................|
`),
    {
      '.': '',
      k: '#1a120e',
      s: '#a56b45',
      e: '#d7eef8',
      p: '#1a120e',
      j: '#5c3b22',
      y: '#e6b15a',
      b: '#2a2420',
      h: '#3a2a22',
    },
  );
}

function gerarBob(scene: Phaser.Scene): void {
  pintar(
    scene,
    'bob',
    grade(`
|..............kkkk..........|
|...........kkkKKKkkk........|
|..kkkk...kkkKwwKKKKkk.......|
|.kKwwkk.kkKwwwwwKKKkkk......|
|kKwwwwkkkkwwwwwwwwKKkk......|
|kwwwwwwKKKKKKKKKKKKKkk......|
|.kwwwwkKrrrrrrrrrrKkk.......|
|..kkkkkkKryyyryyykKk........|
|...kkkkkkKKKKKKKKkk.........|
|....kkkkkkkkkkkkkk..........|
|.....hh..hh..hh..hh.........|
|............................|
`),
    {
      '.': '',
      k: '#120e0c',
      K: '#2a211c',
      w: '#f4f0ea',
      r: '#c0392b',
      y: '#f0c43a',
      h: '#1a120c',
    },
  );
}


export function gerarArte(scene: Phaser.Scene): void {
  if (!scene.textures.exists('arthur-parado-0')) gerarArthur(scene);
  if (!scene.textures.exists('mae')) gerarMae(scene);
  if (!scene.textures.exists('bob')) gerarBob(scene);
  gerarBlocos(scene);
  gerarBichos(scene);
  gerarCenarios(scene);
  gerarFundos(scene);
}
