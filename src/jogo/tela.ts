import Phaser from 'phaser';
import { ALTURA, LARGURA } from './constantes';

export interface Faixa {
  esquerda: number;
  largura: number;
  altura: number;
}

/** Largura do mundo acompanha a tela, para o jogo deitado não sobrar faixa. */
export function medidasTela(): { largura: number; altura: number } {
  const palco = document.getElementById('jogo');
  const vw = palco && palco.clientWidth > 0 ? palco.clientWidth : window.innerWidth;
  const vh = palco && palco.clientHeight > 0 ? palco.clientHeight : window.innerHeight;
  const aspecto = vw / Math.max(vh, 1);
  const altura = ALTURA;
  const largura = Math.max(LARGURA, Math.round(altura * aspecto));
  return { largura, altura };
}

export function aplicarMedidas(jogo: Phaser.Game): void {
  const { largura, altura } = medidasTela();
  if (jogo.scale.width === largura && jogo.scale.height === altura) return;
  jogo.scale.setGameSize(largura, altura);
  jogo.scale.refresh();
}

export function faixaTela(scene: Phaser.Scene): Faixa {
  const largura = scene.scale.width;
  const altura = scene.scale.height;
  return { esquerda: (LARGURA - largura) / 2, largura, altura };
}

/** Centraliza o miolo de 1440px e deixa o fundo ir até a borda da tela. */
export function enquadrarMenu(scene: Phaser.Scene): Faixa {
  const faixa = faixaTela(scene);
  scene.cameras.main.setZoom(1);
  scene.cameras.main.setScroll(faixa.esquerda, 0);
  return faixa;
}

export function esticarLargura(
  objeto: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
  faixa: Faixa,
  y = 0,
  altura?: number,
): void {
  const h = altura ?? faixa.altura;
  objeto.setPosition(faixa.esquerda, y);
  if (objeto instanceof Phaser.GameObjects.Image) objeto.setDisplaySize(faixa.largura, h);
  else objeto.setSize(faixa.largura, h);
}

export function observarTela(scene: Phaser.Scene, aplicar: () => void): void {
  const rodar = (): void => {
    if (!scene.sys.isActive()) return;
    aplicar();
  };
  scene.scale.on(Phaser.Scale.Events.RESIZE, rodar);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, rodar);
  });
}

/**
 * rem do documento, em pixels do mundo.
 * A altura do jogo preenche a tela, então o rem acompanha o celular.
 */
export function rem(qtd: number): number {
  const base = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const vh = window.visualViewport?.height ?? window.innerHeight;
  return (qtd * base * ALTURA) / Math.max(vh, 1);
}
