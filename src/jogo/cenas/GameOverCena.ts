import { ALTURA, estiloTexto, fonte, LARGURA, letreiro, u } from '../constantes';
import { enquadrarMenu, esticarLargura, observarTela, rem } from '../tela';
import { reiniciarEstado } from '../estado';
import { fases } from '../fases';

interface DadosGameOver {
  fase?: string;
}

export class GameOverCena extends Phaser.Scene {
  private fase = 'fase1';

  constructor() {
    super('gameover');
  }

  create(data: DadosGameOver): void {
    this.fase = data?.fase && fases[data.fase] ? data.fase : 'fase1';
    const def = fases[this.fase];
    this.scene.stop('hud');
    const fundo = this.add.rectangle(0, 0, LARGURA, ALTURA, 0x14080c).setOrigin(0);
    const ajustar = (): void => esticarLargura(fundo, enquadrarMenu(this));
    ajustar();
    observarTela(this, ajustar);
    this.add.text(LARGURA / 2, u(100), 'AS VIDAS ACABARAM', letreiro(fonte(28), '#fff6e8')).setOrigin(0.5);
    this.add
      .text(LARGURA / 2, u(168), 'Essa fase volta para o começo.', estiloTexto(fonte(16), '#f0c43a'))
      .setOrigin(0.5);
    this.add.text(LARGURA / 2, u(200), def.titulo, estiloTexto(fonte(14), '#d7e2ea')).setOrigin(0.5);
    const caixa = this.add
      .rectangle(LARGURA / 2, u(250), Math.max(u(300), rem(16)), Math.max(u(56), rem(3.6)), 0xf0c43a)
      .setInteractive({ useHandCursor: true });
    this.add.text(LARGURA / 2, u(250), 'Recomeçar a fase', estiloTexto(fonte(16), '#1a120c')).setOrigin(0.5);
    const seguir = (): void => {
      reiniciarEstado();
      this.scene.start('fase', { id: this.fase });
    };
    caixa.on('pointerdown', seguir);
    this.input.keyboard?.on('keydown-ENTER', seguir);
    this.input.keyboard?.on('keydown-SPACE', seguir);
  }
}
