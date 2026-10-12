import { ALTURA, estiloTexto, fonte, LARGURA, letreiro, TILE, u } from '../constantes';
import { enquadrarMenu, esticarLargura, observarTela, rem } from '../tela';
import { encaixar } from '../personagens';

interface Atributo {
  nome: string;
  valor: number;
}

interface Pessoa {
  nome: string;
  textura: string;
  anim?: string;
  altura: number;
  cor: number;
  atributos: Atributo[];
  descricao: string;
}

const ELENCO: Pessoa[] = [
  {
    nome: 'ARTHUR',
    textura: 'arthur-parado-0',
    anim: 'arthur-parado',
    altura: TILE * 4.2,
    cor: 0xf0c43a,
    atributos: [
      { nome: 'Preguiça', valor: 4 },
      { nome: 'Fome', valor: 5 },
      { nome: 'Vontade de ir embora', valor: 5 },
    ],
    descricao: 'Vai fazer de tudo pra sair do Maranhão.',
  },
  {
    nome: 'BOB',
    textura: 'bob',
    altura: TILE * 3.1,
    cor: 0xe07a3d,
    atributos: [
      { nome: 'Força', valor: 4 },
      { nome: 'Velocidade', valor: 5 },
      { nome: 'Fome', valor: 5 },
    ],
    descricao: 'Morde as visitas e é doido.',
  },
  {
    nome: 'MÃE',
    textura: 'mae',
    altura: TILE * 4.1,
    cor: 0xc4483a,
    atributos: [
      { nome: 'Raiva', valor: 5 },
      { nome: 'Arremessa chinelo', valor: 5 },
      { nome: 'Fofoca', valor: 4 },
    ],
    descricao: 'Ama o Maranhão e no dia que ela pegar o Arthur ele vai ver.',
  },
];

export class ElencoCena extends Phaser.Scene {
  private indice = 0;
  private cartao?: Phaser.GameObjects.Container;
  private pontos: Phaser.GameObjects.Arc[] = [];
  private trocando = false;
  private ignorarToque = false;

  constructor() {
    super('elenco');
  }

  create(): void {
    this.indice = 0;
    this.trocando = false;
    this.cartao = undefined;
    this.pontos = [];
    this.scene.stop('hud');

    const fundo = this.add.rectangle(0, 0, LARGURA, ALTURA, 0x101826).setOrigin(0);
    const ajustar = (): void => esticarLargura(fundo, enquadrarMenu(this));
    ajustar();
    observarTela(this, ajustar);
    this.add.text(LARGURA / 2, u(28), 'O PESSOAL', letreiro(fonte(22), '#fff6e8')).setOrigin(0.5);

    this.seta(u(46), -1);
    this.seta(LARGURA - u(46), 1);

    for (let i = 0; i < ELENCO.length; i += 1) {
      const ponto = this.add.circle(LARGURA / 2 + (i - 1) * u(18), ALTURA - u(68), u(5), 0x3d4d63);
      this.pontos.push(ponto);
    }

    const mapa = this.add
      .rectangle(LARGURA / 2, ALTURA - u(32), Math.max(u(260), rem(15)), Math.max(u(52), rem(3.6)), 0xf0c43a)
      .setInteractive({ useHandCursor: true });
    this.add.text(LARGURA / 2, ALTURA - u(32), 'O mapa da viagem', estiloTexto(fonte(14), '#1a120c')).setOrigin(0.5);
    mapa.on('pointerdown', () => {
      this.ignorarToque = true;
      this.scene.start('mapa');
    });

    const irMapa = (): void => {
      this.scene.start('mapa');
    };
    this.input.keyboard?.on('keydown-ENTER', irMapa);
    this.input.keyboard?.on('keydown-SPACE', irMapa);

    this.input.keyboard?.on('keydown-LEFT', () => this.mudar(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.mudar(1));
    this.input.keyboard?.on('keydown-A', () => this.mudar(-1));
    this.input.keyboard?.on('keydown-D', () => this.mudar(1));

    let origem = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      origem = p.x;
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.ignorarToque) {
        this.ignorarToque = false;
        return;
      }
      const dx = p.x - origem;
      if (Math.abs(dx) < u(28)) return;
      this.mudar(dx < 0 ? 1 : -1);
    });

    this.mostrar(0);
  }

  private seta(x: number, direcao: number): void {
    const caixa = this.add
      .rectangle(x, ALTURA / 2, u(52), u(72), 0x243044)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);
    this.add
      .text(x, ALTURA / 2, direcao < 0 ? '‹' : '›', letreiro(fonte(28), '#fff6e8'))
      .setOrigin(0.5)
      .setDepth(5);
    caixa.on('pointerdown', () => {
      this.ignorarToque = true;
      this.mudar(direcao);
    });
  }

  private mudar(direcao: number): void {
    if (this.trocando || direcao === 0) return;
    this.indice = (this.indice + direcao + ELENCO.length) % ELENCO.length;
    this.mostrar(direcao);
  }

  private mostrar(direcao: number): void {
    this.trocando = true;
    const antigo = this.cartao;
    if (antigo) {
      this.tweens.add({
        targets: antigo,
        x: LARGURA / 2 - direcao * u(70),
        alpha: 0,
        duration: 160,
        onComplete: () => antigo.destroy(),
      });
    }

    const pessoa = ELENCO[this.indice];
    const cartao = this.add.container(LARGURA / 2 + direcao * u(50), ALTURA / 2 - u(16));
    cartao.setAlpha(direcao === 0 ? 1 : 0);

    const largura = u(340);
    const altura = u(200);
    const fundo = this.add.rectangle(0, 0, largura, altura, 0xf7f1ea);
    const faixa = this.add.rectangle(-largura / 2 + u(16), 0, u(8), altura - u(40), pessoa.cor).setOrigin(0.5);
    cartao.add([fundo, faixa]);

    const sprite = this.add.sprite(-u(118), u(8), pessoa.textura).setOrigin(0.5, 1);
    encaixar(sprite, pessoa.altura);
    if (pessoa.anim) sprite.play(pessoa.anim);
    cartao.add(sprite);

    const nome = this.add
      .text(u(4), -u(78), pessoa.nome, {
        fontFamily: 'Arial Black, Impact, Segoe UI, sans-serif',
        fontSize: fonte(22),
        color: '#1a120c',
      })
      .setOrigin(0, 0.5);
    cartao.add(nome);

    pessoa.atributos.forEach((atributo, i) => {
      const y = -u(46) + i * u(24);
      const rotulo = this.add.text(u(4), y, atributo.nome, estiloTexto(fonte(11), '#3d3126')).setOrigin(0, 0.5);
      cartao.add(rotulo);
      const marcas = this.add.graphics();
      for (let n = 0; n < 5; n += 1) {
        marcas.fillStyle(n < atributo.valor ? pessoa.cor : 0xe4d5c4, 1);
        marcas.fillRoundedRect(u(4) + n * u(22), y + u(10), u(16), u(7), u(2));
      }
      cartao.add(marcas);
    });

    const texto = this.add
      .text(0, u(58), pessoa.descricao, {
        ...estiloTexto(fonte(13), '#1a120c'),
        wordWrap: { width: largura - u(36) },
      })
      .setOrigin(0.5, 0);
    cartao.add(texto);

    this.cartao = cartao;
    this.tweens.add({
      targets: cartao,
      x: LARGURA / 2,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        this.trocando = false;
      },
    });

    this.pontos.forEach((ponto, i) => {
      ponto.setFillStyle(i === this.indice ? 0xf0c43a : 0x3d4d63);
    });
  }
}
