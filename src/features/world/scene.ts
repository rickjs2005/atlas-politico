// A cena 3D da Cidade do Voto (docs/MUNDO.md): uma praça com um prédio por
// tema, um personagem que anda pelo joystick ou pelo teclado e uma câmera que
// o segue. Inspirada na estrutura de portfólios em mundo aberto, com arte
// própria, feita só de formas simples: nada é baixado além deste código.
//
// O visual é neutro de propósito: nenhum prédio, placa ou personagem usa as
// cores de partido, e não há figura de nenhuma das pessoas retratadas.
//
// O laço segue uma ordem fixa a cada quadro: entrada, movimento e colisão,
// proximidade dos prédios, câmera, desenho.

import * as THREE from "three";

import { seededRandom } from "@/lib/world/blind";

export interface BuildingSpec {
  id: string;
  rotulo: string;
}

export interface WorldCallbacks {
  /** O personagem chegou perto da porta de um prédio, ou se afastou (`null`). */
  onNear: (id: string | null) => void;
}

export interface WorldHandle {
  /** Direção pedida pelo joystick, de -1 a 1 em cada eixo (x: direita, y: para cima na tela). */
  setStick: (x: number, y: number) => void;
  /** Marca um prédio como visitado: a bandeira dele sobe. */
  markVisited: (id: string) => void;
  /** Pausa o laço (janela aberta) ou retoma. */
  setPaused: (pausado: boolean) => void;
  /** Onde o personagem está, no plano do chão: serve para recriar a cena no mesmo lugar depois da revelação. */
  getPosition: () => { x: number; z: number };
  /** Para o laço, solta os recursos da placa e perde o contexto: a cena não pode ser usada depois, e um canvas novo pede uma cena nova. */
  dispose: () => void;
}

export interface WorldOptions {
  reduzirMovimento: boolean;
  /** Onde o personagem começa; sem isso, no centro da praça. */
  posicaoInicial?: { x: number; z: number };
  /** Os prédios já visitados, com a bandeira no alto desde o primeiro quadro. */
  visitados?: readonly string[];
}

// Cores neutras, uma por prédio, sem vermelho nem verde-amarelo.
const CORES = ["#5b7fa6", "#8a6fb0", "#c98a4b", "#4f9a9a", "#a5677f", "#6c8a5a", "#7d7d9c", "#b08a5a"];
const CHAO = "#e9e1cf";
const GRAMA = "#cfd8b8";
const CALCADA = "#d8cdb6";

const RAIO_PRACA = 15;
const RAIO_PORTA = 3.2;
const VELOCIDADE = 6.5;
const RAIO_PERSONAGEM = 0.45;
const URNA = new THREE.Vector2(2.6, 1.2);

interface Building {
  id: string;
  caixa: THREE.Box2;
  porta: THREE.Vector2;
  bandeira: THREE.Mesh;
  mastroTopo: number;
  visitado: boolean;
}

/** Um rótulo de texto como placa, desenhado em canvas. */
function makeLabel(texto: string, cor: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  const escala = 2;
  canvas.width = 512 * escala;
  canvas.height = 128 * escala;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(escala, escala);
  ctx.fillStyle = "rgba(255,252,245,0.96)";
  ctx.strokeStyle = cor;
  ctx.lineWidth = 8;
  const r = 28;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 112, r);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2a2622";
  ctx.font = "600 52px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, 256, 66, 460);
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: textura, depthTest: false }));
  sprite.scale.set(5, 1.25, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function makeBuilding(spec: BuildingSpec, indice: number, total: number, cena: THREE.Scene): Building {
  // O primeiro prédio fica bem à frente de quem começa no centro (para -z, longe da câmera).
  const angulo = Math.PI + (indice / total) * Math.PI * 2;
  const centro = new THREE.Vector2(Math.sin(angulo) * RAIO_PRACA, Math.cos(angulo) * RAIO_PRACA);
  const cor = CORES[indice % CORES.length]!;
  const grupo = new THREE.Group();
  grupo.position.set(centro.x, 0, centro.y);
  // A frente do prédio (o lado -z dele, onde fica a porta) olha para o centro da praça.
  grupo.rotation.y = angulo;

  const largura = 5;
  const fundo = 4;
  const altura = 3.5 + (indice % 3) * 1.2;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(largura, altura, fundo), new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85 }));
  corpo.position.y = altura / 2;
  corpo.castShadow = true;
  corpo.receiveShadow = true;
  grupo.add(corpo);

  const telhado = new THREE.Mesh(new THREE.BoxGeometry(largura + 0.4, 0.35, fundo + 0.4), new THREE.MeshStandardMaterial({ color: "#f3ede0" }));
  telhado.position.y = altura + 0.17;
  telhado.castShadow = true;
  grupo.add(telhado);

  // Janelas: faixas claras na frente.
  const janelaMat = new THREE.MeshStandardMaterial({ color: "#fff8e6", emissive: "#fff2cc", emissiveIntensity: 0.25 });
  for (let andar = 0; andar < Math.floor(altura / 1.4); andar += 1) {
    for (const x of [-1.5, 1.5]) {
      const janela = new THREE.Mesh(new THREE.BoxGeometry(1, 0.7, 0.05), janelaMat);
      janela.position.set(x, 1.4 + andar * 1.3, -fundo / 2 - 0.03);
      grupo.add(janela);
    }
  }

  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2, 0.08), new THREE.MeshStandardMaterial({ color: "#3b332c" }));
  porta.position.set(0, 1, -fundo / 2 - 0.05);
  grupo.add(porta);

  // Tapete na frente da porta: onde o personagem entra.
  const tapete = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.04, 24), new THREE.MeshStandardMaterial({ color: cor, transparent: true, opacity: 0.45 }));
  tapete.position.set(0, 0.03, -fundo / 2 - 1.6);
  grupo.add(tapete);

  // Mastro com bandeira branca: sobe quando o tema é visitado.
  const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3), new THREE.MeshStandardMaterial({ color: "#8a8178" }));
  mastro.position.set(largura / 2 + 0.6, 1.5, -fundo / 2);
  grupo.add(mastro);
  const bandeira = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.55), new THREE.MeshStandardMaterial({ color: "#fdfbf6", side: THREE.DoubleSide }));
  bandeira.position.set(largura / 2 + 1.07, 0.5, -fundo / 2);
  grupo.add(bandeira);

  const placa = makeLabel(spec.rotulo, cor);
  placa.position.set(0, altura + 1.3, 0);
  grupo.add(placa);

  cena.add(grupo);
  grupo.updateMatrixWorld(true);

  // A caixa de colisão no chão, em coordenadas do mundo (o prédio gira, então vale a caixa que contém os cantos).
  const cantos = [
    [-largura / 2, -fundo / 2],
    [largura / 2, -fundo / 2],
    [largura / 2, fundo / 2],
    [-largura / 2, fundo / 2],
  ].map(([x, z]) => {
    const v = new THREE.Vector3(x, 0, z).applyMatrix4(grupo.matrixWorld);
    return new THREE.Vector2(v.x, v.z);
  });
  const caixa = new THREE.Box2().setFromPoints(cantos);
  const portaMundo = new THREE.Vector3(0, 0, -fundo / 2 - 1.6).applyMatrix4(grupo.matrixWorld);

  return { id: spec.id, caixa, porta: new THREE.Vector2(portaMundo.x, portaMundo.z), bandeira, mastroTopo: 2.75, visitado: false };
}

/** Uma pessoa qualquer da cidade, de mochila: personagem original, sem rosto de ninguém. */
function makePlayer(): { grupo: THREE.Group; pernas: THREE.Mesh[] } {
  const grupo = new THREE.Group();
  const pele = new THREE.MeshStandardMaterial({ color: "#d9a77c" });
  const roupa = new THREE.MeshStandardMaterial({ color: "#4f6d8f" });
  const calca = new THREE.MeshStandardMaterial({ color: "#3a3a44" });
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 4, 12), roupa);
  corpo.position.y = 1.05;
  corpo.castShadow = true;
  grupo.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), pele);
  cabeca.position.y = 1.75;
  cabeca.castShadow = true;
  grupo.add(cabeca);
  const cabelo = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#3d2b20" }));
  cabelo.position.y = 1.78;
  grupo.add(cabelo);
  const mochila = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.22), new THREE.MeshStandardMaterial({ color: "#c98a4b" }));
  mochila.position.set(0, 1.1, -0.32);
  mochila.castShadow = true;
  grupo.add(mochila);
  const pernas = [-0.14, 0.14].map((x) => {
    const perna = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.45, 4, 8), calca);
    perna.position.set(x, 0.38, 0);
    perna.castShadow = true;
    grupo.add(perna);
    return perna;
  });
  return { grupo, pernas };
}

function makeTrees(cena: THREE.Scene, sorteio: () => number, evitar: readonly THREE.Box2[]) {
  const quantidade = 70;
  const copa = new THREE.InstancedMesh(new THREE.ConeGeometry(0.9, 2.2, 7), new THREE.MeshStandardMaterial({ color: "#7f9a6a", flatShading: true }), quantidade);
  const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.15, 0.2, 0.9, 6), new THREE.MeshStandardMaterial({ color: "#7a5a43" }), quantidade);
  copa.castShadow = true;
  const m = new THREE.Matrix4();
  let n = 0;
  for (let tentativa = 0; tentativa < 500 && n < quantidade; tentativa += 1) {
    const ang = sorteio() * Math.PI * 2;
    const dist = RAIO_PRACA + 6 + sorteio() * 18;
    const p = new THREE.Vector2(Math.sin(ang) * dist, Math.cos(ang) * dist);
    if (evitar.some((caixa) => caixa.distanceToPoint(p) < 2)) continue;
    const s = 0.8 + sorteio() * 0.6;
    m.compose(new THREE.Vector3(p.x, 0.45 * s, p.y), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    tronco.setMatrixAt(n, m);
    m.compose(new THREE.Vector3(p.x, (0.9 + 1.1) * s, p.y), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), sorteio() * 3), new THREE.Vector3(s, s, s));
    copa.setMatrixAt(n, m);
    n += 1;
  }
  copa.count = n;
  tronco.count = n;
  cena.add(copa, tronco);
}

/** Monta o mundo no canvas e começa o laço. Devolve os controles e a limpeza. */
export function createWorld(canvas: HTMLCanvasElement, predios: readonly BuildingSpec[], callbacks: WorldCallbacks, opcoes: WorldOptions): WorldHandle {
  const fraco = window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !fraco, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, fraco ? 1.5 : 2));
  renderer.shadowMap.enabled = !fraco;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color("#f4ecd9");
  cena.fog = new THREE.Fog("#f4ecd9", 30, 60);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

  cena.add(new THREE.HemisphereLight("#fff6e3", "#b7a98f", 1.4));
  const sol = new THREE.DirectionalLight("#ffffff", 1.6);
  sol.position.set(12, 20, 8);
  sol.castShadow = !fraco;
  sol.shadow.mapSize.set(1024, 1024);
  sol.shadow.camera.left = -30;
  sol.shadow.camera.right = 30;
  sol.shadow.camera.top = 30;
  sol.shadow.camera.bottom = -30;
  cena.add(sol);
  cena.add(sol.target);

  const chao = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ color: GRAMA }));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  cena.add(chao);
  const praca = new THREE.Mesh(new THREE.CircleGeometry(RAIO_PRACA + 4.5, 64), new THREE.MeshStandardMaterial({ color: CALCADA }));
  praca.rotation.x = -Math.PI / 2;
  praca.position.y = 0.01;
  praca.receiveShadow = true;
  cena.add(praca);
  const centro = new THREE.Mesh(new THREE.CircleGeometry(4, 48), new THREE.MeshStandardMaterial({ color: CHAO }));
  centro.rotation.x = -Math.PI / 2;
  centro.position.y = 0.02;
  cena.add(centro);
  // Uma urna estilizada no centro da praça: o ponto de partida.
  // Fica ao lado do ponto de partida, e não no caminho do primeiro passo.
  const urna = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 0.9), new THREE.MeshStandardMaterial({ color: "#efe9dc" }));
  urna.position.set(URNA.x, 0.5, URNA.y);
  urna.castShadow = true;
  cena.add(urna);
  const fenda = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.12), new THREE.MeshStandardMaterial({ color: "#2a2622" }));
  fenda.position.set(URNA.x, 1.01, URNA.y);
  cena.add(fenda);
  const caixaUrna = new THREE.Box2(new THREE.Vector2(URNA.x - 0.6, URNA.y - 0.45), new THREE.Vector2(URNA.x + 0.6, URNA.y + 0.45));

  const edificios = predios.map((spec, indice) => makeBuilding(spec, indice, predios.length, cena));
  makeTrees(cena, seededRandom(11), edificios.map((e) => e.caixa));

  const { grupo: jogador, pernas } = makePlayer();
  jogador.position.set(opcoes.posicaoInicial?.x ?? 0, 0, opcoes.posicaoInicial?.z ?? 0);
  cena.add(jogador);
  // Quem volta da revelação encontra as bandeiras dos prédios visitados já no alto.
  for (const e of edificios) {
    if (opcoes.visitados?.includes(e.id) !== true) continue;
    e.visitado = true;
    e.bandeira.position.y = e.mastroTopo;
  }

  const sombraFalsa = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: fraco ? 0.18 : 0 }));
  sombraFalsa.rotation.x = -Math.PI / 2;
  sombraFalsa.position.y = 0.03;
  cena.add(sombraFalsa);

  // Entrada: o joystick e o teclado somam.
  const stick = new THREE.Vector2();
  const teclas = new Set<string>();
  const aoTeclar = (evento: KeyboardEvent) => {
    if (evento.target instanceof HTMLElement && /INPUT|TEXTAREA|BUTTON|SELECT/.test(evento.target.tagName) && evento.key !== "ArrowUp" && evento.key !== "ArrowDown") return;
    const chave = evento.key.toLowerCase();
    if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(chave)) return;
    if (evento.type === "keydown") teclas.add(chave);
    else teclas.delete(chave);
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
    // Em tela em pé, a câmera se afasta um pouco para caber mais da praça.
    camera.fov = w < h ? 58 : 45;
    camera.updateProjectionMatrix();
  };
  const observador = new ResizeObserver(redimensionar);
  observador.observe(canvas);
  redimensionar();

  let pausado = false;
  let perto: string | null = null;
  let passo = 0;
  const relogio = new THREE.Clock();
  const alvoCamera = new THREE.Vector3();
  const desejo = new THREE.Vector2();
  // Câmera alta, quase de cima: cabe mais da praça e as placas não ficam atrás do painel.
  const OFFSET = new THREE.Vector3(0, 15, 12);

  const colide = (p: THREE.Vector2) => edificios.some((e) => e.caixa.distanceToPoint(p) < RAIO_PERSONAGEM) || caixaUrna.distanceToPoint(p) < RAIO_PERSONAGEM;

  const quadro = () => {
    const dt = Math.min(relogio.getDelta(), 0.05);
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
        const pos = new THREE.Vector2(jogador.position.x, jogador.position.z);
        const tentativaX = pos.clone().add(new THREE.Vector2(desejo.x * VELOCIDADE * dt, 0));
        if (!colide(tentativaX) && tentativaX.length() < 45) pos.x = tentativaX.x;
        const tentativaZ = pos.clone().add(new THREE.Vector2(0, desejo.y * VELOCIDADE * dt));
        if (!colide(tentativaZ) && tentativaZ.length() < 45) pos.y = tentativaZ.y;
        jogador.position.x = pos.x;
        jogador.position.z = pos.y;
        const angulo = Math.atan2(desejo.x, desejo.y);
        // Gira pelo caminho mais curto até a direção do movimento.
        const diferenca = THREE.MathUtils.euclideanModulo(angulo - jogador.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
        jogador.rotation.y += diferenca * (opcoes.reduzirMovimento ? 1 : 0.25);
        passo += dt * 10 * desejo.length();
      }
      const balanco = andando && !opcoes.reduzirMovimento ? Math.sin(passo) * 0.5 : 0;
      pernas[0]!.rotation.x = balanco;
      pernas[1]!.rotation.x = -balanco;
      sombraFalsa.position.x = jogador.position.x;
      sombraFalsa.position.z = jogador.position.z;

      // 3. Proximidade: a porta mais perto, dentro do raio.
      const pos = new THREE.Vector2(jogador.position.x, jogador.position.z);
      let maisPerto: string | null = null;
      let menor = RAIO_PORTA;
      for (const e of edificios) {
        const d = e.porta.distanceTo(pos);
        if (d < menor) {
          menor = d;
          maisPerto = e.id;
        }
      }
      if (maisPerto !== perto) {
        perto = maisPerto;
        callbacks.onNear(perto);
      }

      // Bandeiras dos prédios visitados sobem devagar.
      for (const e of edificios) {
        const alvo = e.visitado ? e.mastroTopo : 0.5;
        e.bandeira.position.y = opcoes.reduzirMovimento ? alvo : THREE.MathUtils.lerp(e.bandeira.position.y, alvo, 0.05);
      }
    }

    // 4. Câmera: segue o personagem com atraso suave.
    alvoCamera.copy(jogador.position).add(OFFSET);
    camera.position.lerp(alvoCamera, opcoes.reduzirMovimento ? 1 : 0.08);
    camera.lookAt(jogador.position.x, jogador.position.y + 1, jogador.position.z);
    sol.position.set(jogador.position.x + 12, 20, jogador.position.z + 8);
    sol.target.position.copy(jogador.position);

    // 5. Desenho.
    renderer.render(cena, camera);
  };
  camera.position.copy(jogador.position).add(OFFSET);
  renderer.setAnimationLoop(quadro);

  return {
    setStick: (x, y) => stick.set(x, y),
    markVisited: (id) => {
      const e = edificios.find((item) => item.id === id);
      if (e !== undefined) e.visitado = true;
    },
    setPaused: (valor) => {
      pausado = valor;
      if (valor) {
        stick.set(0, 0);
        teclas.clear();
      }
    },
    getPosition: () => ({ x: jogador.position.x, z: jogador.position.z }),
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
      // O contexto WebGL do canvas antigo é solto na hora, e não quando o coletor passar: a cidade é criada e descartada a cada ida à revelação.
      renderer.forceContextLoss();
    },
  };
}
