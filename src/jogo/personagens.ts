import { TILE } from './constantes';

const POSES = ['arthur-parado-0', 'arthur-corre-0', 'arthur-pulo-0', 'arthur-agacha-0'] as const;

export function encaixar(sprite: Phaser.GameObjects.Sprite, altura: number): void {
  const base = sprite.height || 1;
  sprite.setScale(altura / base);
}

export function montarPersonagens(scene: Phaser.Scene): void {
  if (scene.textures.exists('folha-arthur')) {
    const fatias = fatiar(scene.textures.get('folha-arthur').getSourceImage() as CanvasImageSource);
    fatias.forEach((canvas, i) => {
      const chave = POSES[i] ?? `arthur-extra-${i}`;
      publicar(scene, chave, canvas);
    });
    if (fatias.length > 0 && fatias.length < POSES.length) {
      for (let i = fatias.length; i < POSES.length; i += 1) {
        publicar(scene, POSES[i], fatias[0]);
      }
    }
  }

  publicarFolha(scene, 'folha-mae', 'mae');
  publicarFolha(scene, 'folha-bob', 'bob');
  criarAnimacoes(scene);
}

function publicarFolha(scene: Phaser.Scene, origem: string, destino: string): void {
  if (!scene.textures.exists(origem)) return;
  const imagem = scene.textures.get(origem).getSourceImage() as CanvasImageSource;
  const largura = larguraDe(imagem);
  const altura = alturaDe(imagem);
  const recorte = aparar(recortarVerde(imagem, largura, altura));
  if (recorte) publicar(scene, destino, recorte);
}

function criarAnimacoes(scene: Phaser.Scene): void {
  if (!scene.textures.exists('arthur-parado-0')) return;
  const definir = (key: string, frames: { key: string }[], frameRate: number): void => {
    if (scene.anims.exists(key)) scene.anims.remove(key);
    scene.anims.create({ key, frames, frameRate, repeat: key === 'arthur-pulo' || key === 'arthur-agacha' ? 0 : -1 });
  };
  definir('arthur-parado', [{ key: 'arthur-parado-0' }], 1);
  definir('arthur-corre', [{ key: scene.textures.exists('arthur-corre-0') ? 'arthur-corre-0' : 'arthur-parado-0' }], 8);
  definir('arthur-pulo', [{ key: scene.textures.exists('arthur-pulo-0') ? 'arthur-pulo-0' : 'arthur-parado-0' }], 1);
  definir('arthur-agacha', [{ key: scene.textures.exists('arthur-agacha-0') ? 'arthur-agacha-0' : 'arthur-parado-0' }], 1);
}

function fatiar(imagem: CanvasImageSource): HTMLCanvasElement[] {
  const largura = larguraDe(imagem);
  const altura = alturaDe(imagem);
  const limpo = recortarVerde(imagem, largura, altura);
  const faixas = colunas(limpo).filter((faixa) => faixa[1] - faixa[0] > 12);
  const pedacos = faixas.map(([a, b]) => aparar(recorte(limpo, a, 0, b - a, limpo.height))).filter((p): p is HTMLCanvasElement => !!p);
  if (pedacos.length === 0) {
    const unico = aparar(limpo);
    return unico ? [unico] : [];
  }
  return normalizar(pedacos);
}

function normalizar(pedacos: HTMLCanvasElement[]): HTMLCanvasElement[] {
  const largura = Math.max(...pedacos.map((p) => p.width));
  const altura = Math.max(...pedacos.map((p) => p.height));
  return pedacos.map((pedaco) => {
    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext('2d');
    if (!ctx) return pedaco;
    ctx.drawImage(pedaco, Math.round((largura - pedaco.width) / 2), altura - pedaco.height);
    return canvas;
  });
}

function colunas(canvas: HTMLCanvasElement): [number, number][] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const faixas: [number, number][] = [];
  let inicio = -1;
  for (let x = 0; x < canvas.width; x += 1) {
    let tem = false;
    for (let y = 0; y < canvas.height; y += 3) {
      if (data[(y * canvas.width + x) * 4 + 3] > 28) {
        tem = true;
        break;
      }
    }
    if (tem && inicio < 0) inicio = x;
    if (!tem && inicio >= 0) {
      faixas.push([inicio, x]);
      inicio = -1;
    }
  }
  if (inicio >= 0) faixas.push([inicio, canvas.width]);
  return faixas;
}

function recortarVerde(imagem: CanvasImageSource, largura: number, altura: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;
  ctx.drawImage(imagem, 0, 0, largura, altura);
  const quadro = ctx.getImageData(0, 0, largura, altura);
  const d = quadro.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const maxRB = Math.max(r, b);
    const verde = g - maxRB;
    if (verde > 16 && g > 55) {
      const fora = Math.min(1, (verde - 16) / 64);
      d[i + 3] = Math.round(d[i + 3] * (1 - fora));
      d[i + 1] = Math.min(g, maxRB + 6);
    }
  }
  ctx.putImageData(quadro, 0, 0);
  return canvas;
}

function aparar(canvas: HTMLCanvasElement): HTMLCanvasElement | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (data[(y * canvas.width + x) * 4 + 3] < 20) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) return null;
  const margem = 2;
  const x = Math.max(0, minX - margem);
  const y = Math.max(0, minY - margem);
  const w = Math.min(canvas.width - x, maxX - minX + 1 + margem * 2);
  const h = Math.min(canvas.height - y, maxY - minY + 1 + margem * 2);
  return recorte(canvas, x, y, w, h);
}

function recorte(canvas: HTMLCanvasElement, x: number, y: number, w: number, h: number): HTMLCanvasElement {
  const saida = document.createElement('canvas');
  saida.width = Math.max(1, w);
  saida.height = Math.max(1, h);
  saida.getContext('2d')?.drawImage(canvas, x, y, w, h, 0, 0, w, h);
  return saida;
}

function publicar(scene: Phaser.Scene, chave: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(chave)) scene.textures.remove(chave);
  scene.textures.addCanvas(chave, canvas)?.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

function larguraDe(imagem: CanvasImageSource): number {
  if (imagem instanceof HTMLImageElement) return imagem.naturalWidth || imagem.width;
  if (imagem instanceof HTMLCanvasElement) return imagem.width;
  if (imagem instanceof ImageBitmap) return imagem.width;
  return TILE;
}

function alturaDe(imagem: CanvasImageSource): number {
  if (imagem instanceof HTMLImageElement) return imagem.naturalHeight || imagem.height;
  if (imagem instanceof HTMLCanvasElement) return imagem.height;
  if (imagem instanceof ImageBitmap) return imagem.height;
  return TILE;
}
