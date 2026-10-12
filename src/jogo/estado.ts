import { CHAVE_SAVE, VIDAS_INICIAIS } from './constantes';

export interface Gravacao {
  fase: string;
  x: number;
  y: number;
  vidas: number;
  moedas: number;
}

export const estado = {
  vidas: VIDAS_INICIAIS,
  moedas: 0,
  moedasMeta: 0,
  titulo: '',
  frase: '',
  fraseAte: 0,
  invis: 1,
  montado: false,
};

export function lerSave(): Gravacao | null {
  try {
    const bruto = localStorage.getItem(CHAVE_SAVE);
    if (!bruto) return null;
    const dado = JSON.parse(bruto) as Gravacao;
    if (!dado.fase || typeof dado.x !== 'number') return null;
    return dado;
  } catch {
    return null;
  }
}

export function salvar(parcial: Gravacao): void {
  localStorage.setItem(CHAVE_SAVE, JSON.stringify(parcial));
}

export function limparSave(): void {
  localStorage.removeItem(CHAVE_SAVE);
}

export function reiniciarEstado(): void {
  estado.vidas = VIDAS_INICIAIS;
  estado.moedas = 0;
  estado.moedasMeta = 0;
  estado.titulo = '';
  estado.frase = '';
  estado.fraseAte = 0;
  estado.invis = 1;
  estado.montado = false;
}
