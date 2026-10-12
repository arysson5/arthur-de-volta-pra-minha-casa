import { ALTURA, estiloTexto, fonte, LARGURA, letreiro, TILE, u } from '../constantes';
import { encaixar } from '../personagens';
import { enquadrarMenu, esticarLargura, observarTela, rem } from '../tela';

export class AberturaCena extends Phaser.Scene {
  private seguiu = false;
  private podePular = false;

  constructor() {
    super('abertura');
  }

  create(): void {
    this.seguiu = false;
    this.podePular = false;
    this.scene.stop('hud');

    const fundo = this.add.image(0, 0, 'fundo-caatinga').setOrigin(0);
    const vel = this.add.rectangle(0, 0, LARGURA, ALTURA, 0x0b1018, 0.62).setOrigin(0);
    const chaoY = ALTURA * 0.86;
    const chao = this.add.rectangle(0, chaoY, LARGURA, ALTURA - chaoY, 0xc4a574).setOrigin(0).setDepth(2);
    const chaoLinha = this.add.rectangle(0, chaoY, LARGURA, u(4), 0x8d6a3e).setOrigin(0).setDepth(2);
    const ajustar = (): void => {
      const faixa = enquadrarMenu(this);
      esticarLargura(fundo, faixa);
      esticarLargura(vel, faixa);
      esticarLargura(chao, faixa, chaoY, ALTURA - chaoY);
      esticarLargura(chaoLinha, faixa, chaoY, u(4));
    };
    ajustar();
    observarTela(this, ajustar);

    const arthur = this.add.sprite(-u(120), chaoY, 'arthur-parado-0').setOrigin(0.5, 1).setDepth(3);
    encaixar(arthur, TILE * 3.6);
    arthur.play('arthur-parado');
    const bob = this.add.sprite(-u(220), chaoY, 'bob').setOrigin(0.5, 1).setDepth(3);
    encaixar(bob, TILE * 2.4);
    const mae = this.add.sprite(LARGURA + u(140), chaoY, 'mae').setOrigin(0.5, 1).setDepth(3);
    encaixar(mae, TILE * 3.5);

    const arthurTitulo = this.add
      .text(LARGURA / 2, u(58), 'ARTHUR', letreiro(fonte(56), '#fff6e8'))
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(1.35)
      .setDepth(5);
    const meio = this.add
      .text(LARGURA / 2, u(122), 'DE VOLTA PRA', estiloTexto(fonte(16), '#f4efe6'))
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(5);
    const terra = this.add
      .text(LARGURA / 2, u(162), 'MINHA TERRA', letreiro(fonte(32), '#f0c43a'))
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(1.2)
      .setDepth(5);

    this.tweens.add({ targets: arthurTitulo, alpha: 1, scale: 1, duration: 780, ease: 'Back.out' });
    this.tweens.add({ targets: meio, alpha: 1, duration: 480, delay: 620 });
    this.tweens.add({ targets: terra, alpha: 1, scale: 1, duration: 700, delay: 980, ease: 'Back.out' });

    this.tweens.add({ targets: arthur, x: LARGURA * 0.36, duration: 980, delay: 1600, ease: 'Sine.out' });
    this.tweens.add({ targets: bob, x: LARGURA * 0.18, duration: 980, delay: 1900, ease: 'Sine.out' });
    this.tweens.add({ targets: mae, x: LARGURA * 0.74, duration: 980, delay: 2150, ease: 'Sine.out' });

    const dicaY = chaoY + (ALTURA - chaoY) / 2;
    const dicaFundo = this.add
      .rectangle(LARGURA / 2, dicaY, Math.max(u(300), rem(16)), Math.max(u(48), rem(3.2)), 0xf0c43a)
      .setAlpha(0)
      .setDepth(5);
    const dica = this.add
      .text(LARGURA / 2, dicaY, 'Conhecer o pessoal', estiloTexto(fonte(13), '#1a120c'))
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(6);
    this.time.delayedCall(3400, () => {
      this.podePular = true;
      dicaFundo.setInteractive({ useHandCursor: true });
      dicaFundo.on('pointerdown', () => this.ir());
      this.tweens.add({ targets: [dica, dicaFundo], alpha: 1, duration: 400 });
    });

    const tentar = (): void => {
      if (!this.podePular) return;
      this.ir();
    };
    this.input.keyboard?.on('keydown-ENTER', tentar);
    this.input.keyboard?.on('keydown-SPACE', tentar);
  }

  private ir(): void {
    if (this.seguiu) return;
    this.seguiu = true;
    this.scene.start('elenco');
  }
}
