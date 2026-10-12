import { estiloTexto, fonte, u } from '../constantes';
import { cargaInvis, eToque, mostrarControles } from '../controles-tela';
import { estado } from '../estado';
import { observarTela } from '../tela';

export class HudCena extends Phaser.Scene {
  private titulo?: Phaser.GameObjects.Text;
  private moedas?: Phaser.GameObjects.Text;
  private frase?: Phaser.GameObjects.Text;
  private coracoes: Phaser.GameObjects.Image[] = [];

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
    this.posicionar();
    observarTela(this, () => this.posicionar());
    this.events.once('shutdown', () => mostrarControles(false));
  }

  private posicionar(): void {
    this.frase?.setX(this.scale.width / 2);
    mostrarControles(eToque());
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
    if (estado.montado && mostrar === false && this.frase) {
      this.frase.setText('Montado no Bob');
    }
  }
}
