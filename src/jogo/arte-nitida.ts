import { ALTURA_VISAO, ESCALA, LARGURA, TILE } from './constantes';

function tela(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  ctx.imageSmoothingEnabled = true;
  return { canvas, ctx };
}

function registrar(scene: Phaser.Scene, chave: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(chave)) scene.textures.remove(chave);
  const tex = scene.textures.addCanvas(chave, canvas);
  tex?.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

function k(n: number): number {
  return n * ESCALA;
}

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  cor: string,
): void {
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function texto(
  ctx: CanvasRenderingContext2D,
  valor: string,
  x: number,
  y: number,
  tamanho: number,
  cor: string,
): void {
  ctx.fillStyle = cor;
  ctx.font = `700 ${tamanho}px Segoe UI, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(valor, x, y);
}

function bloco(scene: Phaser.Scene, chave: string, fundo: string, detalhe: (ctx: CanvasRenderingContext2D) => void): void {
  const { canvas, ctx } = tela(TILE, TILE);
  const grad = ctx.createLinearGradient(0, 0, 0, TILE);
  grad.addColorStop(0, '#ffffffcc');
  grad.addColorStop(0.16, fundo);
  grad.addColorStop(1, fundo);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.fillRect(0, TILE - k(2), TILE, k(2));
  detalhe(ctx);
  registrar(scene, chave, canvas);
}

export function gerarBlocos(scene: Phaser.Scene): void {
  const t = TILE;
  bloco(scene, 'chao-caatinga', '#c4a15a', (ctx) => {
    ctx.fillStyle = '#8d6b3a';
    ctx.fillRect(0, 0, t, k(4));
    ctx.fillStyle = '#e7d7a4';
    ctx.beginPath();
    ctx.arc(k(5), k(9), k(1.4), 0, Math.PI * 2);
    ctx.arc(k(12), k(12), k(1.6), 0, Math.PI * 2);
    ctx.fill();
  });
  bloco(scene, 'chao-casa', '#efe7dc', (ctx) => {
    ctx.strokeStyle = '#cbbba8';
    ctx.lineWidth = k(1);
    ctx.strokeRect(k(0.5), k(0.5), t - k(1), t - k(1));
  });
  bloco(scene, 'chao-aero', '#d5dee6', (ctx) => {
    ctx.fillStyle = '#8d99a6';
    ctx.fillRect(0, 0, t, k(3));
    ctx.fillStyle = '#b7c3ce';
    ctx.fillRect(k(3), k(8), k(10), k(1.2));
  });
  bloco(scene, 'tijolo', '#c46a42', (ctx) => {
    ctx.fillStyle = '#7a3b24';
    ctx.fillRect(0, k(7.4), t, k(1.2));
    ctx.fillRect(k(7.4), 0, k(1.2), k(7.4));
    ctx.fillRect(k(2.2), k(8.6), k(1.2), k(7));
  });
  bloco(scene, 'bloco-vazio', '#6d5844', (ctx) => {
    rr(ctx, k(2), k(2), k(12), k(12), k(2), '#4a382c');
  });
  bloco(scene, 'bloco-livro', '#8b4518', (ctx) => {
    rr(ctx, k(3), k(2), k(10), k(12), k(1.2), '#f6ead2');
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(k(3), k(2), k(2), k(12));
    ctx.fillStyle = '#8b4518';
    ctx.fillRect(k(6.5), k(5), k(5), k(1));
    ctx.fillRect(k(6.5), k(8), k(5), k(1));
  });
  bloco(scene, 'bloco-pix', '#0e8f86', (ctx) => {
    texto(ctx, 'PIX', t / 2, t / 2 + k(0.5), k(6), '#ffffff');
  });
  bloco(scene, 'bloco-bob', '#c45a2a', (ctx) => {
    texto(ctx, 'BOB', t / 2, t / 2 + k(0.4), k(5), '#fff6e8');
  });
  bloco(scene, 'bloco-prato', '#d7ebe8', (ctx) => {
    ctx.fillStyle = '#9fb8b4';
    ctx.beginPath();
    ctx.ellipse(t / 2, k(11), k(6), k(1.6), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7fffe';
    ctx.beginPath();
    ctx.ellipse(t / 2, k(8), k(4.5), k(2.2), 0, 0, Math.PI * 2);
    ctx.fill();
  });
  bloco(scene, 'bloco-vassoura', '#e4d2ad', (ctx) => {
    ctx.strokeStyle = '#8d6b3a';
    ctx.lineWidth = k(1.4);
    ctx.beginPath();
    ctx.moveTo(k(9), k(2));
    ctx.lineTo(k(8), k(10));
    ctx.stroke();
    ctx.fillStyle = '#d0892e';
    ctx.beginPath();
    ctx.moveTo(k(4), k(10));
    ctx.lineTo(k(13), k(10));
    ctx.lineTo(k(11), k(14));
    ctx.lineTo(k(5), k(14));
    ctx.fill();
  });
  bloco(scene, 'bloco-passagem', '#f7f1de', (ctx) => {
    rr(ctx, k(2), k(2.5), k(12), k(11), k(1.2), '#fffaf0');
    ctx.fillStyle = '#2f6fed';
    ctx.fillRect(k(2), k(2.5), k(12), k(3.2));
    texto(ctx, 'SP', t / 2, k(10), k(5), '#243044');
  });
  bloco(scene, 'bloco-balao', '#e7fff4', (ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(t / 2, k(6), k(5), k(4), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1aa37a';
    ctx.beginPath();
    ctx.ellipse(t / 2, k(6), k(2), k(1.5), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8de0c0';
    ctx.lineWidth = k(1);
    ctx.beginPath();
    ctx.moveTo(t / 2, k(10));
    ctx.lineTo(t / 2, k(14));
    ctx.stroke();
  });

  const moeda = tela(k(16), k(16));
  const g = moeda.ctx.createRadialGradient(k(6), k(6), k(1), k(8), k(8), k(7));
  g.addColorStop(0, '#fff4c4');
  g.addColorStop(0.45, '#f0c43a');
  g.addColorStop(1, '#c48a12');
  moeda.ctx.fillStyle = g;
  moeda.ctx.beginPath();
  moeda.ctx.arc(k(8), k(8), k(6), 0, Math.PI * 2);
  moeda.ctx.fill();
  texto(moeda.ctx, '$', k(8), k(8.2), k(6), '#7a5410');
  registrar(scene, 'moeda', moeda.canvas);

  const estrela = tela(k(16), k(16));
  estrela.ctx.fillStyle = '#7bdff2';
  estrela.ctx.beginPath();
  const cx = k(8);
  const cy = k(8);
  for (let i = 0; i < 5; i += 1) {
    const ang = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const ax = cx + Math.cos(ang) * k(6);
    const ay = cy + Math.sin(ang) * k(6);
    const ang2 = ang + Math.PI / 5;
    const bx = cx + Math.cos(ang2) * k(2.4);
    const by = cy + Math.sin(ang2) * k(2.4);
    if (i === 0) estrela.ctx.moveTo(ax, ay);
    else estrela.ctx.lineTo(ax, ay);
    estrela.ctx.lineTo(bx, by);
  }
  estrela.ctx.closePath();
  estrela.ctx.fill();
  registrar(scene, 'estrela', estrela.canvas);
}

export function gerarBichos(scene: Phaser.Scene): void {
  const celular = tela(k(14), k(18));
  rr(celular.ctx, k(2), 0, k(10), k(18), k(2), '#1c1c1c');
  rr(celular.ctx, k(3), k(2), k(8), k(12), k(0.8), '#3aa0ff');
  celular.ctx.fillStyle = '#d7ecff';
  celular.ctx.fillRect(k(4), k(4), k(5), k(1));
  celular.ctx.fillRect(k(4), k(6.5), k(6), k(1));
  rr(celular.ctx, k(6), k(15), k(2), k(1.4), k(0.6), '#888');
  registrar(scene, 'celular', celular.canvas);

  const tv = tela(k(20), k(18));
  tv.ctx.strokeStyle = '#666';
  tv.ctx.lineWidth = k(1.2);
  tv.ctx.beginPath();
  tv.ctx.moveTo(k(6), k(3));
  tv.ctx.lineTo(k(10), k(1));
  tv.ctx.moveTo(k(14), k(3));
  tv.ctx.lineTo(k(10), k(1));
  tv.ctx.stroke();
  rr(tv.ctx, k(1), k(3), k(18), k(12), k(1.4), '#3a3a3a');
  rr(tv.ctx, k(3), k(5), k(14), k(8), k(0.6), '#46c46a');
  texto(tv.ctx, 'TV', k(10), k(9), k(4), '#eaffea');
  registrar(scene, 'tv', tv.canvas);

  const burger = tela(k(18), k(16));
  rr(burger.ctx, k(2), k(2), k(14), k(3.2), k(1.4), '#e7b15a');
  rr(burger.ctx, k(2), k(5.4), k(14), k(2.4), k(0.6), '#3d8f3a');
  rr(burger.ctx, k(2), k(8), k(14), k(3), k(0.6), '#8d4518');
  rr(burger.ctx, k(2), k(11), k(14), k(3), k(1.4), '#f0c43a');
  registrar(scene, 'lanche-0', burger.canvas);

  const coxinha = tela(k(16), k(16));
  coxinha.ctx.fillStyle = '#e6b15a';
  coxinha.ctx.beginPath();
  coxinha.ctx.moveTo(k(8), k(1));
  coxinha.ctx.lineTo(k(13), k(12));
  coxinha.ctx.quadraticCurveTo(k(8), k(15), k(3), k(12));
  coxinha.ctx.closePath();
  coxinha.ctx.fill();
  coxinha.ctx.fillStyle = '#f4e2b0';
  coxinha.ctx.beginPath();
  coxinha.ctx.ellipse(k(8), k(8), k(2), k(3), 0, 0, Math.PI * 2);
  coxinha.ctx.fill();
  registrar(scene, 'lanche-1', coxinha.canvas);

  const copo = tela(k(14), k(18));
  copo.ctx.fillStyle = '#e23b32';
  copo.ctx.beginPath();
  copo.ctx.moveTo(k(3), k(4));
  copo.ctx.lineTo(k(11), k(4));
  copo.ctx.lineTo(k(10), k(16));
  copo.ctx.lineTo(k(4), k(16));
  copo.ctx.closePath();
  copo.ctx.fill();
  copo.ctx.fillStyle = '#fff';
  copo.ctx.fillRect(k(4.2), k(1), k(5.6), k(2));
  copo.ctx.fillStyle = '#ffd0cc';
  copo.ctx.fillRect(k(5), k(7), k(2), k(6));
  registrar(scene, 'lanche-2', copo.canvas);

  const mala = tela(k(18), k(20));
  rr(mala.ctx, k(2), k(5), k(14), k(12), k(2), '#2f6fed');
  rr(mala.ctx, k(6), k(2), k(6), k(4), k(1), '#1d1d1d');
  mala.ctx.fillStyle = '#9db7ff';
  mala.ctx.fillRect(k(3), k(10), k(12), k(1.6));
  rr(mala.ctx, k(3), k(16), k(3), k(3), k(0.8), '#222');
  rr(mala.ctx, k(12), k(16), k(3), k(3), k(0.8), '#222');
  registrar(scene, 'mala', mala.canvas);

  const chinelo = tela(k(18), k(8));
  chinelo.ctx.fillStyle = '#f2d7a2';
  chinelo.ctx.beginPath();
  chinelo.ctx.ellipse(k(9), k(4.2), k(7), k(2.6), 0, 0, Math.PI * 2);
  chinelo.ctx.fill();
  chinelo.ctx.strokeStyle = '#8a6a3a';
  chinelo.ctx.lineWidth = k(1.1);
  chinelo.ctx.beginPath();
  chinelo.ctx.moveTo(k(6), k(3));
  chinelo.ctx.lineTo(k(9), k(5));
  chinelo.ctx.lineTo(k(12), k(3));
  chinelo.ctx.stroke();
  registrar(scene, 'chinelo', chinelo.canvas);

  const alto = tela(k(16), k(22));
  alto.ctx.strokeStyle = '#c9842a';
  alto.ctx.lineWidth = k(1.6);
  alto.ctx.beginPath();
  alto.ctx.moveTo(k(8), k(2));
  alto.ctx.lineTo(k(8), k(12));
  alto.ctx.stroke();
  alto.ctx.fillStyle = '#e7b0c4';
  alto.ctx.beginPath();
  alto.ctx.ellipse(k(8), k(15), k(6), k(3), 0, 0, Math.PI * 2);
  alto.ctx.fill();
  alto.ctx.strokeStyle = '#6a4030';
  alto.ctx.lineWidth = k(1);
  alto.ctx.beginPath();
  alto.ctx.moveTo(k(5), k(14));
  alto.ctx.lineTo(k(8), k(16));
  alto.ctx.lineTo(k(11), k(14));
  alto.ctx.stroke();
  registrar(scene, 'chinelo-alto', alto.canvas);

  const coruja = tela(k(18), k(18));
  coruja.ctx.fillStyle = '#1f8a4c';
  coruja.ctx.beginPath();
  coruja.ctx.ellipse(k(9), k(10), k(6), k(5.5), 0, 0, Math.PI * 2);
  coruja.ctx.fill();
  coruja.ctx.fillStyle = '#7ed957';
  coruja.ctx.beginPath();
  coruja.ctx.ellipse(k(9), k(11), k(3.2), k(3), 0, 0, Math.PI * 2);
  coruja.ctx.fill();
  coruja.ctx.fillStyle = '#f7fff4';
  coruja.ctx.beginPath();
  coruja.ctx.arc(k(6.5), k(8), k(2.1), 0, Math.PI * 2);
  coruja.ctx.arc(k(11.5), k(8), k(2.1), 0, Math.PI * 2);
  coruja.ctx.fill();
  coruja.ctx.fillStyle = '#163022';
  coruja.ctx.beginPath();
  coruja.ctx.arc(k(6.5), k(8), k(0.9), 0, Math.PI * 2);
  coruja.ctx.arc(k(11.5), k(8), k(0.9), 0, Math.PI * 2);
  coruja.ctx.fill();
  coruja.ctx.fillStyle = '#f2c14e';
  coruja.ctx.beginPath();
  coruja.ctx.moveTo(k(9), k(10.5));
  coruja.ctx.lineTo(k(10.2), k(12));
  coruja.ctx.lineTo(k(7.8), k(12));
  coruja.ctx.fill();
  registrar(scene, 'coruja', coruja.canvas);
}

export function gerarCenarios(scene: Phaser.Scene): void {
  const boletim = tela(k(40), k(52));
  boletim.ctx.fillStyle = '#6b4a2a';
  boletim.ctx.fillRect(k(17), k(18), k(4), k(34));
  rr(boletim.ctx, k(2), 0, k(36), k(30), k(2), '#f7f1de');
  boletim.ctx.fillStyle = '#2f6fed';
  boletim.ctx.fillRect(k(2), 0, k(36), k(7));
  texto(boletim.ctx, 'NOTA', k(20), k(3.5), k(4), '#ffffff');
  texto(boletim.ctx, '10', k(20), k(18), k(10), '#1aa37a');
  registrar(scene, 'portal-boletim', boletim.canvas);

  const arco = tela(k(44), k(52));
  arco.ctx.fillStyle = '#d7b15a';
  arco.ctx.fillRect(k(2), k(14), k(6), k(38));
  arco.ctx.fillRect(k(36), k(14), k(6), k(38));
  rr(arco.ctx, k(2), k(6), k(40), k(12), k(4), '#f0c43a');
  texto(arco.ctx, 'PIX', k(22), k(12), k(7), '#1a2744');
  registrar(scene, 'portal-arco', arco.canvas);

  const barra = tela(k(18), k(52));
  barra.ctx.fillStyle = '#f4f7fb';
  barra.ctx.fillRect(k(7), 0, k(4), k(52));
  barra.ctx.fillStyle = '#e23b32';
  barra.ctx.fillRect(0, k(12), k(18), k(6));
  barra.ctx.fillStyle = '#ffffff';
  barra.ctx.fillRect(0, k(18), k(18), k(6));
  registrar(scene, 'portal-barra', barra.canvas);

  const bandeira = tela(k(18), k(34));
  bandeira.ctx.fillStyle = '#6b4a2a';
  bandeira.ctx.fillRect(k(2), k(2), k(2), k(30));
  bandeira.ctx.fillStyle = '#3dbe6e';
  bandeira.ctx.beginPath();
  bandeira.ctx.moveTo(k(4), k(3));
  bandeira.ctx.lineTo(k(16), k(8));
  bandeira.ctx.lineTo(k(4), k(13));
  bandeira.ctx.fill();
  registrar(scene, 'bandeira', bandeira.canvas);

  const coracao = tela(k(14), k(12));
  coracao.ctx.fillStyle = '#e23b4a';
  coracao.ctx.beginPath();
  coracao.ctx.moveTo(k(7), k(11));
  coracao.ctx.bezierCurveTo(k(-2), k(6), k(2), k(0), k(7), k(3.5));
  coracao.ctx.bezierCurveTo(k(12), k(0), k(16), k(6), k(7), k(11));
  coracao.ctx.fill();
  registrar(scene, 'coracao', coracao.canvas);

  const aviao = tela(k(64), k(26));
  aviao.ctx.fillStyle = '#f7f7f7';
  rr(aviao.ctx, k(8), k(10), k(42), k(8), k(3), '#f7f7f7');
  aviao.ctx.beginPath();
  aviao.ctx.moveTo(k(44), k(10));
  aviao.ctx.lineTo(k(60), k(12));
  aviao.ctx.lineTo(k(44), k(18));
  aviao.ctx.fill();
  aviao.ctx.fillStyle = '#e8eef6';
  aviao.ctx.beginPath();
  aviao.ctx.moveTo(k(22), k(10));
  aviao.ctx.lineTo(k(40), k(2));
  aviao.ctx.lineTo(k(34), k(10));
  aviao.ctx.fill();
  aviao.ctx.fillStyle = '#c5ced6';
  aviao.ctx.beginPath();
  aviao.ctx.moveTo(k(24), k(18));
  aviao.ctx.lineTo(k(40), k(24));
  aviao.ctx.lineTo(k(30), k(18));
  aviao.ctx.fill();
  aviao.ctx.fillStyle = '#7eb6ff';
  for (const x of [k(14), k(22), k(30)]) {
    rr(aviao.ctx, x, k(12), k(5), k(3), k(0.6), '#7eb6ff');
  }
  aviao.ctx.fillStyle = '#e23b32';
  aviao.ctx.beginPath();
  aviao.ctx.moveTo(k(8), k(12));
  aviao.ctx.lineTo(k(2), k(14));
  aviao.ctx.lineTo(k(8), k(16));
  aviao.ctx.fill();
  registrar(scene, 'aviao', aviao.canvas);

  registrar(scene, 'vaca', animal(false));
  registrar(scene, 'boi', animal(true));

  const balao = tela(k(18), k(22));
  balao.ctx.fillStyle = '#e9fff6';
  balao.ctx.beginPath();
  balao.ctx.ellipse(k(9), k(8), k(6), k(6), 0, 0, Math.PI * 2);
  balao.ctx.fill();
  balao.ctx.strokeStyle = '#12805f';
  balao.ctx.lineWidth = k(1.4);
  balao.ctx.stroke();
  balao.ctx.beginPath();
  balao.ctx.moveTo(k(9), k(14));
  balao.ctx.lineTo(k(7), k(18));
  balao.ctx.lineTo(k(11), k(18));
  balao.ctx.fillStyle = '#12805f';
  balao.ctx.fill();
  registrar(scene, 'balao-item', balao.canvas);
}

function animal(boi: boolean): HTMLCanvasElement {
  const { canvas, ctx } = tela(k(36), k(22));
  ctx.fillStyle = boi ? '#6b3e22' : '#f7f4ee';
  ctx.beginPath();
  ctx.ellipse(k(18), k(12), k(12), k(6), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(k(28), k(9), k(5), k(4), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a120c';
  ctx.beginPath();
  ctx.arc(k(31), k(8), k(0.7), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = boi ? '#3a2a1c' : '#2a241c';
  ctx.lineWidth = k(1.6);
  ctx.beginPath();
  ctx.moveTo(k(10), k(16));
  ctx.lineTo(k(10), k(20));
  ctx.moveTo(k(16), k(17));
  ctx.lineTo(k(16), k(21));
  ctx.moveTo(k(22), k(16));
  ctx.lineTo(k(22), k(20));
  ctx.moveTo(k(27), k(15));
  ctx.lineTo(k(27), k(20));
  ctx.stroke();
  if (boi) {
    ctx.strokeStyle = '#e6d2b5';
    ctx.lineWidth = k(1.3);
    ctx.beginPath();
    ctx.moveTo(k(26), k(6));
    ctx.quadraticCurveTo(k(22), k(2), k(24), k(7));
    ctx.moveTo(k(32), k(6));
    ctx.quadraticCurveTo(k(36), k(2), k(33), k(7));
    ctx.stroke();
  }
  return canvas;
}

function ceu(ctx: CanvasRenderingContext2D, w: number, h: number, topo: string, base: string): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, topo);
  grad.addColorStop(1, base);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export function gerarFundos(scene: Phaser.Scene): void {
  const w = LARGURA;
  const h = ALTURA_VISAO;
  const caatinga = tela(w, h);
  ceu(caatinga.ctx, w, h, '#79c7ef', '#f6e2bf');
  caatinga.ctx.fillStyle = '#fff8';
  caatinga.ctx.beginPath();
  caatinga.ctx.arc(k(390), k(48), k(22), 0, Math.PI * 2);
  caatinga.ctx.fill();
  caatinga.ctx.fillStyle = '#fff';
  caatinga.ctx.beginPath();
  caatinga.ctx.arc(k(120), k(58), k(16), 0, Math.PI * 2);
  caatinga.ctx.arc(k(148), k(54), k(18), 0, Math.PI * 2);
  caatinga.ctx.arc(k(170), k(62), k(14), 0, Math.PI * 2);
  caatinga.ctx.fill();
  caatinga.ctx.fillStyle = '#d7b56a';
  caatinga.ctx.beginPath();
  caatinga.ctx.moveTo(0, k(175));
  for (let x = 0; x <= w; x += k(8)) {
    caatinga.ctx.lineTo(x, k(168) + Math.sin(x * 0.01) * k(12));
  }
  caatinga.ctx.lineTo(w, h);
  caatinga.ctx.lineTo(0, h);
  caatinga.ctx.fill();
  caatinga.ctx.fillStyle = '#6e8f45';
  for (let x = k(30); x < w; x += k(78)) {
    caatinga.ctx.fillRect(x, k(142), k(5), k(32));
    caatinga.ctx.beginPath();
    caatinga.ctx.ellipse(x + k(2), k(140), k(16), k(6), 0, 0, Math.PI * 2);
    caatinga.ctx.ellipse(x + k(8), k(150), k(12), k(4), 0.4, 0, Math.PI * 2);
    caatinga.ctx.fill();
  }
  registrar(scene, 'fundo-caatinga', caatinga.canvas);

  const casa = tela(w, h);
  ceu(casa.ctx, w, h, '#f4ebe3', '#e7d8c8');
  casa.ctx.fillStyle = '#f7f1ea';
  casa.ctx.fillRect(0, 0, w, h * 0.42);
  casa.ctx.fillStyle = '#e4d5c4';
  casa.ctx.fillRect(0, h * 0.42, w, h);
  casa.ctx.fillStyle = '#c9b39a';
  casa.ctx.fillRect(0, h * 0.42, w, k(3));
  rr(casa.ctx, k(48), k(22), k(92), k(52), k(3), '#fbf7f2');
  casa.ctx.strokeStyle = '#b9a48c';
  casa.ctx.lineWidth = k(2);
  casa.ctx.strokeRect(k(48), k(22), k(92), k(52));
  casa.ctx.fillStyle = '#d7ecf5';
  casa.ctx.fillRect(k(58), k(32), k(28), k(30));
  casa.ctx.fillRect(k(98), k(32), k(28), k(30));
  rr(casa.ctx, k(250), k(14), k(150), k(70), k(4), '#9c2434');
  casa.ctx.fillStyle = '#f3c2cb';
  for (let i = 0; i < 4; i += 1) {
    casa.ctx.beginPath();
    casa.ctx.ellipse(k(278 + i * 28), k(42), k(7), k(5), 0, 0, Math.PI * 2);
    casa.ctx.fill();
  }
  registrar(scene, 'fundo-casa', casa.canvas);

  const aero = tela(w, h);
  ceu(aero.ctx, w, h, '#8ec8f5', '#e7f2fb');
  aero.ctx.fillStyle = '#d5dee8';
  aero.ctx.fillRect(0, k(150), w, h);
  rr(aero.ctx, k(20), k(40), k(210), k(100), k(6), '#c5e4f8');
  rr(aero.ctx, k(250), k(28), k(200), k(112), k(6), '#d7ebf8');
  aero.ctx.fillStyle = '#f7f7f7';
  aero.ctx.fillRect(k(270), k(78), k(90), k(8));
  texto(aero.ctx, 'EMBARQUE', k(120), k(168), k(16), '#1a2744');
  registrar(scene, 'fundo-aero', aero.canvas);

  const noite = tela(w, ALTURA_VISAO + (320 - 270) * ESCALA);
  ceu(noite.ctx, noite.canvas.width, noite.canvas.height, '#0c1430', '#24345e');
  noite.ctx.fillStyle = '#fff';
  for (let i = 0; i < 70; i += 1) {
    const x = (i * 97) % w;
    const y = (i * 53) % k(180);
    noite.ctx.beginPath();
    noite.ctx.arc(x, y, i % 5 === 0 ? k(1.4) : k(0.7), 0, Math.PI * 2);
    noite.ctx.fill();
  }
  noite.ctx.fillStyle = '#121826';
  noite.ctx.fillRect(0, k(210), w, noite.canvas.height);
  noite.ctx.fillStyle = '#1c2740';
  noite.ctx.fillRect(k(40), k(170), k(18), k(50));
  noite.ctx.fillRect(k(70), k(150), k(26), k(70));
  noite.ctx.fillRect(k(360), k(160), k(34), k(60));
  registrar(scene, 'fundo-noite', noite.canvas);
}
