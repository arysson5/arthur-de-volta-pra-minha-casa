import { ALTURA, estiloTexto, fonte, LARGURA, u } from '../constantes';
import { virtual as toque } from '../controles';
import { estado } from '../estado';

export class HudCena extends Phaser.Scene {
  private titulo?: Phaser.GameObjects.Text;
  private moedas?: Phaser.GameObjects.Text;
  private frase?: Phaser.GameObjects.Text;
  private coracoes: Phaser.GameObjects.Image[] = [];
  private barraInvis?: Phaser.GameObjects.Rectangle;

  constructor() {
    super('hud');
  }

  create(): void {
    this.cameras.main.transparent = true;
    if (this.input.keyboard) this.input.keyboard.enabled = false;
    this.coracoes = [];
    for (let i = 0; i < 3; i += 1) {
      this.coracoes.push(this.add.image(u(22) + i * u(18), u(16), 'coracao').setScrollFactor(0).setDepth(20));
    }
    this.titulo = this.add.text(u(78), u(6), '', estiloTexto(fonte(11), '#fff6e8')).setScrollFactor(0).setDepth(20);
    this.moedas = this.add.text(u(8), u(28), '', estiloTexto(fonte(11), '#f0c43a')).setScrollFactor(0).setDepth(20);
    this.frase = this.add
      .text(LARGURA / 2, u(50), '', estiloTexto(fonte(12), '#fff6e8'))
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20);
    this.frase.setWordWrapWidth(u(340));
    this.titulo.setShadow(0, u(1), '#1a2744', u(4), false, true);
    this.moedas.setShadow(0, u(1), '#1a2744', u(4), false, true);
    this.frase.setShadow(0, u(1), '#1a2744', u(4), false, true);

    this.add.rectangle(LARGURA / 2, ALTURA - u(25), LARGURA, u(50), 0x0e1520).setDepth(15);

    this.direcao(u(36), ALTURA - u(26), '◄', () => {
      toque.esquerda = true;
    }, () => {
      toque.esquerda = false;
    });
    this.direcao(u(84), ALTURA - u(26), '►', () => {
      toque.direita = true;
    }, () => {
      toque.direita = false;
    });
    this.direcao(u(132), ALTURA - u(26), '▼', () => {
      toque.baixo = true;
    }, () => {
      toque.baixo = false;
    });

    this.direcao(u(378), ALTURA - u(26), 'SUMIR', () => {
      toque.invis = true;
      toque.invisBorda = true;
    }, () => {
      toque.invis = false;
    }, u(64));
    this.barraInvis = this.add.rectangle(u(378), ALTURA - u(8), u(64), u(4), 0xf0c43a).setDepth(22);

    this.direcao(u(452), ALTURA - u(26), 'PULO', () => {
      toque.pulo = true;
      toque.puloBorda = true;
    }, () => {
      toque.pulo = false;
    }, u(48));
  }

  private direcao(x: number, y: number, rotulo: string, desce: () => void, sobe: () => void, largura = u(40)): void {
    const caixa = this.add
      .rectangle(x, y, largura, u(36), 0x243044, 0.85)
      .setInteractive()
      .setDepth(21);
    this.add.text(x, y, rotulo, estiloTexto(fonte(rotulo.length > 2 ? 11 : 16), '#fff6e8')).setOrigin(0.5).setDepth(22);
    caixa.on('pointerdown', desce);
    caixa.on('pointerup', sobe);
    caixa.on('pointerupoutside', sobe);
  }

  update(): void {
    this.titulo?.setText(estado.titulo);
    this.moedas?.setText(estado.moedasMeta > 0 ? `Moedas ${estado.moedas}/${estado.moedasMeta}` : '');
    const mostrar = this.time.now < estado.fraseAte;
    this.frase?.setText(mostrar ? estado.frase : '');
    this.coracoes.forEach((coracao, i) => {
      coracao.setAlpha(i < estado.vidas ? 1 : 0.25);
    });
    if (this.barraInvis) this.barraInvis.setScale(Math.max(0.05, estado.invis), 1);
    if (estado.montado && mostrar === false && this.frase) {
      this.frase.setText('Montado no Bob');
    }
  }
}
