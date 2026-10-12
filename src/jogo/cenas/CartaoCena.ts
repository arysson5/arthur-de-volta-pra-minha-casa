import { ALTURA, estiloTexto, fonte, LARGURA, u } from '../constantes';

interface DadosCartao {
  texto?: string;
  proxima?: string;
}

export class CartaoCena extends Phaser.Scene {
  private seguiu = false;

  constructor() {
    super('cartao');
  }

  create(data: DadosCartao): void {
    this.seguiu = false;
    this.add.rectangle(0, 0, LARGURA, ALTURA, 0x101826).setOrigin(0);
    this.add.text(LARGURA / 2, ALTURA / 2 - u(10), data.texto ?? '', estiloTexto(fonte(20), '#fff6e8')).setOrigin(0.5);
    this.add.text(LARGURA / 2, ALTURA / 2 + u(32), 'toque para seguir', estiloTexto(fonte(12), '#f0c43a')).setOrigin(0.5);

    const seguir = (): void => {
      if (this.seguiu) return;
      this.seguiu = true;
      if (data.proxima === 'decolagem') this.scene.start('decolagem');
      else this.scene.start('fase', { id: data.proxima ?? 'fase1' });
    };
    this.input.once('pointerdown', seguir);
    this.input.keyboard?.once('keydown', seguir);
    this.time.delayedCall(2400, seguir);
  }
}
