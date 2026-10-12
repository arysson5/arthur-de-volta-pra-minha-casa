export type Tema = 'caatinga' | 'casa' | 'aeroporto';

export interface FaseDef {
  id: string;
  titulo: string;
  tema: Tema;
  mapa: string[];
  moedasParaSair: number;
  frasePonto: string;
  proxima: string;
  cartao: string;
  fundo: string;
  chao: string;
  objetivo: string;
}

const ALTURA = 17;
const CHAO = 15;
const PES = 14;
/** Quatro a cinco quadrados de vão: o Arthur cabe embaixo e alcança com o pulo. */
const BLOCO = 9;
const PLAT = 12;

function grade(largura: number): string[][] {
  return Array.from({ length: ALTURA }, () => Array.from({ length: largura }, () => ' '));
}

function por(g: string[][], x: number, y: number, c: string): void {
  if (y < 0 || x < 0 || y >= g.length || x >= g[0].length) return;
  g[y][x] = c;
}

function chao(g: string[][], x0: number, x1: number): void {
  for (let x = x0; x <= x1; x += 1) {
    por(g, x, CHAO, '#');
    por(g, x, CHAO + 1, '#');
  }
}

function buraco(g: string[][], x0: number, x1: number): void {
  for (let x = x0; x <= x1; x += 1) {
    por(g, x, CHAO, ' ');
    por(g, x, CHAO + 1, ' ');
  }
}

function plataforma(g: string[][], x: number, y: number, w: number): void {
  for (let i = 0; i < w; i += 1) por(g, x + i, y, '#');
}

function linhas(g: string[][]): string[] {
  return g.map((linha) => linha.join(''));
}

function solido(g: string[][], x: number): boolean {
  return x >= 0 && x < g[0].length && g[CHAO][x] === '#';
}

interface Receita {
  largura: number;
  blocos: string[];
  inimigos: string[];
  chinelos: boolean;
  moedas: boolean;
  corujas: boolean;
  mae: boolean;
  balao: boolean;
}

function construir(op: Receita): string[] {
  const g = grade(op.largura);
  const limite = op.largura - 34;
  chao(g, 0, op.largura - 1);
  por(g, 4, PES, 'S');
  por(g, 16, BLOCO, 'R');
  if (op.balao) por(g, 22, BLOCO, 'U');

  let x = 30;
  let n = 0;
  let inimigo = 0;
  while (x < limite) {
    const passo = n % 6;
    if (passo === 0) {
      buraco(g, x + 4, x + 6);
      x += 12;
    } else if (passo === 1 && op.inimigos.length > 0) {
      por(g, x, PES, op.inimigos[inimigo % op.inimigos.length]);
      inimigo += 1;
      x += 11;
    } else if (passo === 2) {
      const tipo = op.blocos[n % op.blocos.length];
      por(g, x, BLOCO, tipo);
      por(g, x + 2, BLOCO, op.blocos[(n + 1) % op.blocos.length]);
      if (op.moedas) por(g, x + 4, 12, 'o');
      x += 11;
    } else if (passo === 3) {
      plataforma(g, x, PLAT, 3);
      por(g, x + 1, 7, op.blocos[n % op.blocos.length]);
      if (op.inimigos.length > 0 && solido(g, x + 6)) {
        por(g, x + 6, PES, op.inimigos[inimigo % op.inimigos.length]);
        inimigo += 1;
      }
      x += 12;
    } else if (passo === 4 && op.chinelos) {
      por(g, x, PES, n % 2 === 0 ? 'N' : 'H');
      por(g, x + 6, PES, n % 2 === 0 ? 'H' : 'N');
      x += 12;
    } else if (passo === 5 && op.corujas) {
      por(g, x, 11, 'C');
      if (op.inimigos.length > 0) {
        por(g, x + 5, PES, op.inimigos[inimigo % op.inimigos.length]);
        inimigo += 1;
      }
      x += 12;
    } else if (op.moedas && solido(g, x)) {
      por(g, x, 12, 'o');
      x += 10;
    } else if (op.chinelos) {
      por(g, x, PES, 'N');
      x += 10;
    } else {
      x += 10;
    }
    n += 1;
  }

  if (op.moedas) {
    let tem = linhas(g).join('').split('').filter((c) => c === 'X' || c === 'o').length;
    let coluna = 34;
    while (tem < 14 && coluna < limite) {
      if (g[12][coluna] === ' ' && solido(g, coluna)) {
        por(g, coluna, 12, 'o');
        tem += 1;
      }
      coluna += 8;
    }
  }

  let meio = Math.floor(op.largura * 0.48);
  while (meio < limite && !solido(g, meio)) meio += 1;
  if (!solido(g, meio)) {
    meio = Math.floor(op.largura * 0.48);
    while (meio > 20 && !solido(g, meio)) meio -= 1;
  }
  por(g, meio, PES, 'F');

  if (op.mae) por(g, op.largura - 16, PES, 'M');
  por(g, op.largura - 6, PES, 'G');
  return linhas(g);
}

const controles =
  'Setas ou botões: andar, pular e agachar. I ou SUMIR deixa invisível por 3 segundos. O bloco BOB libera o cachorro: desça em cima dele para montar.';

export const fases: Record<string, FaseDef> = {
  fase1: {
    id: 'fase1',
    titulo: 'Fase 1 · Estudar',
    tema: 'caatinga',
    mapa: construir({
      largura: 360,
      blocos: ['L'],
      inimigos: ['E', 'T'],
      chinelos: false,
      moedas: false,
      corujas: true,
      mae: false,
      balao: true,
    }),
    moedasParaSair: 0,
    frasePonto: 'Arthur guardou o caderno. Dá pra continuar daqui.',
    proxima: 'fase2',
    cartao: 'Estudar abre a porta.',
    fundo: 'fundo-caatinga',
    chao: 'chao-caatinga',
    objetivo: `Pule por baixo dos blocos de livro. Desvie ou pise no celular e na TV. A saída é o boletim 10. ${controles}`,
  },
  fase2: {
    id: 'fase2',
    titulo: 'Fase 2 · Juntar dinheiro',
    tema: 'caatinga',
    mapa: construir({
      largura: 400,
      blocos: ['X'],
      inimigos: ['E'],
      chinelos: false,
      moedas: true,
      corujas: false,
      mae: false,
      balao: false,
    }),
    moedasParaSair: 10,
    frasePonto: 'O PIX caiu na conta. O embarque fica mais perto.',
    proxima: 'fase3',
    cartao: 'O PIX junta a passagem.',
    fundo: 'fundo-caatinga',
    chao: 'chao-caatinga',
    objetivo: `Junte 10 moedas. Os blocos PIX soltam moeda. Sem as 10, o arco manda você de volta. ${controles}`,
  },
  fase3: {
    id: 'fase3',
    titulo: 'Fase 3 · Se comportar',
    tema: 'casa',
    mapa: construir({
      largura: 340,
      blocos: ['P', 'W'],
      inimigos: [],
      chinelos: true,
      moedas: false,
      corujas: false,
      mae: true,
      balao: false,
    }),
    moedasParaSair: 0,
    frasePonto: 'A casa está em ordem. Falta o portão.',
    proxima: 'fase4',
    cartao: 'Em casa também tem missão.',
    fundo: 'fundo-casa',
    chao: 'chao-casa',
    objetivo: `Agache no chinelo baixo e pule o chinelo alto. No fim a mãe joga chinelo: desvie e cruze a barra. ${controles}`,
  },
  fase4: {
    id: 'fase4',
    titulo: 'Fase 4 · A viagem',
    tema: 'aeroporto',
    mapa: construir({
      largura: 380,
      blocos: ['A'],
      inimigos: ['E'],
      chinelos: false,
      moedas: false,
      corujas: false,
      mae: true,
      balao: false,
    }),
    moedasParaSair: 0,
    frasePonto: 'Cartão de embarque na mão.',
    proxima: 'decolagem',
    cartao: 'O portão de embarque.',
    fundo: 'fundo-aero',
    chao: 'chao-aero',
    objetivo: `Pegue as passagens, desvie das malas e embarque na barra do portão. ${controles}`,
  },
};

export function contarMoedas(def: FaseDef): number {
  const texto = def.mapa.join('');
  const pix = [...texto].filter((c) => c === 'X').length;
  const soltas = [...texto].filter((c) => c === 'o').length;
  return pix + soltas;
}
