import Phaser from 'phaser';
import { ALTURA, GRAVIDADE, LARGURA } from './jogo/constantes';
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

const jogo = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'jogo',
  width: LARGURA,
  height: ALTURA,
  backgroundColor: '#0e1520',
  pixelArt: false,
  antialias: true,
  roundPixels: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: LARGURA,
    height: ALTURA,
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

export default jogo;
