import { Arthur } from '../arthur';
import { estiloTexto, fonte, GRAVIDADE, TILE, u, VIDAS_INICIAIS } from '../constantes';
import { Controles, zerarVirtual } from '../controles';
import { observarTela, rem } from '../tela';
import { estado, reiniciarEstado, salvar } from '../estado';
import { fases, type FaseDef } from '../fases';
import { encaixar } from '../personagens';
import { som } from '../som';

interface DadosFase {
  id?: string;
  continuar?: boolean;
  x?: number;
  y?: number;
}

interface Bicho {
  sprite: Phaser.Physics.Arcade.Sprite;
  dir: number;
  minX: number;
  maxX: number;
  baseY: number;
  voa: boolean;
  projetil: boolean;
  vivo: boolean;
  velocidade: number;
}

export class FaseCena extends Phaser.Scene {
  private id = 'fase1';
  private continuar = false;
  private spawnX = 0;
  private spawnY = 0;
  private def!: FaseDef;
  private arthur!: Arthur;
  private controles!: Controles;
  private solidos!: Phaser.Physics.Arcade.StaticGroup;
  private blocos!: Phaser.Physics.Arcade.StaticGroup;
  private chaoTiles = new Set<string>();
  private bichos: Bicho[] = [];
  private bob?: Phaser.Physics.Arcade.Sprite;
  private bobEscala = 1;
  private bobCasa = new Phaser.Math.Vector2();
  private rotuloBob?: Phaser.GameObjects.Text;
  private cavaleiro?: Phaser.GameObjects.Sprite;
  private montaria = 0;
  private mae?: Phaser.GameObjects.Sprite;
  private proximoChinelo = 0;
  private portal?: Phaser.GameObjects.Sprite;
  private checkpointX = u(48);
  private checkpointY = u(240);
  private vencido = false;
  private ajuda = false;
  private ajudaItens: Phaser.GameObjects.GameObject[] = [];
  private travaFalha = 0;
  private mundoLargura = 0;
  private mundoAltura = 0;
  private animais: { sprite: Phaser.GameObjects.Sprite; vel: number }[] = [];
  private fundoImagem?: Phaser.GameObjects.Image;

  constructor() {
    super('fase');
  }

  init(data: DadosFase): void {
    this.id = data?.id ?? 'fase1';
    this.continuar = Boolean(data?.continuar);
    this.spawnX = data?.x ?? 0;
    this.spawnY = data?.y ?? 0;
    this.vencido = false;
    this.ajuda = false;
    this.ajudaItens = [];
    this.bichos = [];
    this.animais = [];
    this.chaoTiles.clear();
    this.bob = undefined;
    this.cavaleiro = undefined;
    this.montaria = 0;
    this.mae = undefined;
    this.portal = undefined;
  }

  create(): void {
    this.def = fases[this.id] ?? fases.fase1;
    zerarVirtual();
    this.controles = new Controles(this);
    this.physics.world.gravity.y = GRAVIDADE;
    this.solidos = this.physics.add.staticGroup();
    this.blocos = this.physics.add.staticGroup();

    const mapa = this.def.mapa;
    this.mundoAltura = mapa.length * TILE;
    this.mundoLargura = mapa[0].length * TILE;

    this.fundoImagem = this.add.image(0, 0, this.def.fundo).setOrigin(0).setScrollFactor(0).setDepth(-10);
    this.enquadrarFase();
    observarTela(this, () => this.enquadrarFase());

    let inicioX = u(48);
    let inicioY = u(240);
    for (let y = 0; y < mapa.length; y += 1) {
      for (let x = 0; x < mapa[y].length; x += 1) {
        if (mapa[y][x] === 'S') {
          inicioX = x * TILE + TILE / 2;
          inicioY = (y + 1) * TILE - 1;
        }
      }
    }
    if (this.continuar && this.spawnX > 0) {
      inicioX = this.spawnX;
      inicioY = this.spawnY || inicioY;
    }

    this.checkpointX = inicioX;
    this.checkpointY = inicioY;
    this.arthur = new Arthur(this, inicioX, inicioY);
    this.arthur.invulneravelAte = this.time.now + 1600;

    for (let y = 0; y < mapa.length; y += 1) {
      for (let x = 0; x < mapa[y].length; x += 1) {
        const ch = mapa[y][x];
        if (ch === ' ' || ch === 'S') continue;
        this.colocar(ch, x, y);
      }
    }

    this.physics.add.collider(this.arthur, this.solidos);
    this.physics.add.collider(this.arthur, this.blocos);
    for (const bicho of this.bichos) {
      if (!bicho.voa) this.physics.add.collider(bicho.sprite, this.solidos);
    }

    this.enquadrarFase();
    this.cameras.main.setBounds(-u(360), 0, this.mundoLargura + u(360), this.mundoAltura);
    this.cameras.main.startFollow(this.arthur, true, 0.2, 0.12);
    this.cameras.main.centerOn(this.arthur.x, this.mundoAltura / 2);
    this.cameras.main.setRoundPixels(false);

    if (this.def.tema === 'caatinga') {
      const vaca = this.add.sprite(u(90), u(168), 'vaca').setScrollFactor(0).setDepth(-5);
      const boi = this.add.sprite(u(280), u(170), 'boi').setScrollFactor(0).setDepth(-5);
      encaixar(vaca, TILE * 1.7);
      encaixar(boi, TILE * 1.7);
      this.animais.push({ sprite: vaca, vel: u(16) }, { sprite: boi, vel: u(11) });
    }

    estado.titulo = this.def.titulo;
    estado.moedasMeta = this.def.moedasParaSair;
    estado.montado = false;
    if (!this.continuar) estado.moedas = 0;
    estado.frase = this.def.titulo;
    estado.fraseAte = this.time.now + 2200;
    this.gravar();

    this.scene.stop('menu');
    if (this.continuar) this.abrirHud();
    else this.abrirAjuda();
    this.events.once('shutdown', () => zerarVirtual());
  }

  private enquadrarFase(): void {
    const cam = this.cameras.main;
    const zoom = this.scale.height / Math.max(this.mundoAltura, 1);
    cam.setSize(this.scale.width, this.scale.height);
    cam.setViewport(0, 0, this.scale.width, this.scale.height);
    cam.setZoom(zoom);
    cam.setRoundPixels(false);
    const origemX = cam.width / 2;
    const origemY = cam.height / 2;
    this.fundoImagem
      ?.setPosition(origemX * (1 - 1 / zoom), origemY * (1 - 1 / zoom))
      .setDisplaySize(cam.width / zoom, cam.height / zoom);
  }

  private abrirHud(): void {
    this.scene.launch('hud');
    this.scene.bringToTop('hud');
  }

  private abrirAjuda(): void {
    this.ajuda = true;
    this.arthur.travado = true;
    const zoom = this.cameras.main.zoom || 1;
    const visivel = this.scale.width / zoom;
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const painelLargura = Math.min(u(430), visivel * 0.9);
    const painel = this.add.rectangle(cx, cy, painelLargura, u(220), 0x101826, 0.96).setScrollFactor(0).setDepth(40);
    const titulo = this.add
      .text(cx, cy - u(86), this.def.titulo, estiloTexto(fonte(18), '#f0c43a'))
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(41);
    const texto = this.add
      .text(cx, cy - u(18), this.def.objetivo, {
        ...estiloTexto(fonte(13), '#fff6e8'),
        align: 'center',
        wordWrap: { width: painelLargura - u(36) },
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(41);
    const botao = this.add
      .rectangle(cx, cy + u(78), Math.max(u(200), rem(12)), Math.max(u(48), rem(3.4)), 0xf0c43a, 0.45)
      .setScrollFactor(0)
      .setDepth(41);
    const rotulo = this.add
      .text(cx, cy + u(78), 'Leia com calma', estiloTexto(fonte(15), '#1a120c'))
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(42);
    this.ajudaItens = [painel, titulo, texto, botao, rotulo];
    const fechar = (): void => {
      if (!this.ajuda) return;
      this.ajuda = false;
      this.arthur.travado = false;
      this.arthur.invulneravelAte = this.time.now + 900;
      this.ajudaItens.forEach((item) => item.destroy());
      this.ajudaItens = [];
      this.abrirHud();
    };
    let falta = 7;
    const contar = (): void => {
      if (!this.ajuda) return;
      falta -= 1;
      if (falta > 0) {
        rotulo.setText(String(falta));
        this.time.delayedCall(1000, contar);
        return;
      }
      botao.setFillStyle(0xf0c43a, 1);
      rotulo.setText('Entendi');
      botao.setInteractive({ useHandCursor: true });
      botao.on('pointerdown', fechar);
    };
    this.time.delayedCall(1000, contar);
  }

  private colocar(ch: string, x: number, y: number): void {
    const px = x * TILE;
    const py = y * TILE;
    const pesX = px + TILE / 2;
    const pesY = (y + 1) * TILE;

    if (ch === '#') {
      const tex = y >= this.def.mapa.length - 2 ? this.def.chao : 'tijolo';
      this.solido(px, py, tex);
      this.chaoTiles.add(`${x},${y}`);
      return;
    }

    const blocos: Record<string, [string, string]> = {
      L: ['bloco-livro', 'livro'],
      X: ['bloco-pix', 'pix'],
      P: ['bloco-prato', 'prato'],
      W: ['bloco-vassoura', 'vassoura'],
      A: ['bloco-passagem', 'passagem'],
      U: ['bloco-balao', 'balao'],
      R: ['bloco-bob', 'bob'],
    };
    if (blocos[ch]) {
      const sprite = this.solidoGrupo(this.blocos, px, py, blocos[ch][0]);
      sprite.setData('tipo', blocos[ch][1]);
      sprite.setData('usado', false);
      this.chaoTiles.add(`${x},${y}`);
      return;
    }

    if (ch === 'o') this.moeda(px + TILE / 2, py + TILE / 2);
    if (ch === 'C') this.coruja(px + TILE / 2, py + TILE / 2);
    if (ch === 'E' || ch === 'T') this.inimigoChao(ch, pesX, pesY);
    if (ch === 'N') this.chinelo(pesX, pesY - TILE * 1.95, false);
    if (ch === 'H') this.chinelo(pesX, pesY - TILE * 0.2, true);
    if (ch === 'B') this.criarBob(pesX, pesY);
    if (ch === 'M') this.criarMae(pesX, pesY);
    if (ch === 'F') this.criarPonto(pesX, pesY);
    if (ch === 'G') this.criarPortal(pesX, pesY);
  }

  private solido(px: number, py: number, tex: string): Phaser.Physics.Arcade.Sprite {
    return this.solidoGrupo(this.solidos, px, py, tex);
  }

  private solidoGrupo(
    grupo: Phaser.Physics.Arcade.StaticGroup,
    px: number,
    py: number,
    tex: string,
  ): Phaser.Physics.Arcade.Sprite {
    const sprite = grupo.create(px + TILE / 2, py + TILE / 2, tex) as Phaser.Physics.Arcade.Sprite;
    sprite.setOrigin(0, 0);
    sprite.setPosition(px, py);
    sprite.refreshBody();
    sprite.setDepth(2);
    return sprite;
  }

  private moeda(x: number, y: number): void {
    const sprite = this.physics.add.sprite(x, y, 'moeda');
    sprite.setGravityY(-GRAVIDADE);
    sprite.setImmovable(true);
    sprite.setDepth(3);
    this.tweens.add({ targets: sprite, y: y - u(3), duration: 600, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.arthur, sprite, () => {
      if (!sprite.active) return;
      sprite.destroy();
      this.ganharMoeda(x, y, false);
    });
  }

  private coruja(x: number, y: number): void {
    const sprite = this.physics.add.sprite(x, y, 'coruja');
    sprite.setGravityY(-GRAVIDADE);
    sprite.setImmovable(true);
    sprite.setDepth(3);
    this.tweens.add({ targets: sprite, y: y - u(4), duration: 700, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.arthur, sprite, () => {
      if (!sprite.active) return;
      sprite.destroy();
      som.moeda();
    });
  }

  private inimigoChao(ch: string, x: number, y: number): void {
    let tex = 'celular';
    let vel = u(38);
    if (ch === 'T') tex = 'tv';
    if (this.def.id === 'fase2') {
      const tipos = ['lanche-0', 'lanche-1', 'lanche-2'];
      tex = tipos[Math.abs(Math.floor(x)) % 3];
      vel = u(34);
    }
    if (this.def.id === 'fase4') {
      tex = 'mala';
      vel = u(48);
    }
    this.criarBicho(tex, x, y, vel, false);
  }

  private chinelo(x: number, y: number, alto: boolean): void {
    this.criarBicho(alto ? 'chinelo-alto' : 'chinelo', x, y, alto ? u(62) : u(50), true);
  }

  private criarBicho(tex: string, x: number, y: number, velocidade: number, voa: boolean): void {
    const sprite = this.physics.add.sprite(x, y, tex);
    sprite.setOrigin(0.5, 1);
    sprite.setDepth(4);
    (sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    sprite.setVelocityX(velocidade);
    sprite.setBounce(0);
    const bicho: Bicho = {
      sprite,
      dir: 1,
      minX: x - u(40),
      maxX: x + u(56),
      baseY: y,
      voa,
      projetil: false,
      vivo: true,
      velocidade,
    };
    sprite.setData('bicho', bicho);
    this.bichos.push(bicho);
  }

  private criarBob(x: number, y: number): void {
    this.bob = this.physics.add.sprite(x, y, 'bob');
    this.bob.setOrigin(0.5, 1);
    this.bob.setDepth(4);
    encaixar(this.bob, TILE * 1.45);
    this.bobEscala = this.bob.scaleX;
    this.bob.setGravityY(-GRAVIDADE);
    this.bob.setImmovable(true);
    this.bobCasa.set(x, y);
    this.rotuloBob = this.add
      .text(x, y - this.bob.displayHeight - u(2), 'BOB', estiloTexto(fonte(8), '#f0c43a'))
      .setOrigin(0.5, 1)
      .setDepth(6);
  }

  private criarMae(x: number, y: number): void {
    this.mae = this.add.sprite(x, y, 'mae').setOrigin(0.5, 1).setDepth(4);
    encaixar(this.mae, TILE * 3.35);
    this.proximoChinelo = this.time.now + 600;
  }

  private criarPonto(x: number, y: number): void {
    const sprite = this.physics.add.sprite(x, y, 'bandeira');
    sprite.setOrigin(0.5, 1);
    sprite.setGravityY(-GRAVIDADE);
    sprite.setImmovable(true);
    sprite.setDepth(3);
    if (Math.abs(x - this.spawnX) < u(12) && this.continuar) sprite.setTint(0x8dffb0);
    this.physics.add.overlap(this.arthur, sprite, () => {
      if (sprite.getData('ok')) return;
      sprite.setData('ok', true);
      sprite.setTint(0x8dffb0);
      this.checkpointX = x;
      this.checkpointY = y;
      estado.frase = this.def.frasePonto;
      estado.fraseAte = this.time.now + 2600;
      som.ponto();
      this.gravar();
    });
  }

  private criarPortal(x: number, y: number): void {
    const tex =
      this.def.id === 'fase1' ? 'portal-boletim' : this.def.id === 'fase2' ? 'portal-arco' : 'portal-barra';
    const sprite = this.physics.add.sprite(x, y, tex);
    sprite.setOrigin(0.5, 1);
    sprite.setGravityY(-GRAVIDADE);
    sprite.setImmovable(true);
    sprite.setDepth(3);
    this.portal = sprite;
    if (this.def.moedasParaSair > 0) {
      this.add
        .text(x, y - u(52), '10 moedas', estiloTexto(fonte(8), '#fff6e8'))
        .setOrigin(0.5)
        .setDepth(6);
    }
    this.physics.add.overlap(this.arthur, sprite, () => this.tentarSair());
  }

  update(tempo: number, delta: number): void {
    if (!this.arthur || this.ajuda) return;
    this.arthur.atualizar(tempo, delta, this.controles);
    this.baterBlocos();
    this.checarBichos();
    this.andarBichos();
    this.andarBob(tempo, delta);
    this.maeJoga(tempo);
    this.animaisFundo(delta);

    if (this.arthur.x < u(12)) this.arthur.x = u(12);
    if (this.arthur.x > this.mundoLargura - u(12)) this.arthur.x = this.mundoLargura - u(12);
    if (this.portal && !this.vencido && Math.abs(this.arthur.x - this.portal.x) < u(28) && Math.abs(this.arthur.y - this.portal.y) < u(36)) {
      this.tentarSair();
    }

    if (!this.vencido && this.arthur.y > this.mundoAltura) {
      if (this.arthur.montado) this.bobLevaOGolpe(true);
      else this.receberDano(true);
    }

    if (this.portal && this.def.moedasParaSair > 0) {
      this.portal.setTint(estado.moedas >= this.def.moedasParaSair ? 0x9dffc4 : 0xffb4b4);
    }
  }

  private animaisFundo(delta: number): void {
    for (const animal of this.animais) {
      animal.sprite.x -= animal.vel * (delta / 1000);
      if (animal.sprite.x < -u(40)) animal.sprite.x = this.cameras.main.displayWidth + u(30);
    }
  }

  private andarBob(tempo: number, delta: number): void {
    if (!this.bob) return;
    if (this.arthur.montado) this.animarMontaria(tempo, delta);
    else this.soltarMontaria();
    if (this.rotuloBob && this.bob && !this.arthur.montado) {
      this.rotuloBob.setPosition(this.bob.x, this.bob.y - this.bob.displayHeight - u(2));
    }
    if (!this.arthur.montado && this.bob) {
      const pertoX = Math.abs(this.arthur.x - this.bob.x) < TILE * 1.6;
      const pertoY = Math.abs(this.arthur.y - this.bob.y) < TILE * 1.3;
      const caindo = this.arthur.corpo().velocity.y > u(80);
      if (pertoX && pertoY && (this.controles.baixo() || caindo) && !this.arthur.travado) {
        this.arthur.montar();
        som.poder();
      }
    }
  }

  private animarMontaria(tempo: number, delta: number): void {
    if (!this.bob) return;
    this.montaria = Math.min(1, this.montaria + delta / 220);
    const corpo = this.arthur.corpo();
    const noChao = this.arthur.noChao();
    const vel = Math.abs(corpo.velocity.x);
    const andando = noChao && vel > 40;
    const freq = andando ? 78 : noChao ? 460 : 160;
    const onda = Math.sin(tempo / freq);
    const passo = andando ? onda : noChao ? onda * 0.35 : Math.sin(tempo / 140) * 0.5;
    const base = this.bobEscala;
    const largura = this.bob.width * base;
    const altura = this.bob.height * base;
    const dir = this.arthur.flipX ? -1 : 1;

    this.bob.setFlipX(this.arthur.flipX);
    this.bob.setScale(base * (1 + passo * 0.045), base * (1 - passo * (andando ? 0.07 : 0.03) + (noChao ? 0 : 0.08)));
    this.bob.setPosition(this.arthur.x + dir * largura * 0.08, this.arthur.y - (andando ? (1 - Math.abs(passo)) * u(6) : u(1)));
    this.bob.setAngle(passo * (andando ? 14 : noChao ? 4 : -16) * dir);

    const pose = noChao ? 'arthur-agacha-0' : 'arthur-pulo-0';
    if (!this.cavaleiro) {
      this.cavaleiro = this.add.sprite(this.arthur.x, this.arthur.y, pose).setOrigin(0.5, 1).setDepth(6);
    }
    if (this.cavaleiro.texture.key !== pose) this.cavaleiro.setTexture(pose);
    encaixar(this.cavaleiro, this.arthur.displayHeight * 0.74);
    const subida = altura * 0.7 * this.montaria;
    this.cavaleiro.setVisible(true);
    this.cavaleiro.setFlipX(this.arthur.flipX);
    this.cavaleiro.setPosition(this.bob.x - dir * largura * 0.12, this.bob.y - subida + passo * u(andando ? 2.4 : 1));
    this.cavaleiro.setAngle(this.bob.angle * 0.55 + (andando ? dir * 6 : 0));
    const alpha = this.arthur.invisivel ? 0.35 : this.arthur.invulneravel && Math.floor(tempo / 80) % 2 === 0 ? 0.45 : 1;
    this.cavaleiro.setAlpha(alpha);
    this.arthur.setAlpha(0);
    this.rotuloBob?.setVisible(false);
  }

  private soltarMontaria(): void {
    this.montaria = 0;
    if (this.bob) {
      this.bob.setAngle(0);
      this.bob.setScale(this.bobEscala);
    }
    this.cavaleiro?.setVisible(false);
    this.rotuloBob?.setVisible(true);
  }

  private maeJoga(tempo: number): void {
    if (!this.mae || this.vencido) return;
    this.mae.setFlipX(this.arthur.x > this.mae.x);
    if (tempo < this.proximoChinelo) return;
    if (Math.abs(this.arthur.x - this.mae.x) > u(280)) return;
    if (this.arthur.x > this.mae.x + u(12)) return;
    this.proximoChinelo = tempo + 1250;
    const direcao = this.arthur.x < this.mae.x ? -1 : 1;
    const sprite = this.physics.add.sprite(this.mae.x + direcao * TILE * 0.85, this.mae.y - TILE * 2.15, 'chinelo');
    sprite.setOrigin(0.5, 1);
    sprite.setDepth(4);
    sprite.setVelocity(u(160) * direcao, -u(210));
    const bicho: Bicho = {
      sprite,
      dir: direcao,
      minX: 0,
      maxX: this.mundoLargura,
      baseY: sprite.y,
      voa: false,
      projetil: true,
      vivo: true,
      velocidade: u(160),
    };
    sprite.setData('bicho', bicho);
    this.bichos.push(bicho);
    this.physics.add.collider(sprite, this.solidos);
    this.time.delayedCall(2600, () => {
      if (!bicho.vivo) return;
      bicho.vivo = false;
      sprite.destroy();
    });
  }

  private andarBichos(): void {
    for (const bicho of this.bichos) {
      if (!bicho.vivo || !bicho.sprite.active) continue;
      if (bicho.projetil) {
        if (bicho.sprite.y > this.mundoAltura + u(30)) {
          bicho.vivo = false;
          bicho.sprite.destroy();
        }
        continue;
      }
      const body = bicho.sprite.body as Phaser.Physics.Arcade.Body;
      if (bicho.sprite.x <= bicho.minX) bicho.dir = 1;
      else if (bicho.sprite.x >= bicho.maxX) bicho.dir = -1;
      else if (!bicho.voa && body.blocked.left) bicho.dir = 1;
      else if (!bicho.voa && body.blocked.right) bicho.dir = -1;
      else if (!bicho.voa) {
        const frente = Math.floor((bicho.sprite.x + bicho.dir * u(14)) / TILE);
        const linha = Math.floor((bicho.sprite.y + u(2)) / TILE);
        if (!this.chaoTiles.has(`${frente},${linha}`) && !this.chaoTiles.has(`${frente},${linha - 1}`)) {
          bicho.dir *= -1;
        }
      }
      body.setVelocityX(bicho.dir * bicho.velocidade);
      body.setVelocityY(0);
      if (bicho.voa) bicho.sprite.y = bicho.baseY;
      bicho.sprite.setFlipX(bicho.dir < 0);
    }
  }

  private checarBichos(): void {
    const corpo = this.arthur.corpo();
    for (const bicho of this.bichos) {
      if (!bicho.vivo || !bicho.sprite.active) continue;
      const outro = bicho.sprite.body as Phaser.Physics.Arcade.Body;
      const encosta =
        corpo.right > outro.left &&
        corpo.left < outro.right &&
        corpo.bottom > outro.top &&
        corpo.top < outro.bottom;
      if (encosta) this.tocarBicho(bicho);
    }
  }

  private tocarBicho(bicho: Bicho): void {
    if (!bicho.vivo || this.vencido || this.arthur.travado) return;
    const corpo = this.arthur.corpo();
    const outro = bicho.sprite.body as Phaser.Physics.Arcade.Body;
    const pisou = corpo.velocity.y > u(40) && corpo.bottom <= outro.top + outro.height * 0.5;
    if (pisou) {
      bicho.vivo = false;
      bicho.sprite.disableBody(true, true);
      corpo.setVelocityY(-u(230));
      som.pisar();
      return;
    }
    this.receberDano(false);
  }

  private baterBlocos(): void {
    const corpo = this.arthur.corpo();
    const subindo = corpo.velocity.y < 0 || corpo.blocked.up;
    if (!subindo) return;
    const cabeca = this.arthur.y - this.arthur.displayHeight * 0.92;
    for (const obj of this.blocos.getChildren()) {
      const bloco = obj as Phaser.Physics.Arcade.Sprite;
      if (bloco.getData('usado')) continue;
      const body = bloco.body as Phaser.Physics.Arcade.StaticBody;
      const alcance = Math.max(TILE * 0.95, this.arthur.displayWidth * 0.45);
      const acertou =
        cabeca <= body.bottom + TILE * 0.75 &&
        cabeca >= body.bottom - TILE * 1.2 &&
        this.arthur.x > body.left - alcance &&
        this.arthur.x < body.right + alcance;
      if (acertou) this.usarBloco(bloco);
    }
  }

  private usarBloco(bloco: Phaser.Physics.Arcade.Sprite): void {
    bloco.setData('usado', true);
    const tipo = bloco.getData('tipo') as string;
    bloco.setTexture('bloco-vazio');
    bloco.refreshBody();
    if (tipo === 'pix') this.ganharMoeda(bloco.x + TILE / 2, bloco.y, true);
    else if (tipo === 'balao') this.soltarBalao(bloco.x + TILE / 2, bloco.y);
    else if (tipo === 'bob') this.liberarBob(bloco);
    else this.soltarEstrela(bloco.x + TILE / 2, bloco.y);
  }

  private liberarBob(bloco: Phaser.Physics.Arcade.Sprite): void {
    som.poder();
    estado.frase = 'O Bob pode ir junto. Desça em cima dele.';
    estado.fraseAte = this.time.now + 2800;
    if (this.bob) return;
    const superficie = (this.def.mapa.length - 2) * TILE;
    this.criarBob(bloco.x + TILE / 2, superficie);
  }

  private ganharMoeda(x: number, y: number, estourar: boolean): void {
    estado.moedas += 1;
    som.moeda();
    this.gravar();
    const sprite = this.add.sprite(x, y, 'moeda').setDepth(7);
    this.tweens.add({
      targets: sprite,
      y: y - (estourar ? u(28) : u(16)),
      alpha: 0,
      duration: 380,
      onComplete: () => sprite.destroy(),
    });
  }

  private soltarEstrela(x: number, y: number): void {
    som.moeda();
    const sprite = this.add.sprite(x, y, 'estrela').setDepth(7);
    this.tweens.add({
      targets: sprite,
      y: y - u(26),
      alpha: 0,
      duration: 380,
      onComplete: () => sprite.destroy(),
    });
  }

  private soltarBalao(x: number, y: number): void {
    const item = this.physics.add.sprite(x, y - u(6), 'balao-item');
    item.setDepth(6);
    item.setVelocity(u(50), -u(180));
    item.setBounce(0.2);
    this.physics.add.collider(item, this.solidos);
    this.physics.add.overlap(this.arthur, item, () => {
      if (!item.active) return;
      item.destroy();
      this.arthur.ficarGrande(this.time.now);
      som.poder();
    });
    this.time.delayedCall(8000, () => {
      if (item.active) item.destroy();
    });
  }

  private tentarSair(): void {
    if (this.vencido || this.arthur.travado) return;
    if (this.def.moedasParaSair > 0 && estado.moedas < this.def.moedasParaSair) {
      if (this.time.now < this.travaFalha) return;
      this.travaFalha = this.time.now + 900;
      estado.frase = 'Faltam moedas!';
      estado.fraseAte = this.time.now + 1600;
      this.receberDano(true);
      return;
    }
    this.vencer();
  }

  private receberDano(buraco: boolean): void {
    if (this.vencido || this.arthur.travado) return;
    if (!buraco && (this.arthur.invisivel || this.arthur.invulneravel)) return;
    if (!buraco && this.arthur.montado) {
      this.bobLevaOGolpe(false);
      return;
    }
    if (!buraco && this.arthur.grande) {
      this.arthur.encolher(this.time.now);
      som.dano();
      this.cameras.main.shake(80, 0.004);
      return;
    }
    estado.vidas -= 1;
    som.dano();
    navigator.vibrate?.(30);
    this.cameras.main.shake(140, 0.006);
    if (estado.vidas <= 0) {
      this.arthur.travado = true;
      const fase = this.def.id;
      reiniciarEstado();
      salvar({ fase, x: 0, y: 0, vidas: VIDAS_INICIAIS, moedas: 0 });
      this.scene.stop('hud');
      this.scene.start('gameover', { fase });
      return;
    }
    this.arthur.renascer(this.checkpointX, this.checkpointY, this.time.now);
    if (this.bob) {
      this.bob.setPosition(this.bobCasa.x, this.bobCasa.y);
      this.bob.setAlpha(1);
    }
    this.gravar();
  }

  private bobLevaOGolpe(buraco: boolean): void {
    this.arthur.desmontar(this.time.now);
    this.esconderBob();
    som.dano();
    this.cameras.main.shake(100, 0.005);
    estado.frase = buraco ? 'O Bob segurou a queda.' : 'O Bob levou o golpe.';
    estado.fraseAte = this.time.now + 2200;
    this.arthur.invulneravelAte = this.time.now + 1400;
    if (!buraco) return;
    const linha = this.def.mapa.length - 2;
    let coluna = Math.max(2, Math.floor(this.arthur.x / TILE));
    let achou = false;
    for (let i = 0; i < 8; i += 1) {
      if (this.chaoTiles.has(`${coluna},${linha}`)) {
        achou = true;
        break;
      }
      coluna -= 1;
    }
    const x = achou ? coluna * TILE + TILE / 2 : this.checkpointX;
    const y = achou ? linha * TILE - 1 : this.checkpointY;
    this.arthur.corpo().reset(x, y);
    this.arthur.corpo().setVelocity(0, -u(120));
  }

  private esconderBob(): void {
    if (!this.bob) return;
    const casaX = this.bobCasa.x;
    const casaY = this.bobCasa.y;
    this.tweens.add({
      targets: this.bob,
      x: this.bob.x + this.arthur.olhando * u(70),
      alpha: 0,
      duration: 380,
      onComplete: () => {
        this.bob?.setPosition(casaX, casaY);
        this.bob?.setAlpha(1);
      },
    });
  }

  private vencer(): void {
    if (this.vencido) return;
    this.vencido = true;
    this.arthur.travado = true;
    this.arthur.corpo().setVelocity(0, 0);
    som.fase();
    this.cameras.main.flash(180, 255, 244, 214);
    this.scene.stop('hud');
    zerarVirtual();
    this.time.delayedCall(520, () => {
      this.scene.start('cartao', { texto: this.def.cartao, proxima: this.def.proxima });
    });
  }

  private gravar(): void {
    if (estado.vidas <= 0) return;
    salvar({
      fase: this.def.id,
      x: this.checkpointX,
      y: this.checkpointY,
      vidas: estado.vidas,
      moedas: estado.moedas,
    });
  }
}
