import { ALTURA, ESCALA, estiloTexto, fonte, LARGURA, letreiro, u } from '../constantes';
import { limparSave, reiniciarEstado } from '../estado';
import { mensagem, type Verso } from '../mensagem';

export class CreditosCena extends Phaser.Scene {
  private linhas: Phaser.GameObjects.Text[] = [];
  private aviao?: Phaser.GameObjects.Sprite;
  private fim = false;

  constructor() {
    super('creditos');
  }

  create(): void {
    this.fim = false;
    this.linhas = [];
    this.cameras.main.fadeIn(900, 6, 10, 22);

    this.add.image(0, 0, 'fundo-noite').setOrigin(0).setDisplaySize(LARGURA, ALTURA);
    this.add.rectangle(0, 0, LARGURA, ALTURA, 0x050814, 0.28).setOrigin(0);

    for (let i = 0; i < 26; i += 1) {
      const estrela = this.add
        .circle(
          Phaser.Math.Between(u(12), LARGURA - u(12)),
          Phaser.Math.Between(u(28), ALTURA * 0.46),
          i % 5 === 0 ? u(1.8) : u(1),
          0xfff6e8,
          0.35,
        )
        .setDepth(1);
      this.tweens.add({
        targets: estrela,
        alpha: 0.9,
        duration: Phaser.Math.Between(1100, 2400),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1400),
        ease: 'Sine.easeInOut',
      });
    }

    this.aviao = this.add.sprite(-u(60), u(54), 'aviao').setScale(0.62).setAlpha(0.8).setDepth(2);
    this.tweens.add({
      targets: this.aviao,
      x: LARGURA + u(80),
      duration: 32000,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const versos: Verso[] = [{ texto: 'Arthur de volta pra minha casa', destaque: true }, { texto: '' }, ...mensagem];
    let y = ALTURA * 0.72;
    versos.forEach((verso, indice) => {
      if (verso.texto) {
        const abertura = indice === 0;
        const linha = this.add
          .text(LARGURA / 2, y, verso.texto, estiloDoVerso(verso, abertura))
          .setOrigin(0.5)
          .setAlpha(0)
          .setDepth(3);
        this.linhas.push(linha);
        y += abertura ? u(64) : verso.destaque ? u(52) : u(40);
      } else {
        y += u(20);
      }
    });

    this.add.rectangle(0, 0, LARGURA, u(12), 0x070b12).setOrigin(0).setDepth(6);
    this.add.rectangle(0, ALTURA - u(12), LARGURA, u(12), 0x070b12).setOrigin(0).setDepth(6);
  }

  update(tempo: number, delta: number): void {
    if (this.aviao) this.aviao.y = u(54) + Math.sin(tempo / 900) * u(5);
    if (this.fim || this.linhas.length === 0) return;

    const passo = (18 * ESCALA * Math.min(delta, 40)) / 1000;
    const centro = ALTURA * 0.46;
    for (const linha of this.linhas) {
      linha.y -= passo;
      const dist = Math.abs(linha.y - centro) / (ALTURA * 0.32);
      const visivel = Phaser.Math.Clamp(1 - dist * dist, 0, 1);
      linha.setAlpha(visivel);
      linha.setScale(Phaser.Math.Linear(0.98, 1, visivel));
    }

    const ultima = this.linhas[this.linhas.length - 1];
    if (ultima.y < -u(40)) this.mostrarBotao();
  }

  private mostrarBotao(): void {
    if (this.fim) return;
    this.fim = true;

    const risco = this.add
      .rectangle(LARGURA / 2, ALTURA / 2 - u(40), u(90), u(2), 0xf0c43a)
      .setDepth(7)
      .setScale(0.2, 1);
    const caixa = this.add
      .rectangle(LARGURA / 2, ALTURA / 2, u(250), u(46), 0xf0c43a)
      .setInteractive({ useHandCursor: true })
      .setDepth(7)
      .setAlpha(0);
    const rotulo = this.add
      .text(LARGURA / 2, ALTURA / 2, 'Jogar de novo', estiloTexto(fonte(16), '#1a120c'))
      .setOrigin(0.5)
      .setDepth(8)
      .setAlpha(0);

    this.tweens.add({ targets: risco, scaleX: 1, duration: 700, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: [caixa, rotulo], alpha: 1, duration: 900, delay: 180, ease: 'Sine.easeOut' });

    caixa.on('pointerdown', () => {
      limparSave();
      reiniciarEstado();
      this.scene.start('mapa');
    });
  }
}

function estiloDoVerso(verso: Verso, abertura: boolean): Phaser.Types.GameObjects.Text.TextStyle {
  if (verso.destaque) return letreiro(fonte(abertura ? 22 : 16), '#ffe08a');
  return {
    fontFamily: 'Georgia, Palatino Linotype, Times New Roman, serif',
    fontSize: fonte(15),
    color: '#f7f1ea',
    align: 'center',
  };
}
