export const virtual = {
  esquerda: false,
  direita: false,
  baixo: false,
  pulo: false,
  puloBorda: false,
  invis: false,
  invisBorda: false,
};

export function zerarVirtual(): void {
  virtual.esquerda = false;
  virtual.direita = false;
  virtual.baixo = false;
  virtual.pulo = false;
  virtual.puloBorda = false;
  virtual.invis = false;
  virtual.invisBorda = false;
}

export class Controles {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private teclas: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    I: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    const teclado = scene.input.keyboard;
    if (!teclado) throw new Error('Teclado indisponível');
    this.cursors = teclado.createCursorKeys();
    this.teclas = teclado.addKeys('W,A,S,D,SPACE,I') as Controles['teclas'];
  }

  eixo(): number {
    const esq = this.cursors.left.isDown || this.teclas.A.isDown || virtual.esquerda;
    const dir = this.cursors.right.isDown || this.teclas.D.isDown || virtual.direita;
    if (esq && !dir) return -1;
    if (dir && !esq) return 1;
    return 0;
  }

  baixo(): boolean {
    return this.cursors.down.isDown || this.teclas.S.isDown || virtual.baixo;
  }

  segurandoPulo(): boolean {
    return this.cursors.up.isDown || this.teclas.W.isDown || this.teclas.SPACE.isDown || virtual.pulo;
  }

  puloAgora(): boolean {
    const teclado =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.teclas.W) ||
      Phaser.Input.Keyboard.JustDown(this.teclas.SPACE);
    const toque = virtual.puloBorda;
    virtual.puloBorda = false;
    return teclado || toque;
  }

  invisAgora(): boolean {
    const teclado = Phaser.Input.Keyboard.JustDown(this.teclas.I);
    const toque = virtual.invisBorda;
    virtual.invisBorda = false;
    return teclado || toque;
  }
}
