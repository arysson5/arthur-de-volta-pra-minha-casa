import Phaser from 'phaser';
import { GRAVIDADE } from './jogo/constantes';
import { ligarControles, marcarToque } from './jogo/controles-tela';
import { aplicarMedidas, medidasTela } from './jogo/tela';
import { AberturaCena } from './jogo/cenas/AberturaCena';
import { BootCena } from './jogo/cenas/BootCena';
import { CartaoCena } from './jogo/cenas/CartaoCena';
import { CreditosCena } from './jogo/cenas/CreditosCena';
import { DecolagemCena } from './jogo/cenas/DecolagemCena';
import { ElencoCena } from './jogo/cenas/ElencoCena';
import { FaseCena } from './jogo/cenas/FaseCena';
import { GameOverCena } from './jogo/cenas/GameOverCena';
import { HudCena } from './jogo/cenas/HudCena';
import { MapaCena } from './jogo/cenas/MapaCena';
import { MenuCena } from './jogo/cenas/MenuCena';

const inicial = medidasTela();
ligarControles();

const jogo = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'jogo',
  width: inicial.largura,
  height: inicial.altura,
  backgroundColor: '#0e1520',
  pixelArt: false,
  antialias: true,
  roundPixels: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: inicial.largura,
    height: inicial.altura,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVIDADE },
      debug: false,
    },
  },
  input: {
    activePointers: 5,
  },
  scene: [BootCena, AberturaCena, ElencoCena, MapaCena, MenuCena, FaseCena, HudCena, CartaoCena, GameOverCena, DecolagemCena, CreditosCena],
});

const ajustarTela = (): void => {
  marcarToque();
  aplicarMedidas(jogo);
};
window.addEventListener('resize', ajustarTela);
window.visualViewport?.addEventListener('resize', ajustarTela);

export default jogo;
