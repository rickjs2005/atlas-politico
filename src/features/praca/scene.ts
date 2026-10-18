// A cena 3D da Praça do Mural (docs/PRACA.md, D-153 e D-155): uma praça
// brasileira compacta ao anoitecer, com coreto, calçada de pedra portuguesa,
// uma padaria, uma banca de jornal, um sobrado que é o arquivo e a Câmara ao
// fundo, com postes acesos. Aproveita o motor da Cidade do Voto
// (src/features/world/scene.ts): o mesmo laço, a mesma entrada por teclado e
// joystick, a mesma colisão e a mesma câmera que segue. Muda o que está em
// volta: cada lugar tem uma função, e quem é interativo tem placa e tapete; o
// cenário de fundo não tem.
//
// Arte: uma maquete de papel na hora azul. Formas simples, sombreamento
// chapado, cores de fachada colonial (ocre, azul-claro, rosa-antigo, pêssego)
// sob a luz fria do fim de tarde e a luz quente dos postes, e nada baixado
// além deste código. Nenhum prédio, placa ou pessoa usa cor de partido, e não
// há figura de nenhuma das pessoas retratadas: a praça é ficção.
//
// A cena fala com a interface por eventos tipados (`PracaEvento`), só quando
// algo muda: chegar perto de um lugar, ou se afastar. A posição do personagem
// vai para um atributo do canvas, para o diagnóstico e os testes; nada de
// estado React a cada quadro.
//
// A cena muda com o jogo: o bilhete some do chão quando é guardado, as notas
// aparecem no mural quando uma pauta é publicada, a corrente da Câmara cai
// quando as pautas da primeira sessão estão no mural (e a Lourdes aparece na
// escadaria), e a ata vai para o quadro de avisos da Câmara quando é lavrada.
//
// Modo leve (manual ou por ponteiro grosseiro e poucos núcleos): sem sombras,
// sem antialias, pixel ratio 1, sem as luzes dos postes e menos árvores.

import * as THREE from "three";

import type { LugarId } from "@/lib/praca/tipos";
import { seededRandom } from "@/lib/world/blind";

import { COR_CEU } from "./cores";

export type PontoId = LugarId | "bilhete";

/** O que a cena avisa à interface. Nunca a cada quadro: só quando muda. */
export type PracaEvento = { tipo: "perto"; id: PontoId | null };

export interface PracaCallbacks {
  onEvento: (evento: PracaEvento) => void;
}

export interface PracaOptions {
  reduzirMovimento: boolean;
  /** Pedido pela pessoa, ou decidido pelo aparelho: menos custo de desenho. */
  modoLeve: boolean;
  posicaoInicial?: { x: number; z: number };
  /** Quantas notas já estão fixadas no mural (até oito). */
  publicadas: number;
  camaraAberta: boolean;
  /** A ata da sessão está no quadro de avisos da Câmara. */
  ataLavrada: boolean;
  bilheteNoChao: boolean;
}

export interface PracaHandle {
  setStick: (x: number, y: number) => void;
  setPaused: (pausado: boolean) => void;
  getPosition: () => { x: number; z: number };
  setMural: (publicadas: number) => void;
  setCamaraAberta: (aberta: boolean) => void;
  setAta: (lavrada: boolean) => void;
  setBilhete: (noChao: boolean) => void;
  dispose: () => void;
}

/** Quantas notas o mural comporta: as pautas das duas sessões. */
export const NOTAS_NO_MURAL = 8;

/** Decide o modo leve pelo aparelho, quando a pessoa não escolheu. */
export function aparelhoFraco(): boolean {
  return window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
}

/** Onde cada interação acontece, no plano do chão, e a que distância ela acende. */
const PONTOS: Record<PontoId, { x: number; z: number; raio: number }> = {
  mural: { x: -9, z: -7.6, raio: 2.6 },
  banca: { x: 9, z: -7.6, raio: 2.6 },
  camara: { x: 0, z: -9.6, raio: 2.6 },
  padaria: { x: -11.2, z: 0, raio: 2.6 },
  arquivo: { x: 11.2, z: 0, raio: 2.6 },
  bilhete: { x: 3, z: 3, raio: 1.6 },
};

const LIMITE = { x: 13.2, z: 10.6 };
const VELOCIDADE = 6;
const RAIO_PERSONAGEM = 0.45;

const toon = (color: string) => new THREE.MeshToonMaterial({ color });
const fosco = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.95 });

/** Uma placa de texto, desenhada em canvas: só os lugares interativos têm uma. */
function makeLabel(texto: string, cor: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const escala = 2;
  canvas.width = 512 * escala;
  canvas.height = 112 * escala;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(escala, escala);
  ctx.fillStyle = "rgba(255,252,245,0.97)";
  ctx.strokeStyle = cor;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 96, 24);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2a2622";
  ctx.font = "600 46px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, 256, 58, 460);
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  // Tamanho fixo na tela, e não no mundo: a placa não cresce quando o lugar fica perto da câmera.
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: textura, depthTest: false, sizeAttenuation: false }));
  sprite.scale.set(0.19, 0.042, 1);
  sprite.renderOrder = 10;
  return sprite;
}

/** A calçada de pedra portuguesa: ondas pretas sobre pedra clara, como na orla. Textura repetida, desenhada em canvas. */
function makePavimento(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ece5d4";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#3a3634";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  for (let faixa = 0; faixa < 2; faixa += 1) {
    ctx.beginPath();
    for (let x = -8; x <= 264; x += 8) {
      const y = 64 + faixa * 128 + Math.sin((x / 256) * Math.PI * 2) * 26;
      if (x === -8) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = THREE.RepeatWrapping;
  textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(7, 5.5);
  return textura;
}

/** O toldo listrado da padaria. */
function makeToldo(cores: [string, string]): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  for (let i = 0; i < 8; i += 1) {
    ctx.fillStyle = cores[i % 2]!;
    ctx.fillRect(i * 16, 0, 16, 32);
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = THREE.RepeatWrapping;
  textura.repeat.set(3, 1);
  return textura;
}

interface FachadaSpec {
  largura: number;
  altura: number;
  fundo: number;
  cor: string;
  corMoldura: string;
  andares: number;
  porta: { largura: number; altura: number };
  /** O coroamento reto das casas coloniais, acima do telhado. */
  platibanda: boolean;
}

/**
 * Uma fachada colonial: corpo, moldura das janelas, porta e platibanda, com a
 * frente no lado +z local. Quem chama posiciona e gira o grupo. Devolve a
 * porta, para a corrente e para a luz.
 */
function makeFachada(spec: FachadaSpec): {
  grupo: THREE.Group;
  porta: THREE.Mesh;
} {
  const grupo = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(spec.largura, spec.altura, spec.fundo), toon(spec.cor));
  corpo.position.y = spec.altura / 2;
  corpo.castShadow = true;
  corpo.receiveShadow = true;
  grupo.add(corpo);
  const frente = spec.fundo / 2;
  if (spec.platibanda) {
    const coroa = new THREE.Mesh(new THREE.BoxGeometry(spec.largura + 0.3, 0.5, spec.fundo + 0.3), toon(spec.corMoldura));
    coroa.position.y = spec.altura + 0.2;
    grupo.add(coroa);
  } else {
    const telhado = new THREE.Mesh(new THREE.ConeGeometry(spec.largura * 0.72, 1.1, 4), toon("#b86b4e"));
    telhado.rotation.y = Math.PI / 4;
    telhado.scale.z = spec.fundo / spec.largura;
    telhado.position.y = spec.altura + 0.55;
    grupo.add(telhado);
  }
  const moldura = toon(spec.corMoldura);
  const vidro = new THREE.MeshToonMaterial({
    color: "#f6efdc",
    emissive: "#f1e6c6",
    emissiveIntensity: 0.3,
  });
  const colunas = Math.max(2, Math.floor(spec.largura / 2));
  for (let andar = 0; andar < spec.andares; andar += 1) {
    for (let c = 0; c < colunas; c += 1) {
      const x = -spec.largura / 2 + (spec.largura / colunas) * (c + 0.5);
      if (andar === 0 && Math.abs(x) < spec.porta.largura) continue;
      const y = 1.5 + andar * (spec.altura / spec.andares);
      const quadro = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.1), moldura);
      quadro.position.set(x, y, frente + 0.03);
      grupo.add(quadro);
      const janela = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.06, 0.08), vidro);
      janela.position.set(x, y, frente + 0.07);
      grupo.add(janela);
    }
  }
  const batente = new THREE.Mesh(new THREE.BoxGeometry(spec.porta.largura + 0.3, spec.porta.altura + 0.15, 0.1), moldura);
  batente.position.set(0, spec.porta.altura / 2 + 0.07, frente + 0.03);
  grupo.add(batente);
  const porta = new THREE.Mesh(new THREE.BoxGeometry(spec.porta.largura, spec.porta.altura, 0.1), toon("#4a3b31"));
  porta.position.set(0, spec.porta.altura / 2, frente + 0.07);
  grupo.add(porta);
  return { grupo, porta };
}

/** O tapete de chão de um lugar interativo: é onde a ação acende. */
function makeTapete(cor: string, raio: number): THREE.Mesh {
  const tapete = new THREE.Mesh(
    new THREE.CircleGeometry(raio, 28),
    new THREE.MeshBasicMaterial({
      color: cor,
      transparent: true,
      opacity: 0.35,
    }),
  );
  tapete.rotation.x = -Math.PI / 2;
  tapete.position.y = 0.025;
  return tapete;
}

interface Pessoa {
  grupo: THREE.Group;
  pernas: THREE.Mesh[];
}

/** Uma pessoa feita de cápsulas, sem rosto de ninguém. Cada morador tem a sua roupa e o seu adereço. */
function makePessoa(roupa: string, calca: string, pele: string, cabelo: string): Pessoa {
  const grupo = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 4, 12), toon(roupa));
  corpo.position.y = 1.05;
  corpo.castShadow = true;
  grupo.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), toon(pele));
  cabeca.position.y = 1.75;
  cabeca.castShadow = true;
  grupo.add(cabeca);
  const topo = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon(cabelo));
  topo.position.y = 1.78;
  grupo.add(topo);
  const pernas = [-0.14, 0.14].map((x) => {
    const perna = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.45, 4, 8), toon(calca));
    perna.position.set(x, 0.38, 0);
    perna.castShadow = true;
    grupo.add(perna);
    return perna;
  });
  return { grupo, pernas };
}

/** Quem joga: repórter da rádio, com fone no pescoço e gravador na mão. Diferente de todo morador. */
function makeReporter(): Pessoa {
  const pessoa = makePessoa("#2f6f73", "#3a3a44", "#c98c63", "#2b1d16");
  const fone = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 20), toon("#f2b63c"));
  fone.position.y = 1.42;
  fone.rotation.x = Math.PI / 2;
  pessoa.grupo.add(fone);
  const gravador = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.1), toon("#f2b63c"));
  gravador.position.set(0.42, 1.05, 0.18);
  pessoa.grupo.add(gravador);
  const mochila = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.22), toon("#e07a3f"));
  mochila.position.set(0, 1.1, -0.32);
  pessoa.grupo.add(mochila);
  return pessoa;
}

function makeZefa(): Pessoa {
  const pessoa = makePessoa("#c66b8a", "#5a4a5e", "#8d5a3c", "#1f1512");
  const avental = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.06), toon("#fbf6ea"));
  avental.position.set(0, 0.95, 0.3);
  pessoa.grupo.add(avental);
  const lenco = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), toon("#f2d16b"));
  lenco.position.y = 1.78;
  pessoa.grupo.add(lenco);
  return pessoa;
}

function makeTeodoro(): Pessoa {
  const pessoa = makePessoa("#6b7f52", "#4a4440", "#d9a77c", "#8a8178");
  const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.12, 16), toon("#3d5a80"));
  bone.position.y = 1.96;
  pessoa.grupo.add(bone);
  const aba = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.26), toon("#3d5a80"));
  aba.position.set(0, 1.9, 0.3);
  pessoa.grupo.add(aba);
  const jornal = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.04), toon("#f4efe2"));
  jornal.position.set(0.4, 1.1, 0.2);
  jornal.rotation.z = 0.3;
  pessoa.grupo.add(jornal);
  return pessoa;
}

function makeEscrivao(): Pessoa {
  const pessoa = makePessoa("#3d3a4a", "#2a2733", "#b98a6a", "#4a4a4a");
  const chapeu = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.22, 16), toon("#2a2622"));
  chapeu.position.y = 2.02;
  pessoa.grupo.add(chapeu);
  const abaChapeu = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 16), toon("#2a2622"));
  abaChapeu.position.y = 1.92;
  pessoa.grupo.add(abaChapeu);
  for (const x of [-0.11, 0.11]) {
    const lente = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 14), toon("#2a2622"));
    lente.position.set(x, 1.77, 0.26);
    pessoa.grupo.add(lente);
  }
  const pasta = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.08), toon("#8a5a3b"));
  pasta.position.set(-0.42, 0.95, 0.1);
  pessoa.grupo.add(pasta);
  return pessoa;
}

/** A Lourdes, secretária da Câmara: blazer creme, coque, crachá no pescoço e a pasta da ata debaixo do braço. */
function makeLourdes(): Pessoa {
  const pessoa = makePessoa("#e8d9b5", "#5a4a5e", "#a9754f", "#3b2a22");
  const coque = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), toon("#3b2a22"));
  coque.position.set(0, 1.98, -0.16);
  pessoa.grupo.add(coque);
  const cracha = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.03), toon("#2f6f73"));
  cracha.position.set(0.1, 1.2, 0.33);
  pessoa.grupo.add(cracha);
  const pasta = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.34), toon("#8a3b3b"));
  pasta.position.set(-0.4, 1.0, 0.05);
  pessoa.grupo.add(pasta);
  return pessoa;
}

/** O coreto: oito colunas, balaustrada e telhado de telha. Fica no centro, e o personagem contorna. */
function makeCoreto(cena: THREE.Scene): THREE.Group {
  const grupo = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.6, 0.5, 8), toon("#e6dcc6"));
  base.position.y = 0.25;
  base.receiveShadow = true;
  grupo.add(base);
  const degrau = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.8), toon("#d9cfb8"));
  degrau.position.set(0, 0.12, 2.75);
  grupo.add(degrau);
  for (let i = 0; i < 8; i += 1) {
    const ang = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.6, 8), toon("#fbf6ea"));
    coluna.position.set(Math.sin(ang) * 2.05, 1.8, Math.cos(ang) * 2.05);
    coluna.castShadow = true;
    grupo.add(coluna);
  }
  const balaustrada = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.05, 6, 32), toon("#fbf6ea"));
  balaustrada.rotation.x = Math.PI / 2;
  balaustrada.position.y = 1.05;
  grupo.add(balaustrada);
  const telhado = new THREE.Mesh(new THREE.ConeGeometry(3, 1.5, 8), toon("#c4795b"));
  telhado.position.y = 3.8;
  telhado.castShadow = true;
  grupo.add(telhado);
  const beiral = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.05, 0.14, 8), toon("#fbf6ea"));
  beiral.position.y = 3.12;
  grupo.add(beiral);
  cena.add(grupo);
  return grupo;
}

function makeBanco(cena: THREE.Scene, x: number, z: number, giro: number): THREE.Box2 {
  const grupo = new THREE.Group();
  const assento = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.5), toon("#8a6a4b"));
  assento.position.y = 0.5;
  assento.castShadow = true;
  grupo.add(assento);
  const encosto = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.45, 0.08), toon("#8a6a4b"));
  encosto.position.set(0, 0.8, -0.22);
  grupo.add(encosto);
  for (const dx of [-0.7, 0.7]) {
    const pe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.45), toon("#4a4440"));
    pe.position.set(dx, 0.25, 0);
    grupo.add(pe);
  }
  grupo.position.set(x, 0, z);
  grupo.rotation.y = giro;
  cena.add(grupo);
  const meia = giro === 0 || Math.abs(giro) === Math.PI ? { x: 0.9, z: 0.3 } : { x: 0.3, z: 0.9 };
  return new THREE.Box2(new THREE.Vector2(x - meia.x, z - meia.z), new THREE.Vector2(x + meia.x, z + meia.z));
}

/** Um poste aceso: o globo brilha sempre; a luz que ele joga no chão só fora do modo leve. */
function makePoste(cena: THREE.Scene, x: number, z: number, comLuz: boolean): THREE.Box2 {
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 8), toon("#3a3634"));
  poste.position.set(x, 1.8, z);
  cena.add(poste);
  const globo = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    new THREE.MeshToonMaterial({
      color: "#fff6d8",
      emissive: "#ffd87a",
      emissiveIntensity: 1.1,
    }),
  );
  globo.position.set(x, 3.7, z);
  cena.add(globo);
  if (comLuz) {
    const luz = new THREE.PointLight("#ffd58a", 14, 16, 2);
    luz.position.set(x, 3.5, z);
    cena.add(luz);
  }
  return new THREE.Box2(new THREE.Vector2(x - 0.2, z - 0.2), new THREE.Vector2(x + 0.2, z + 0.2));
}

/** Ipês e árvores comuns em volta da praça, fora de onde se anda. */
function makeArvores(cena: THREE.Scene, sorteio: () => number, quantidade: number) {
  const troncoGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.4, 6);
  const copaGeo = new THREE.SphereGeometry(1.1, 9, 7);
  const tronco = new THREE.InstancedMesh(troncoGeo, toon("#6e4f3a"), quantidade);
  const copas = [
    new THREE.InstancedMesh(copaGeo, toon("#7f9a6a"), quantidade),
    new THREE.InstancedMesh(copaGeo, toon("#e9c349"), quantidade),
    new THREE.InstancedMesh(copaGeo, toon("#b08ad6"), quantidade),
  ];
  const m = new THREE.Matrix4();
  const contagem = [0, 0, 0];
  let n = 0;
  for (let tentativa = 0; tentativa < 400 && n < quantidade; tentativa += 1) {
    const x = (sorteio() - 0.5) * 70;
    const z = (sorteio() - 0.5) * 56;
    // Fora da praça e da rua, e fora do quarteirão da Câmara.
    if (Math.abs(x) < 18 && Math.abs(z) < 15) continue;
    if (Math.abs(x) < 8 && z < -14 && z > -24) continue;
    const s = 0.8 + sorteio() * 0.6;
    m.compose(new THREE.Vector3(x, 0.7 * s, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    tronco.setMatrixAt(n, m);
    const tipo = sorteio() < 0.55 ? 0 : sorteio() < 0.5 ? 1 : 2;
    m.compose(new THREE.Vector3(x, 2.0 * s, z), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.9, s));
    copas[tipo]!.setMatrixAt(contagem[tipo]!, m);
    contagem[tipo] = (contagem[tipo] ?? 0) + 1;
    n += 1;
  }
  tronco.count = n;
  copas.forEach((copa, i) => {
    copa.count = contagem[i]!;
    copa.castShadow = true;
  });
  cena.add(tronco, ...copas);
}

/** Casario de fundo, atrás da rua: só cenário, sem porta nem placa. */
function makeCasario(cena: THREE.Scene, sorteio: () => number) {
  const cores = ["#f2c99a", "#9fb7c9", "#e8b4b8", "#d9c97a", "#b9d3c1", "#f0dfc2", "#c9a6d6"];
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const fileiras: { z: number; de: number; ate: number; giro: number }[] = [
    { z: -20, de: -30, ate: 30, giro: 0 },
    { z: 19, de: -30, ate: 30, giro: Math.PI },
  ];
  for (const fileira of fileiras) {
    for (let x = fileira.de; x <= fileira.ate; x += 4.6) {
      if (fileira.z < 0 && Math.abs(x) < 7.5) continue;
      const largura = 3.6 + sorteio() * 0.8;
      const altura = 3.2 + sorteio() * 2.4;
      const casa = new THREE.Mesh(geo, toon(cores[Math.floor(sorteio() * cores.length)]!));
      casa.scale.set(largura, altura, 4);
      casa.position.set(x, altura / 2, fileira.z);
      cena.add(casa);
      const coroa = new THREE.Mesh(geo, toon("#fbf6ea"));
      coroa.scale.set(largura + 0.3, 0.4, 4.3);
      coroa.position.set(x, altura + 0.2, fileira.z);
      cena.add(coroa);
    }
  }
  for (const x of [-21, 21]) {
    for (let z = -12; z <= 12; z += 5) {
      const altura = 3 + sorteio() * 2;
      const casa = new THREE.Mesh(geo, toon(cores[Math.floor(sorteio() * cores.length)]!));
      casa.scale.set(4, altura, 4);
      casa.position.set(x, altura / 2, z);
      cena.add(casa);
    }
  }
}

/** Monta a praça no canvas e começa o laço. Devolve os controles e a limpeza. */
export function createPraca(canvas: HTMLCanvasElement, callbacks: PracaCallbacks, opcoes: PracaOptions): PracaHandle {
  const fraco = opcoes.modoLeve;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !fraco,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, fraco ? 1 : 2));
  renderer.shadowMap.enabled = !fraco;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color(COR_CEU);
  cena.fog = new THREE.Fog(COR_CEU, 30, 60);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);

  // A hora azul: céu frio por cima, chão escuro, e uma "lua" que ainda desenha sombras; os postes trazem o quente.
  cena.add(new THREE.HemisphereLight("#9fb6d4", "#2f3a33", 1.15));
  const sol = new THREE.DirectionalLight("#cfdcf0", 1.05);
  sol.position.set(10, 20, 12);
  sol.castShadow = !fraco;
  sol.shadow.mapSize.set(1024, 1024);
  sol.shadow.camera.left = -24;
  sol.shadow.camera.right = 24;
  sol.shadow.camera.top = 24;
  sol.shadow.camera.bottom = -24;
  cena.add(sol, sol.target);

  // O chão: grama ao longe, a rua em volta, a calçada de pedra portuguesa na praça e canteiros nos cantos.
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), fosco("#6f8468"));
  grama.rotation.x = -Math.PI / 2;
  grama.receiveShadow = true;
  cena.add(grama);
  const rua = new THREE.Mesh(new THREE.PlaneGeometry(38, 32), fosco("#5f615c"));
  rua.rotation.x = -Math.PI / 2;
  rua.position.y = 0.005;
  rua.receiveShadow = true;
  cena.add(rua);
  const pavimento = makePavimento();
  const praca = new THREE.Mesh(new THREE.PlaneGeometry(28, 22.4), new THREE.MeshStandardMaterial({ map: pavimento, roughness: 0.95 }));
  praca.rotation.x = -Math.PI / 2;
  praca.position.y = 0.012;
  praca.receiveShadow = true;
  cena.add(praca);
  for (const [cx, cz] of [
    [-10.5, 7.5],
    [10.5, 7.5],
  ]) {
    const canteiro = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20), fosco("#9fb37a"));
    canteiro.rotation.x = -Math.PI / 2;
    canteiro.position.set(cx!, 0.02, cz!);
    cena.add(canteiro);
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.6, 6), toon("#6e4f3a"));
    tronco.position.set(cx!, 0.8, cz!);
    cena.add(tronco);
    const copa = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8), toon(cx! < 0 ? "#e9c349" : "#b08ad6"));
    copa.position.set(cx!, 2.6, cz!);
    copa.castShadow = true;
    cena.add(copa);
  }

  const obstaculos: THREE.Box2[] = [];
  const circulos: { c: THREE.Vector2; r: number }[] = [
    { c: new THREE.Vector2(0, 0), r: 2.85 },
    { c: new THREE.Vector2(-10.5, 7.5), r: 0.5 },
    { c: new THREE.Vector2(10.5, 7.5), r: 0.5 },
  ];
  makeCoreto(cena);
  obstaculos.push(makeBanco(cena, -5, 5.2, 0), makeBanco(cena, 5, 5.2, 0), makeBanco(cena, -5, -3.6, Math.PI), makeBanco(cena, 5, -3.6, Math.PI));
  obstaculos.push(makePoste(cena, -12.4, 8.6, !fraco), makePoste(cena, 12.4, 8.6, !fraco), makePoste(cena, -12.4, -8.6, !fraco), makePoste(cena, 12.4, -8.6, !fraco));
  // Um poste a mais junto do mural: é o primeiro lugar da viagem, e fica iluminado de propósito.
  obstaculos.push(makePoste(cena, -6.2, -8.4, !fraco));

  // A Câmara, ao fundo: colunas, frontão, escadaria e a corrente na porta.
  const camaraCor = "#f3ead7";
  const camara = makeFachada({
    largura: 10,
    altura: 6,
    fundo: 5,
    cor: camaraCor,
    corMoldura: "#d8ccb0",
    andares: 2,
    porta: { largura: 1.8, altura: 3.2 },
    platibanda: true,
  });
  camara.grupo.position.set(0, 0, -14.6);
  for (const x of [-3.6, -1.8, 1.8, 3.6]) {
    const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 6, 10), toon("#fbf6ea"));
    coluna.position.set(x, 3, 3.2);
    coluna.castShadow = true;
    camara.grupo.add(coluna);
  }
  const frontao = new THREE.Shape([new THREE.Vector2(-5.4, 0), new THREE.Vector2(5.4, 0), new THREE.Vector2(0, 1.6)]);
  const triangulo = new THREE.Mesh(new THREE.ExtrudeGeometry(frontao, { depth: 0.5, bevelEnabled: false }), toon("#fbf6ea"));
  triangulo.position.set(0, 6.2, 3.1);
  camara.grupo.add(triangulo);
  for (let i = 0; i < 3; i += 1) {
    const degrau = new THREE.Mesh(new THREE.BoxGeometry(7 - i * 0.6, 0.22, 1.2 - i * 0.3), toon("#d9cfb8"));
    degrau.position.set(0, 0.11 + i * 0.22, 3.9 - i * 0.4);
    camara.grupo.add(degrau);
  }
  const corrente = new THREE.Group();
  for (const giro of [0.6, -0.6]) {
    const elo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.1), toon("#5f5a55"));
    elo.rotation.z = giro;
    corrente.add(elo);
  }
  corrente.position.set(0, 1.5, 2.65);
  camara.grupo.add(corrente);
  // O quadro de avisos, entre duas colunas: a ata lavrada aparece nele, com o carimbo da secretaria.
  const quadroDeAvisos = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 0.08), toon("#6e4f3a"));
  quadroDeAvisos.position.set(2.7, 2.1, 2.62);
  camara.grupo.add(quadroDeAvisos);
  const ata = new THREE.Group();
  const folhaDaAta = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.8), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  ata.add(folhaDaAta);
  for (let l = 0; l < 3; l += 1) {
    const linha = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.05), new THREE.MeshBasicMaterial({ color: "#8a8178" }));
    linha.position.set(0, 0.24 - l * 0.16, 0.01);
    ata.add(linha);
  }
  const carimboDaAta = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.14, 20), new THREE.MeshBasicMaterial({ color: "#8a3b3b" }));
  carimboDaAta.position.set(0.26, -0.24, 0.01);
  ata.add(carimboDaAta);
  ata.position.set(2.7, 2.1, 2.67);
  ata.visible = opcoes.ataLavrada;
  camara.grupo.add(ata);
  cena.add(camara.grupo);
  // A Lourdes, na escadaria, só quando a corrente caiu.
  const lourdes = makeLourdes();
  lourdes.grupo.position.set(-2.2, 0.44, -11.1);
  lourdes.grupo.rotation.y = 0.5;
  lourdes.grupo.visible = opcoes.camaraAberta;
  cena.add(lourdes.grupo);
  obstaculos.push(new THREE.Box2(new THREE.Vector2(-5.5, -17.5), new THREE.Vector2(5.5, -10.4)));
  const placaCamara = makeLabel("Câmara", "#8a7a5a");
  placaCamara.position.set(0, 7.4, -12);
  cena.add(placaCamara);
  const tapeteCamara = makeTapete("#8a7a5a", 1.3);
  tapeteCamara.position.set(PONTOS.camara.x, 0.03, PONTOS.camara.z);
  cena.add(tapeteCamara);

  // A padaria, à esquerda: casa colonial baixa, toldo listrado, Zefa na porta.
  const padaria = makeFachada({
    largura: 6.4,
    altura: 3.6,
    fundo: 4,
    cor: "#f2c99a",
    corMoldura: "#3d5a80",
    andares: 1,
    porta: { largura: 1.3, altura: 2.3 },
    platibanda: true,
  });
  padaria.grupo.position.set(-16, 0, 0);
  padaria.grupo.rotation.y = Math.PI / 2;
  const toldo = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 1.6),
    new THREE.MeshToonMaterial({
      map: makeToldo(["#3d5a80", "#fbf6ea"]),
      side: THREE.DoubleSide,
    }),
  );
  toldo.position.set(0, 2.9, 2.75);
  toldo.rotation.x = -Math.PI / 2 + 0.5;
  padaria.grupo.add(toldo);
  const vitrine = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.1, 0.1),
    new THREE.MeshToonMaterial({
      color: "#fdf3d2",
      emissive: "#f5dc9a",
      emissiveIntensity: 0.35,
    }),
  );
  vitrine.position.set(2, 1.5, 2.06);
  padaria.grupo.add(vitrine);
  cena.add(padaria.grupo);
  obstaculos.push(new THREE.Box2(new THREE.Vector2(-18.5, -3.4), new THREE.Vector2(-13.9, 3.4)));
  const placaPadaria = makeLabel("Padaria da Zefa", "#c66b8a");
  placaPadaria.position.set(-14.6, 5.2, 0);
  cena.add(placaPadaria);
  const tapetePadaria = makeTapete("#c66b8a", 1.3);
  tapetePadaria.position.set(PONTOS.padaria.x, 0.03, PONTOS.padaria.z);
  cena.add(tapetePadaria);
  const zefa = makeZefa();
  zefa.grupo.position.set(-13.1, 0, 1.4);
  zefa.grupo.rotation.y = Math.PI / 2 + 0.4;
  cena.add(zefa.grupo);

  // O arquivo, à direita: sobrado azul de dois andares, o Escrivão na porta.
  const arquivo = makeFachada({
    largura: 6.4,
    altura: 6.4,
    fundo: 4,
    cor: "#9fb7c9",
    corMoldura: "#fbf6ea",
    andares: 2,
    porta: { largura: 1.4, altura: 2.8 },
    platibanda: true,
  });
  arquivo.grupo.position.set(16, 0, 0);
  arquivo.grupo.rotation.y = -Math.PI / 2;
  const letreiro = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 0.1), toon("#2f6f73"));
  letreiro.position.set(0, 3.3, 2.08);
  arquivo.grupo.add(letreiro);
  cena.add(arquivo.grupo);
  obstaculos.push(new THREE.Box2(new THREE.Vector2(13.9, -3.4), new THREE.Vector2(18.5, 3.4)));
  const placaArquivo = makeLabel("Arquivo", "#2f6f73");
  placaArquivo.position.set(14.6, 7.0, 0);
  cena.add(placaArquivo);
  const tapeteArquivo = makeTapete("#2f6f73", 1.3);
  tapeteArquivo.position.set(PONTOS.arquivo.x, 0.03, PONTOS.arquivo.z);
  cena.add(tapeteArquivo);
  const escrivao = makeEscrivao();
  escrivao.grupo.position.set(13.1, 0, -1.4);
  escrivao.grupo.rotation.y = -Math.PI / 2 - 0.4;
  cena.add(escrivao.grupo);

  // O mural, no canto esquerdo do fundo: quadro de cortiça com as perguntas pregadas, e as notas, quando publicadas.
  const mural = new THREE.Group();
  for (const x of [-2.2, 2.2]) {
    const poste = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.9, 0.16), toon("#6e4f3a"));
    poste.position.set(x, 1.45, 0);
    mural.add(poste);
  }
  const tabuleiro = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.3, 0.14), toon("#d9b981"));
  tabuleiro.position.set(0, 1.75, 0);
  tabuleiro.castShadow = true;
  mural.add(tabuleiro);
  const moldura = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.5, 0.1), toon("#6e4f3a"));
  moldura.position.set(0, 1.75, -0.04);
  mural.add(moldura);
  const telhadinho = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 0.9), toon("#b86b4e"));
  telhadinho.position.set(0, 3.0, 0.2);
  mural.add(telhadinho);
  const papelGeo = new THREE.PlaneGeometry(0.5, 0.62);
  const papeis = ["#fbf6ea", "#fff1b8", "#e8f0f7", "#fbe3d6", "#fbf6ea", "#eef7e0"];
  papeis.forEach((cor, i) => {
    const papel = new THREE.Mesh(papelGeo, new THREE.MeshBasicMaterial({ color: cor }));
    papel.position.set(-1.9 + i * 0.76, 2.35 + (i % 2) * 0.25 - 0.1, 0.09);
    papel.rotation.z = (i % 3) * 0.08 - 0.08;
    mural.add(papel);
  });
  // As notas fixadas, uma por pauta publicada, em duas fileiras abaixo das perguntas: até oito, com carimbo.
  const notas: THREE.Group[] = Array.from({ length: NOTAS_NO_MURAL }, (_, i) => {
    const nota = new THREE.Group();
    const folha = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.78), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
    nota.add(folha);
    const carimbo = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.14, 20), new THREE.MeshBasicMaterial({ color: "#2f6f73" }));
    carimbo.position.set(0.18, -0.22, 0.01);
    nota.add(carimbo);
    for (let l = 0; l < 4; l += 1) {
      const linha = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.04), new THREE.MeshBasicMaterial({ color: "#8a8178" }));
      linha.position.set(-0.04, 0.26 - l * 0.12, 0.01);
      nota.add(linha);
    }
    nota.position.set(-1.6 + (i % 4) * 1.06, i < 4 ? 1.5 : 0.85, 0.1);
    nota.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.04;
    nota.visible = i < opcoes.publicadas;
    mural.add(nota);
    return nota;
  });
  mural.position.set(-9, 0, -9.4);
  cena.add(mural);
  obstaculos.push(new THREE.Box2(new THREE.Vector2(-11.5, -9.9), new THREE.Vector2(-6.5, -8.9)));
  const placaMural = makeLabel("Mural da praça", "#8a5a3b");
  placaMural.position.set(-9, 4.1, -9.4);
  cena.add(placaMural);
  const tapeteMural = makeTapete("#8a5a3b", 1.3);
  tapeteMural.position.set(PONTOS.mural.x, 0.03, PONTOS.mural.z);
  cena.add(tapeteMural);

  // A banca de jornal, no canto direito do fundo: quiosque de chapa, revistas na frente, Teodoro ao lado.
  const banca = new THREE.Group();
  const quiosque = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 2.2), toon("#3e7676"));
  quiosque.position.y = 1.25;
  quiosque.castShadow = true;
  banca.add(quiosque);
  const cobertura = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 3), toon("#fbf6ea"));
  cobertura.position.set(0, 2.58, 0.3);
  banca.add(cobertura);
  const balcao = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.5), toon("#2e5c5c"));
  balcao.position.set(0, 0.45, 1.3);
  banca.add(balcao);
  const abertura = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.08), new THREE.MeshToonMaterial({ color: "#1f3a3a" }));
  abertura.position.set(0, 1.6, 1.12);
  banca.add(abertura);
  ["#fff1b8", "#e8f0f7", "#fbe3d6", "#eef7e0", "#fbf6ea", "#f5d0d5"].forEach((cor, i) => {
    const revista = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.04), new THREE.MeshBasicMaterial({ color: cor }));
    revista.position.set(-1 + (i % 3) * 1, 1.3 + Math.floor(i / 3) * 0.5, 1.16);
    revista.rotation.x = -0.15;
    banca.add(revista);
  });
  banca.position.set(9, 0, -9.4);
  cena.add(banca);
  obstaculos.push(new THREE.Box2(new THREE.Vector2(7.3, -10.6), new THREE.Vector2(10.7, -7.9)));
  const placaBanca = makeLabel("Banca do Teodoro", "#3e7676");
  placaBanca.position.set(9, 4.1, -9.4);
  cena.add(placaBanca);
  const tapeteBanca = makeTapete("#3e7676", 1.3);
  tapeteBanca.position.set(PONTOS.banca.x, 0.03, PONTOS.banca.z);
  cena.add(tapeteBanca);
  const teodoro = makeTeodoro();
  teodoro.grupo.position.set(11.2, 0, -7.4);
  teodoro.grupo.rotation.y = -0.9;
  cena.add(teodoro.grupo);

  // O bilhete, no chão perto do coreto: um papel amassado que o vento mexe.
  const bilhete = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.52), new THREE.MeshBasicMaterial({ color: "#fffdf4", side: THREE.DoubleSide }));
  bilhete.rotation.set(-Math.PI / 2 + 0.25, 0, 0.5);
  bilhete.position.set(PONTOS.bilhete.x, 0.08, PONTOS.bilhete.z);
  bilhete.visible = opcoes.bilheteNoChao;
  cena.add(bilhete);
  const brilhoBilhete = makeTapete("#f2b63c", 0.7);
  brilhoBilhete.position.set(PONTOS.bilhete.x, 0.03, PONTOS.bilhete.z);
  brilhoBilhete.visible = opcoes.bilheteNoChao;
  cena.add(brilhoBilhete);

  makeCasario(cena, seededRandom(7));
  makeArvores(cena, seededRandom(23), fraco ? 22 : 44);

  const jogador = makeReporter();
  jogador.grupo.position.set(opcoes.posicaoInicial?.x ?? 0, 0, opcoes.posicaoInicial?.z ?? 6.5);
  jogador.grupo.rotation.y = Math.PI;
  cena.add(jogador.grupo);
  const sombraFalsa = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 20),
    new THREE.MeshBasicMaterial({
      color: "#000",
      transparent: true,
      opacity: fraco ? 0.18 : 0,
    }),
  );
  sombraFalsa.rotation.x = -Math.PI / 2;
  sombraFalsa.position.y = 0.03;
  cena.add(sombraFalsa);

  corrente.visible = !opcoes.camaraAberta;
  camara.porta.material = toon(opcoes.camaraAberta ? "#f6d98a" : "#4a3b31");

  // Entrada: o joystick e o teclado somam.
  const stick = new THREE.Vector2();
  const teclas = new Set<string>();
  const aoTeclar = (evento: KeyboardEvent) => {
    if (evento.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(evento.target.tagName)) return;
    const chave = evento.key.toLowerCase();
    if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(chave)) return;
    if (evento.type === "keydown") {
      teclas.add(chave);
      if (chave.startsWith("arrow")) evento.preventDefault();
    } else teclas.delete(chave);
  };
  window.addEventListener("keydown", aoTeclar);
  window.addEventListener("keyup", aoTeclar);
  const limparTeclas = () => teclas.clear();
  window.addEventListener("blur", limparTeclas);

  const redimensionar = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 62 : 48;
    camera.updateProjectionMatrix();
  };
  const observador = new ResizeObserver(redimensionar);
  observador.observe(canvas);
  redimensionar();

  let pausado = false;
  let perto: PontoId | null = null;
  let passo = 0;
  let tempo = 0;
  const relogio = new THREE.Clock();
  const alvoCamera = new THREE.Vector3();
  const desejo = new THREE.Vector2();
  // Câmera em três quartos, mais perto do que na Cidade do Voto: a praça é pequena e as fachadas importam.
  const OFFSET = new THREE.Vector3(0, 9.5, 10);
  const moradores = [zefa, teodoro, escrivao, lourdes];

  const colide = (p: THREE.Vector2) =>
    Math.abs(p.x) > LIMITE.x || Math.abs(p.y) > LIMITE.z || obstaculos.some((caixa) => caixa.distanceToPoint(p) < RAIO_PERSONAGEM) || circulos.some((c) => c.c.distanceTo(p) < c.r + RAIO_PERSONAGEM);

  const quadro = () => {
    const dt = Math.min(relogio.getDelta(), 0.05);
    tempo += dt;
    if (!pausado) {
      // 1. Entrada: a direção pedida, no plano do chão (a câmera olha para -z).
      desejo.set(stick.x, -stick.y);
      if (teclas.has("w") || teclas.has("arrowup")) desejo.y -= 1;
      if (teclas.has("s") || teclas.has("arrowdown")) desejo.y += 1;
      if (teclas.has("a") || teclas.has("arrowleft")) desejo.x -= 1;
      if (teclas.has("d") || teclas.has("arrowright")) desejo.x += 1;
      if (desejo.lengthSq() > 1) desejo.normalize();

      // 2. Movimento e colisão: cada eixo à parte, para deslizar pela parede.
      const andando = desejo.lengthSq() > 0.01;
      if (andando) {
        const pos = new THREE.Vector2(jogador.grupo.position.x, jogador.grupo.position.z);
        const tentativaX = pos.clone().add(new THREE.Vector2(desejo.x * VELOCIDADE * dt, 0));
        if (!colide(tentativaX)) pos.x = tentativaX.x;
        const tentativaZ = pos.clone().add(new THREE.Vector2(0, desejo.y * VELOCIDADE * dt));
        if (!colide(tentativaZ)) pos.y = tentativaZ.y;
        jogador.grupo.position.x = pos.x;
        jogador.grupo.position.z = pos.y;
        const angulo = Math.atan2(desejo.x, desejo.y);
        const diferenca = THREE.MathUtils.euclideanModulo(angulo - jogador.grupo.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
        jogador.grupo.rotation.y += diferenca * (opcoes.reduzirMovimento ? 1 : 0.25);
        passo += dt * 10 * desejo.length();
      }
      const balanco = andando && !opcoes.reduzirMovimento ? Math.sin(passo) * 0.5 : 0;
      jogador.pernas[0]!.rotation.x = balanco;
      jogador.pernas[1]!.rotation.x = -balanco;
      sombraFalsa.position.x = jogador.grupo.position.x;
      sombraFalsa.position.z = jogador.grupo.position.z;
      // Onde o personagem está, no canvas, com uma casa decimal: serve ao diagnóstico e aos testes, e só muda quando o valor muda.
      const marcaDePosicao = `${jogador.grupo.position.x.toFixed(1)},${jogador.grupo.position.z.toFixed(1)}`;
      if (canvas.dataset.posicao !== marcaDePosicao) canvas.dataset.posicao = marcaDePosicao;

      // 3. Proximidade: o ponto mais perto, dentro do raio dele. O bilhete só conta enquanto está no chão.
      const pos = new THREE.Vector2(jogador.grupo.position.x, jogador.grupo.position.z);
      let maisPerto: PontoId | null = null;
      let menor = Number.POSITIVE_INFINITY;
      for (const [id, ponto] of Object.entries(PONTOS) as [PontoId, (typeof PONTOS)[PontoId]][]) {
        if (id === "bilhete" && !bilhete.visible) continue;
        const d = Math.hypot(ponto.x - pos.x, ponto.z - pos.y);
        if (d < ponto.raio && d < menor) {
          menor = d;
          maisPerto = id;
        }
      }
      if (maisPerto !== perto) {
        perto = maisPerto;
        callbacks.onEvento({ tipo: "perto", id: perto });
      }

      // Vida da praça: os moradores balançam de leve e o bilhete treme no vento. Nada disso com movimento reduzido.
      if (!opcoes.reduzirMovimento) {
        moradores.forEach((morador, i) => {
          // A Lourdes fica em um degrau da escadaria: balança em volta da altura dele.
          morador.grupo.position.y = (morador === lourdes ? 0.44 : 0) + Math.sin(tempo * 1.6 + i) * 0.03;
        });
        bilhete.rotation.z = 0.5 + Math.sin(tempo * 3) * 0.12;
        bilhete.position.y = 0.08 + Math.abs(Math.sin(tempo * 3)) * 0.04;
      }
    }

    // 4. Câmera: segue o personagem com atraso suave.
    alvoCamera.copy(jogador.grupo.position).add(OFFSET);
    camera.position.lerp(alvoCamera, opcoes.reduzirMovimento ? 1 : 0.08);
    camera.lookAt(jogador.grupo.position.x, jogador.grupo.position.y + 1, jogador.grupo.position.z - 1.5);
    sol.position.set(jogador.grupo.position.x + 10, 20, jogador.grupo.position.z + 12);
    sol.target.position.copy(jogador.grupo.position);

    // 5. Desenho.
    renderer.render(cena, camera);
  };
  camera.position.copy(jogador.grupo.position).add(OFFSET);
  renderer.setAnimationLoop(quadro);

  return {
    setStick: (x, y) => stick.set(x, y),
    setPaused: (valor) => {
      pausado = valor;
      if (valor) {
        stick.set(0, 0);
        teclas.clear();
      }
    },
    getPosition: () => ({
      x: jogador.grupo.position.x,
      z: jogador.grupo.position.z,
    }),
    setMural: (publicadas) => notas.forEach((nota, i) => (nota.visible = i < publicadas)),
    setCamaraAberta: (aberta) => {
      corrente.visible = !aberta;
      camara.porta.material = toon(aberta ? "#f6d98a" : "#4a3b31");
      lourdes.grupo.visible = aberta;
    },
    setAta: (lavrada) => {
      ata.visible = lavrada;
    },
    setBilhete: (noChao) => {
      bilhete.visible = noChao;
      brilhoBilhete.visible = noChao;
    },
    dispose: () => {
      renderer.setAnimationLoop(null);
      observador.disconnect();
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("keyup", aoTeclar);
      window.removeEventListener("blur", limparTeclas);
      cena.traverse((objeto) => {
        if (objeto instanceof THREE.Mesh || objeto instanceof THREE.Sprite || objeto instanceof THREE.InstancedMesh) {
          objeto.geometry.dispose();
          const materiais = Array.isArray(objeto.material) ? objeto.material : [objeto.material];
          for (const material of materiais) {
            if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
            material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
