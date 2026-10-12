import { ALTURA, estiloTexto, fonte, LARGURA, TILE, u } from '../constantes';
import { enquadrarMenu, esticarLargura, observarTela, rem } from '../tela';
import { estado, lerSave, reiniciarEstado } from '../estado';
import { encaixar } from '../personagens';

export class MenuCena extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create(): void {
    this.scene.stop('hud');
    const fundo = this.add.image(0, 0, 'fundo-caatinga').setOrigin(0);
    const faixaTitulo = this.add.rectangle(0, u(188), LARGURA, u(160), 0x0e1520, 0.35).setOrigin(0);
    const ajustar = (): void => {
      const faixa = enquadrarMenu(this);
      esticarLargura(fundo, faixa);
      esticarLargura(faixaTitulo, faixa, u(188), u(160));
    };
    ajustar();
    observarTela(this, ajustar);

    this.add.text(LARGURA / 2, u(36), 'Arthur', estiloTexto(fonte(28), '#fff6e8')).setOrigin(0.5);
    this.add
      .text(LARGURA / 2, u(72), 'de volta pra minha casa', estiloTexto(fonte(16), '#f0c43a'))
      .setOrigin(0.5);

    const chao = u(176);
    const heroi = this.add.sprite(u(168), chao, 'arthur-parado-0').setOrigin(0.5, 1);
    encaixar(heroi, TILE * 3.4);
    heroi.play('arthur-parado');
    const bob = this.add.sprite(u(310), chao, 'bob').setOrigin(0.5, 1);
    encaixar(bob, TILE * 2.1);
    this.add.text(bob.x, bob.y - bob.displayHeight - u(4), 'BOB', estiloTexto(fonte(11), '#f0c43a')).setOrigin(0.5);
    const vaca = this.add.sprite(u(70), chao, 'vaca').setOrigin(0.5, 1);
    const boi = this.add.sprite(u(420), chao, 'boi').setOrigin(0.5, 1);
    encaixar(vaca, TILE * 1.8);
    encaixar(boi, TILE * 1.8);

    this.botao(LARGURA / 2, u(220), 'Jogar', 0xf0c43a, '#1a120c', () => {
      reiniciarEstado();
      this.scene.start('fase', { id: 'fase1' });
    });

    const save = lerSave();
    if (save && estado.vidas > 0) {
      this.botao(LARGURA / 2, u(262), 'Continuar', 0x243044, '#fff6e8', () => {
        estado.vidas = save.vidas;
        estado.moedas = save.moedas;
        this.scene.start('fase', { id: save.fase, continuar: true, x: save.x, y: save.y });
      });
    }

    this.add
      .text(
        LARGURA / 2,
        u(304),
        'Setas, pulo e I. No celular, os botões na tela.',
        estiloTexto(fonte(11), '#d7e2ea'),
      )
      .setOrigin(0.5);
  }

  private botao(x: number, y: number, rotulo: string, fundo: number, cor: string, aoClicar: () => void): void {
    const caixa = this.add
      .rectangle(x, y, Math.max(u(220), rem(13)), Math.max(u(52), rem(3.6)), fundo)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, rotulo, estiloTexto(fonte(16), cor)).setOrigin(0.5);
    caixa.on('pointerdown', aoClicar);
  }
}
