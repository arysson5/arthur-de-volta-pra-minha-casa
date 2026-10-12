import {
  BUFFER_PULO,
  COYOTE,
  ESCALA,
  GRANDE_MS,
  INVISIVEL_MS,
  PULO,
  PULO_BOB,
  PULO_MINIMO_MS,
  RECARGA_INVIS_MS,
  TILE,
  VELOCIDADE,
  VELOCIDADE_AGACHADO,
} from './constantes';
import { estado } from './estado';
import { Controles } from './controles';
import { som } from './som';

export class Arthur extends Phaser.Physics.Arcade.Sprite {
  coyote = 0;
  bufferPulo = 0;
  agachado = false;
  invisivelAte = 0;
  recargaInvis = 0;
  grandeAte = 0;
  invulneravelAte = 0;
  montado = false;
  cortarPulo = false;
  private impulso = 0;
  olhando = 1;
  travado = false;
  private escalaBase = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'arthur-parado-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(5);
    this.setCollideWorldBounds(false);
    this.setMaxVelocity(240 * ESCALA, 560 * ESCALA);
    this.ajustarTamanho();
    this.play('arthur-parado');
  }

  private ajustarTamanho(): void {
    this.escalaBase = (TILE * 2.7) / Math.max(1, this.frame.height);
    this.aplicarEscala();
    this.corpoNormal();
  }

  corpo(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  private corpoNormal(): void {
    this.definirCorpo(0.32, 0.86);
  }

  private corpoAgachado(): void {
    this.definirCorpo(0.4, 0.48);
  }

  private definirCorpo(largura: number, altura: number): void {
    const bw = this.frame.width * largura;
    const bh = this.frame.height * altura;
    this.corpo().setSize(bw, bh);
    this.corpo().setOffset((this.frame.width - bw) / 2, this.frame.height - bh);
  }

  get invisivel(): boolean {
    return this.scene.time.now < this.invisivelAte;
  }

  get grande(): boolean {
    return this.scene.time.now < this.grandeAte;
  }

  get invulneravel(): boolean {
    return this.scene.time.now < this.invulneravelAte;
  }

  noChao(): boolean {
    return this.corpo().blocked.down || this.corpo().touching.down;
  }

  ficarGrande(agora: number): void {
    this.grandeAte = agora + GRANDE_MS;
    this.aplicarEscala();
  }

  encolher(agora: number): void {
    this.grandeAte = 0;
    this.invulneravelAte = agora + 900;
    this.aplicarEscala();
  }

  private aplicarEscala(): void {
    this.setScale(this.escalaBase * (this.grande ? 1.45 : 1));
  }

  montar(): void {
    this.montado = true;
    estado.montado = true;
  }

  desmontar(agora: number): void {
    this.montado = false;
    estado.montado = false;
    this.invulneravelAte = agora + 900;
  }

  renascer(x: number, y: number, agora: number): void {
    this.montado = false;
    estado.montado = false;
    this.grandeAte = 0;
    this.aplicarEscala();
    this.corpo().reset(x, y);
    this.agachado = false;
    this.corpoNormal();
    this.invulneravelAte = agora + 1400;
    this.travado = false;
    this.setAlpha(1);
  }

  atualizar(tempo: number, delta: number, controles: Controles): void {
    if (this.travado) {
      this.corpo().setVelocityX(0);
      return;
    }

    if (this.grandeAte !== 0 && tempo > this.grandeAte) {
      this.grandeAte = 0;
      this.aplicarEscala();
    }

    const noChao = this.noChao();
    if (noChao) this.coyote = COYOTE;
    else this.coyote -= delta;

    if (controles.puloAgora()) this.bufferPulo = BUFFER_PULO;
    else this.bufferPulo -= delta;

    const eixo = controles.eixo();
    const querAgachar = controles.baixo() && noChao && !this.montado && eixo === 0;
    if (querAgachar !== this.agachado) {
      this.agachado = querAgachar;
      if (this.agachado) this.corpoAgachado();
      else this.corpoNormal();
    }

    const vel = this.agachado ? VELOCIDADE_AGACHADO : VELOCIDADE;
    const alvo = eixo * vel;
    if (noChao || eixo !== 0) this.corpo().setVelocityX(alvo);
    if (eixo !== 0) this.olhando = eixo;
    this.setFlipX(this.olhando < 0);

    if (this.bufferPulo > 0 && this.coyote > 0) {
      this.corpo().setVelocityY(this.montado ? PULO_BOB : PULO);
      this.coyote = 0;
      this.bufferPulo = 0;
      this.cortarPulo = true;
      this.impulso = tempo;
      this.agachado = false;
      this.corpoNormal();
      som.pular();
    } else if (
      this.cortarPulo &&
      !controles.segurandoPulo() &&
      tempo - this.impulso > PULO_MINIMO_MS &&
      this.corpo().velocity.y < 0
    ) {
      this.corpo().setVelocityY(this.corpo().velocity.y * 0.62);
      this.cortarPulo = false;
    }

    if (!noChao && controles.baixo()) {
      this.corpo().setVelocityY(Math.min(this.corpo().velocity.y + 28 * ESCALA, 520 * ESCALA));
    }

    if (controles.invisAgora() && tempo >= this.recargaInvis) {
      this.invisivelAte = tempo + INVISIVEL_MS;
      this.recargaInvis = tempo + RECARGA_INVIS_MS;
    }

    const falta = Math.max(0, this.recargaInvis - tempo);
    estado.invis = 1 - Math.min(1, falta / RECARGA_INVIS_MS);

    if (this.invisivel) this.setAlpha(0.35);
    else if (this.invulneravel && Math.floor(tempo / 80) % 2 === 0) this.setAlpha(0.45);
    else this.setAlpha(1);

    if (this.montado) this.play(noChao ? 'arthur-agacha' : 'arthur-pulo', true);
    else if (!noChao) this.play('arthur-pulo', true);
    else if (this.agachado) this.play('arthur-agacha', true);
    else if (eixo !== 0) this.play('arthur-corre', true);
    else this.play('arthur-parado', true);
  }
}
