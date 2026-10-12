import type Phaser from 'phaser';

/** Tela e física em relação ao protótipo de 480×320. A arte entra nítida, sem pixel grosso. */
export const ESCALA = 3;
export const LARGURA = 480 * ESCALA;
export const ALTURA = 320 * ESCALA;
export const ALTURA_VISAO = 270 * ESCALA;
export const TILE = 16 * ESCALA;
export const CHAVE_SAVE = 'arthur-casa-save-v4';

export function u(n: number): number {
  return n * ESCALA;
}

export function fonte(n: number): string {
  return `${Math.round(n * ESCALA)}px`;
}

export const GRAVIDADE = 900 * ESCALA;
export const VELOCIDADE = 145 * ESCALA;
export const VELOCIDADE_AGACHADO = 62 * ESCALA;
export const PULO = -405 * ESCALA;
export const PULO_BOB = -455 * ESCALA;
export const COYOTE = 140;
export const BUFFER_PULO = 160;
/** Um toque no celular sobe este tempo inteiro antes de poder encurtar o arco. */
export const PULO_MINIMO_MS = 210;
export const INVISIVEL_MS = 3000;
export const RECARGA_INVIS_MS = 10000;
export const GRANDE_MS = 15000;
export const VIDAS_INICIAIS = 3;

export function estiloTexto(tamanho: string, cor = '#fff6e8'): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Segoe UI, system-ui, sans-serif',
    fontSize: tamanho,
    color: cor,
    align: 'center',
  };
}

/** Título de abertura, bem maior que o texto da fase. */
export function letreiro(tamanho: string, cor = '#fff6e8'): Phaser.Types.GameObjects.Text.TextStyle {
  const px = Number.parseInt(tamanho, 10) || 48;
  return {
    fontFamily: 'Arial Black, Impact, Segoe UI, sans-serif',
    fontSize: tamanho,
    color: cor,
    align: 'center',
    stroke: '#1a1208',
    strokeThickness: Math.max(6, Math.round(px * 0.07)),
  };
}
