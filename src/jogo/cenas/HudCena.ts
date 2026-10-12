import { estiloTexto, fonte, u } from '../constantes';
import { cargaInvis, eToque, mostrarControles } from '../controles-tela';
import { virtual as toque } from '../controles';
import { estado } from '../estado';
import { observarTela, rem } from '../tela';

export class HudCena extends Phaser.Scene {
  private titulo?: Phaser.GameObjects.Text;
  private moedas?: Phaser.GameObjects.Text;
  private frase?: Phaser.GameObjects.Text;
  private coracoes: Phaser.GameObjects.Image[] = [];
  private barraInvis?: Phaser.GameObjects.Rectangle;
  private controles: Phaser.GameObjects.GameObject[] = [];

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
      .text(this.scale.width / 2, u(50), '', estiloTexto(fonte(12), '#fff6e8'))
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(20);
    this.frase.setWordWrapWidth(u(340));
    this.titulo.setShadow(0, u(1), '#1a2744', u(4), false, true);
    this.moedas.setShadow(0, u(1), '#1a2744', u(4), false, true);
    this.frase.setShadow(0, u(1), '#1a2744', u(4), false, true);
    this.montarControles();
    observarTela(this, () => this.montarControles());
    mostrarControles(eToque());
    this.events.once('shutdown', () => mostrarControles(false));
  }

  private montarControles(): void {
    this.controles.forEach((item) => item.destroy());
    this.controles = [];
    this.barraInvis = undefined;
    this.frase?.setX(this.scale.width / 2);
    if (eToque()) {
      mostrarControles(true);
      return;
    }
    mostrarControles(false);
    const largo = this.scale.width;
    const alto = this.scale.height;
    const alturaBarra = rem(5.8);
    const y = alto - alturaBarra / 2;
    const barra = this.add.rectangle(largo / 2, y, largo, alturaBarra, 0x0e1520).setDepth(15);
    const lado = rem(4.6);
    const pulo = rem(5.4);
    const margem = rem(1.2);
    const passo = lado + rem(0.55);
    this.controles.push(barra);
    this.controles.push(
      ...this.direcao(margem + lado / 2, y, '◄', lado, lado, () => {
        toque.esquerda = true;
      }, () => {
        toque.esquerda = false;
      }),
      ...this.direcao(margem + lado / 2 + passo, y, '▼', lado, lado, () => {
        toque.baixo = true;
      }, () => {
        toque.baixo = false;
      }),
      ...this.direcao(margem + lado / 2 + passo * 2, y, '►', lado, lado, () => {
        toque.direita = true;
      }, () => {
        toque.direita = false;
      }),
    );
    const xSumir = largo - margem - pulo - rem(0.7) - lado / 2;
    this.controles.push(
      ...this.direcao(xSumir, y, 'SUMIR', lado * 1.35, lado, () => {
        toque.invis = true;
        toque.invisBorda = true;
      }, () => {
        toque.invis = false;
      }),
    );
    this.barraInvis = this.add.rectangle(xSumir, y + lado / 2 - rem(0.35), lado * 1.35, rem(0.28), 0xf0c43a).setDepth(22);
    this.controles.push(this.barraInvis);
    this.controles.push(
      ...this.direcao(largo - margem - pulo / 2, y, 'PULO', pulo, pulo, () => {
        toque.pulo = true;
        toque.puloBorda = true;
      }, () => {
        toque.pulo = false;
      }),
    );
  }

  private direcao(
    x: number,
    y: number,
    rotulo: string,
    largura: number,
    altura: number,
    desce: () => void,
    sobe: () => void,
  ): Phaser.GameObjects.GameObject[] {
    const caixa = this.add.rectangle(x, y, largura, altura, 0x243044, 0.85).setInteractive().setDepth(21);
    const texto = this.add
      .text(x, y, rotulo, estiloTexto(fonte(rotulo.length > 2 ? 11 : 16), '#fff6e8'))
      .setOrigin(0.5)
      .setDepth(22);
    caixa.on('pointerdown', desce);
    caixa.on('pointerup', sobe);
    caixa.on('pointerupoutside', sobe);
    return [caixa, texto];
  }

  update(): void {
    this.titulo?.setText(estado.titulo);
    this.moedas?.setText(estado.moedasMeta > 0 ? `Moedas ${estado.moedas}/${estado.moedasMeta}` : '');
    const mostrar = this.time.now < estado.fraseAte;
    this.frase?.setText(mostrar ? estado.frase : '');
    this.coracoes.forEach((coracao, i) => {
      coracao.setAlpha(i < estado.vidas ? 1 : 0.25);
    });
    cargaInvis(estado.invis);
    if (this.barraInvis) this.barraInvis.setScale(Math.max(0.05, estado.invis), 1);
    if (estado.montado && mostrar === false && this.frase) {
      this.frase.setText('Montado no Bob');
    }
  }
}
