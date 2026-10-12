import { virtual } from './controles';

type Acao = 'esquerda' | 'direita' | 'baixo' | 'pulo' | 'invis';

export function eToque(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches;
}

export function marcarToque(): void {
  document.documentElement.classList.toggle('toque', eToque());
}

export function mostrarControles(visivel: boolean): void {
  document.documentElement.classList.toggle('jogando', visivel);
  if (visivel) return;
  virtual.esquerda = false;
  virtual.direita = false;
  virtual.baixo = false;
  virtual.pulo = false;
  virtual.invis = false;
}

export function cargaInvis(valor: number): void {
  const botao = document.querySelector<HTMLElement>('#controles [data-acao="invis"]');
  botao?.style.setProperty('--carga', String(Math.max(0, Math.min(1, valor))));
}

export function ligarControles(): void {
  const raiz = document.getElementById('controles');
  if (!raiz) return;
  marcarToque();
  raiz.querySelectorAll<HTMLButtonElement>('button[data-acao]').forEach((botao) => {
    const acao = botao.dataset.acao as Acao;
    const segurar = (ativo: boolean): void => {
      if (acao === 'esquerda') virtual.esquerda = ativo;
      if (acao === 'direita') virtual.direita = ativo;
      if (acao === 'baixo') virtual.baixo = ativo;
      if (acao === 'pulo') virtual.pulo = ativo;
      if (acao === 'invis') virtual.invis = ativo;
      botao.classList.toggle('preso', ativo);
    };
    botao.addEventListener('pointerdown', (evento) => {
      evento.preventDefault();
      botao.setPointerCapture(evento.pointerId);
      segurar(true);
      if (acao === 'pulo') virtual.puloBorda = true;
      if (acao === 'invis') virtual.invisBorda = true;
    });
    const soltar = (): void => segurar(false);
    botao.addEventListener('pointerup', soltar);
    botao.addEventListener('pointercancel', soltar);
    botao.addEventListener('contextmenu', (evento) => evento.preventDefault());
  });
}
