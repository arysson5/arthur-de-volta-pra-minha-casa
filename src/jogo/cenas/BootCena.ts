import { gerarArte } from '../arte';
import { montarPersonagens } from '../personagens';
import { iniciarMusica, som } from '../som';

export class BootCena extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload(): void {
    this.load.image('folha-arthur', 'arte/arthur-folha.jpg');
    this.load.image('folha-mae', 'arte/mae.jpg');
    this.load.image('folha-bob', 'arte/bob.jpg');
  }

  create(): void {
    montarPersonagens(this);
    gerarArte(this);
    this.input.setTopOnly(false);
    const acordar = (): void => {
      som.acordar();
      iniciarMusica();
    };
    this.input.once('pointerdown', acordar);
    this.input.keyboard?.once('keydown', acordar);
    this.scene.start('abertura');
  }
}
