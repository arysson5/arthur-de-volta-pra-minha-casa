import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const corpo = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo), 0);
  return Buffer.concat([len, corpo, crc]);
}

function png(w, h, pixels) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y += 1) {
    const row = y * (w * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const o = row + 1 + x * 4;
      raw[o] = pixels[i];
      raw[o + 1] = pixels[i + 1];
      raw[o + 2] = pixels[i + 2];
      raw[o + 3] = pixels[i + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const rosto = [
  '................',
  '....kkkkkkk.....',
  '...kkkkkkkkk....',
  '...ksskssksk....',
  '...keppkeppk....',
  '...ksskssksk....',
  '...kkkmmmkkk....',
  '....kkkkkkk.....',
  '...syyyyyyys....',
  '..yjyyyyyyyy....',
  '..yyyyyyyyyy....',
  '...yyyyyyyy.....',
  '................',
  '................',
  '................',
  '................',
];

const paleta = {
  '.': [0, 0, 0, 0],
  k: [26, 18, 12, 255],
  s: [198, 134, 66, 255],
  e: [247, 243, 234, 255],
  p: [26, 18, 12, 255],
  m: [141, 58, 72, 255],
  y: [240, 196, 58, 255],
  j: [27, 27, 27, 255],
};

function icone(tamanho) {
  const pixels = new Uint8Array(tamanho * tamanho * 4);
  const fundo = [14, 21, 32, 255];
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = fundo[0];
    pixels[i + 1] = fundo[1];
    pixels[i + 2] = fundo[2];
    pixels[i + 3] = fundo[3];
  }
  const escala = Math.floor(tamanho / 20);
  const ox = Math.floor((tamanho - 16 * escala) / 2);
  const oy = Math.floor((tamanho - 16 * escala) / 2);
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const cor = paleta[rosto[y][x]] ?? fundo;
      for (let dy = 0; dy < escala; dy += 1) {
        for (let dx = 0; dx < escala; dx += 1) {
          const px = ox + x * escala + dx;
          const py = oy + y * escala + dy;
          if (px < 0 || py < 0 || px >= tamanho || py >= tamanho) continue;
          const i = (py * tamanho + px) * 4;
          pixels[i] = cor[0];
          pixels[i + 1] = cor[1];
          pixels[i + 2] = cor[2];
          pixels[i + 3] = cor[3];
        }
      }
    }
  }
  return png(tamanho, tamanho, pixels);
}

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/icone-192.png', icone(192));
fs.writeFileSync('public/icone-512.png', icone(512));
console.log('icones prontos');
