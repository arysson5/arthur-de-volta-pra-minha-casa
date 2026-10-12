import { ALTURA, ALTURA_VISAO, estiloTexto, fonte, LARGURA, letreiro, u } from '../constantes';
import { som } from '../som';
import { enquadrarMenu, esticarLargura, observarTela } from '../tela';

export class DecolagemCena extends Phaser.Scene {
  private aviao!: Phaser.GameObjects.Sprite;
  private luzes: Phaser.GameObjects.Rectangle[] = [];
  private pista = 0;
  private voo = -1;
  private saiu = false;

  constructor() {
    super('decolagem');
  }

  create(): void {
    this.luzes = [];
    this.voo = -1;
    this.saiu = false;
    this.scene.stop('hud');
    this.cameras.main.fadeIn(700, 8, 16, 32);

    const ceu = this.add.rectangle(0, 0, LARGURA, ALTURA, 0x8ec8f5).setOrigin(0);
    const aero = this.add.image(0, ALTURA - ALTURA_VISAO, 'fundo-aero').setOrigin(0);
    const bruma = this.add.rectangle(0, 0, LARGURA, u(150), 0x8ec8f5, 0.35).setOrigin(0);

    this.pista = ALTURA - ALTURA_VISAO + u(156);
    const pista = this.add.rectangle(0, this.pista, LARGURA, u(18), 0x5c6b78).setOrigin(0).setDepth(2);
    const faixaPista = this.add.rectangle(0, this.pista + u(7), LARGURA, u(3), 0xf0c43a).setOrigin(0).setDepth(2);

    for (let i = 0; i < 28; i += 1) {
      const luz = this.add.rectangle(i * u(56), this.pista + u(5), u(18), u(3), 0xfff6d8).setDepth(3);
      this.luzes.push(luz);
    }

    const tarja = this.add.rectangle(0, 0, LARGURA, u(120), 0x0e1520, 0.55).setOrigin(0).setDepth(5);
    const parada = this.add
      .text(LARGURA / 2, u(40), 'PRÓXIMA PARADA', estiloTexto(fonte(13), '#f4efe6'))
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(6);
    const cidade = this.add
      .text(LARGURA / 2, u(84), 'SÃO PAULO', letreiro(fonte(34), '#f0c43a'))
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(1.08)
      .setDepth(6);

    this.tweens.add({ targets: parada, alpha: 1, duration: 800, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: cidade, alpha: 1, scale: 1, duration: 1100, delay: 240, ease: 'Sine.easeOut' });
    this.tweens.add({
      targets: [parada, cidade],
      alpha: 0,
      duration: 900,
      delay: 3600,
      ease: 'Sine.easeIn',
    });

    this.aviao = this.add.sprite(-u(40), this.pista + u(4), 'aviao').setOrigin(0.5, 1).setDepth(4).setScale(1.7);
    som.decolar();
    this.time.delayedCall(500, () => {
      this.voo = 0;
    });

    const barraCima = this.add.rectangle(0, 0, LARGURA, u(12), 0x070b12).setOrigin(0).setDepth(8);
    const barraBaixo = this.add.rectangle(0, ALTURA - u(12), LARGURA, u(12), 0x070b12).setOrigin(0).setDepth(8);
    const ajustar = (): void => {
      const faixa = enquadrarMenu(this);
      esticarLargura(ceu, faixa);
      aero.setPosition(faixa.esquerda, ALTURA - ALTURA_VISAO).setDisplaySize(faixa.largura, ALTURA_VISAO);
      esticarLargura(bruma, faixa, 0, u(150));
      esticarLargura(pista, faixa, this.pista, u(18));
      esticarLargura(faixaPista, faixa, this.pista + u(7), u(3));
      esticarLargura(tarja, faixa, 0, u(120));
      esticarLargura(barraCima, faixa, 0, u(12));
      esticarLargura(barraBaixo, faixa, ALTURA - u(12), u(12));
      if (this.luzes[0] && this.luzes[0].x > faixa.esquerda) {
        this.luzes.forEach((luz, i) => {
          luz.x = faixa.esquerda + i * u(56);
        });
      }
    };
    ajustar();
    observarTela(this, ajustar);
  }

  update(_tempo: number, delta: number): void {
    const quadro = Math.min(delta, 40);
    const passo = (u(70) * quadro) / 1000;
    const ciclo = u(56) * this.luzes.length;
    for (const luz of this.luzes) {
      luz.x -= passo;
      if (luz.x < this.cameras.main.scrollX - u(30)) luz.x += ciclo;
    }

    if (this.voo < 0 || this.saiu) return;
    this.voo += quadro;
    const t = Phaser.Math.Clamp(this.voo / 5400, 0, 1);
    const subida = Phaser.Math.Easing.Cubic.In(t);
    const saida = this.cameras.main.scrollX + this.scale.width + u(80);
    this.aviao.x = Phaser.Math.Linear(this.cameras.main.scrollX - u(40), saida, subida);
    this.aviao.y = Phaser.Math.Linear(this.pista + u(2), u(150), subida);
    this.aviao.setAngle(Phaser.Math.Linear(0, -18, subida));
    this.aviao.setScale(Phaser.Math.Linear(1.7, 1.05, t));
    if (t < 1) return;

    this.saiu = true;
    this.cameras.main.fadeOut(900, 6, 10, 22);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('creditos'));
  }
}
