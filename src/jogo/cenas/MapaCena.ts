import { ALTURA, estiloTexto, fonte, LARGURA, letreiro, TILE, u } from '../constantes';
import { enquadrarMenu, esticarLargura, observarTela, rem } from '../tela';
import { estado, lerSave, limparSave, reiniciarEstado } from '../estado';
import { fases } from '../fases';
import { encaixar } from '../personagens';

const ORDEM = ['fase1', 'fase2', 'fase3', 'fase4'] as const;
const LUGARES = ['Maranhão', 'Maranhão', 'A casa', 'São Paulo'];

export class MapaCena extends Phaser.Scene {
  constructor() {
    super('mapa');
  }

  create(): void {
    this.scene.stop('hud');
    const fundo = this.add.image(0, 0, 'fundo-caatinga').setOrigin(0);
    const azul = this.add.rectangle(LARGURA / 2, 0, LARGURA / 2, ALTURA, 0x16324a).setOrigin(0);
    const faixaTopo = this.add.rectangle(0, 0, LARGURA, u(52), 0x0e1520, 0.72).setOrigin(0);
    const ajustar = (): void => {
      const faixa = enquadrarMenu(this);
      esticarLargura(fundo, faixa);
      esticarLargura(faixaTopo, faixa, 0, u(52));
      azul.setPosition(LARGURA / 2, 0).setSize(faixa.largura / 2, faixa.altura);
    };
    ajustar();
    observarTela(this, ajustar);

    this.add.text(u(28), u(36), 'MARANHÃO', letreiro(fonte(18), '#f0c43a')).setOrigin(0, 0.5).setDepth(4);
    this.add.text(LARGURA / 2, u(36), 'O CAMINHO', letreiro(fonte(16), '#fff6e8')).setOrigin(0.5).setDepth(4);
    this.add.text(LARGURA - u(28), u(36), 'SÃO PAULO', letreiro(fonte(18), '#9fd4ff')).setOrigin(1, 0.5).setDepth(4);

    const pontos = ORDEM.map((_, i) => this.ponto(i / (ORDEM.length - 1)));
    const traco = this.add.graphics().setDepth(2);
    traco.lineStyle(u(5), 0xf0c43a, 1);
    traco.beginPath();
    traco.moveTo(pontos[0].x, pontos[0].y);
    for (let i = 1; i < pontos.length; i += 1) traco.lineTo(pontos[i].x, pontos[i].y);
    traco.strokePath();

    ORDEM.forEach((id, i) => {
      const p = pontos[i];
      const nome = fases[id].titulo.replace(/^Fase \d+ · /, '');
      const placaY = p.y - u(64);
      this.add.rectangle(p.x, placaY, u(84), u(52), 0x101826, 0.9).setDepth(3);
      this.add
        .text(p.x, placaY - u(16), nome, {
          ...estiloTexto(fonte(11), '#fff6e8'),
          wordWrap: { width: u(76) },
        })
        .setOrigin(0.5, 0.5)
        .setDepth(4);
      this.add.text(p.x, placaY + u(16), LUGARES[i], estiloTexto(fonte(10), '#f0c43a')).setOrigin(0.5).setDepth(4);
      this.add.circle(p.x, p.y, u(16), 0xf0c43a).setDepth(3);
      this.add.circle(p.x, p.y, u(10), 0x1a120c).setDepth(3);
      this.add.text(p.x, p.y, String(i + 1), estiloTexto(fonte(11), '#fff6e8')).setOrigin(0.5).setDepth(4);
    });

    const pe = pontos[0].y + u(78);
    const arthur = this.add.sprite(pontos[0].x - u(8), pe, 'arthur-parado-0').setOrigin(0.5, 1).setDepth(5);
    encaixar(arthur, TILE * 2.2);
    arthur.play('arthur-parado');
    const bob = this.add.sprite(pontos[0].x - u(58), pe, 'bob').setOrigin(0.5, 1).setDepth(5);
    encaixar(bob, TILE * 1.5);
    const mae = this.add.sprite(pontos[2].x + u(52), pontos[2].y + u(78), 'mae').setOrigin(0.5, 1).setDepth(5);
    encaixar(mae, TILE * 2.1);

    const aviao = this.add.sprite(pontos[1].x, pontos[0].y + u(22), 'aviao').setDepth(4);
    aviao.setScale(0.42);
    this.tweens.add({
      targets: aviao,
      x: pontos[3].x,
      duration: 4200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    const yPessoal = ALTURA - u(84);
    this.add.rectangle(LARGURA / 2, yPessoal, u(170), u(26), 0x101826, 0.85).setDepth(6);
    const elenco = this.add
      .text(LARGURA / 2, yPessoal, 'Personagens', estiloTexto(fonte(12), '#f0c43a'))
      .setOrigin(0.5)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });
    elenco.on('pointerdown', () => this.scene.start('elenco'));

    this.botao(LARGURA / 2 - u(110), ALTURA - u(40), 'Jogar', 0xf0c43a, '#1a120c', () => {
      limparSave();
      reiniciarEstado();
      this.scene.start('fase', { id: 'fase1' });
    });

    const save = lerSave();
    if (save && save.vidas > 0 && fases[save.fase]) {
      this.botao(LARGURA / 2 + u(110), ALTURA - u(40), 'Continuar', 0x3d6288, '#fff6e8', () => {
        estado.vidas = save.vidas;
        estado.moedas = save.moedas;
        this.scene.start('fase', { id: save.fase, continuar: save.x > 0, x: save.x, y: save.y });
      });
    }
  }

  private ponto(t: number): Phaser.Math.Vector2 {
    const x = Phaser.Math.Linear(u(110), LARGURA - u(110), t);
    const y = ALTURA * 0.5;
    return new Phaser.Math.Vector2(x, y);
  }

  private botao(x: number, y: number, rotulo: string, fundo: number, cor: string, aoClicar: () => void): void {
    const caixa = this.add
      .rectangle(x, y, Math.max(u(210), rem(12)), Math.max(u(52), rem(3.6)), fundo)
      .setInteractive({ useHandCursor: true })
      .setDepth(6);
    this.add.text(x, y, rotulo, estiloTexto(fonte(15), cor)).setOrigin(0.5).setDepth(7);
    caixa.on('pointerdown', aoClicar);
  }
}
