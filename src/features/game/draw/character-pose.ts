// Esqueleto comum dos personagens do jogo. Conta pura, sem canvas: das
// proporções e da pose saem as articulações em pixels de tela, na vista de
// três quartos e com o personagem olhando para a direita. Quem desenha
// espelha para a esquerda.
//
// Eixos do corpo: `f` para a frente, `r` para o lado direito do personagem
// (o lado de perto da câmera nas duas vistas) e `z` para cima, em pixels na
// escala 1.

/** As proporções de um corpo. Alturas em pixels acima do chão. */
export interface Build {
  /** Do chão ao topo do cabelo. */
  altura: number;
  tornozelo: number;
  joelho: number;
  quadril: number;
  cintura: number;
  /** Onde a roupa de cima acaba: a barra do paletó ou do colete. */
  barra: number;
  /** A linha de cima dos ombros. */
  ombro: number;
  /** A base do pescoço, no colarinho. */
  pescoco: number;
  /** O centro da cabeça. */
  cabeca: number;
  /** Meia largura do tronco na tela: no peito, na cintura e na barra. */
  peito: number;
  cinturaLargura: number;
  barraLargura: number;
  /** Meia distância entre as articulações do quadril e entre os pés parados. */
  quadris: number;
  pes: number;
  /** Meia espessura da perna: na coxa, no joelho e na boca da calça. */
  coxa: number;
  joelhoLargura: number;
  bocaCalca: number;
  /** Meia espessura do braço: no ombro, no cotovelo e no punho. */
  manga: number;
  cotovelo: number;
  punho: number;
  /** Comprimento do braço e do antebraço. */
  braco: number;
  antebraco: number;
  /** Meio passo: quanto o pé vai à frente e atrás do quadril. */
  passo: number;
}

/** Três pontos de um membro, na tela: ombro, cotovelo e punho, ou quadril, joelho e tornozelo. */
export interface Chain {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Leg extends Chain {
  /** Giro do pé no plano do passo, em radianos: positivo abaixa a ponta. */
  pe: number;
  /** Quanto o pé está perto da câmera, para decidir qual perna fica na frente. */
  perto: number;
}

export interface Pose {
  frente: boolean;
  /** Centro do tronco na altura dos ombros e na da barra (o corpo se inclina ao andar). */
  troncoX: number;
  baseX: number;
  ombroY: number;
  pescocoY: number;
  cinturaY: number;
  barraY: number;
  /** Desnível dos ombros na tela: o de perto fica mais baixo. */
  desnivel: number;
  cabecaX: number;
  cabecaY: number;
  /** Quanto o corpo desceu no passo, de 0 a 1: a sombra acompanha. */
  afunda: number;
  pernaPerto: Leg;
  pernaLonge: Leg;
  bracoPerto: Chain;
  bracoLonge: Chain;
}

/** Na tela, 1 px de chão ao longo de um eixo do mundo anda isto na horizontal... */
export const AX = 0.8;
/** ...e isto na vertical: a proporção 2:1 das células. */
export const AY_CHAO = 0.4;
/** Na altura dos ombros o desnível é menor: o corpo é visto mais de lado que o chão. */
const AY_CORPO = 0.2;

const TAU = Math.PI * 2;

function chain(): Chain {
  return { x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
}

export function newPose(): Pose {
  return {
    frente: true,
    troncoX: 0,
    baseX: 0,
    ombroY: 0,
    pescocoY: 0,
    cinturaY: 0,
    barraY: 0,
    desnivel: 0,
    cabecaX: 0,
    cabecaY: 0,
    afunda: 0,
    pernaPerto: { ...chain(), pe: 0, perto: 0 },
    pernaLonge: { ...chain(), pe: 0, perto: 0 },
    bracoPerto: chain(),
    bracoLonge: chain(),
  };
}

// Estado da projeção da pose em cálculo: de frente o lado direito do corpo vai
// para a esquerda da tela e a frente desce; de costas é o contrário.
let ladoTela = -1;
let frenteTela = 1;
let alturaOmbro = 1;

function telaX(f: number, r: number): number {
  return AX * (f + ladoTela * r);
}

function telaY(f: number, r: number, z: number): number {
  const k = z <= 0 ? 0 : z >= alturaOmbro ? 1 : z / alturaOmbro;
  return -z + (AY_CHAO + (AY_CORPO - AY_CHAO) * k) * (frenteTela * f + r);
}

function suave(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t * t * (3 - 2 * t);
}

/** O pé ao longo de um ciclo: metade no chão, indo para trás, metade no ar, voltando. */
const pisada = { f: 0, z: 0, pe: 0 };

function pisar(fase: number, meio: number): void {
  const p = fase - Math.floor(fase);
  if (p < 0.5) {
    // Apoio: toca com o calcanhar, assenta e sai pela ponta.
    const t = p * 2;
    const calcanhar = suave((t - 0.5) / 0.5);
    pisada.f = meio * (1 - 2 * t);
    pisada.z = calcanhar * 2.4;
    pisada.pe = t < 0.18 ? -0.34 * (1 - t / 0.18) : calcanhar * 0.62;
    return;
  }
  // Balanço: o pé sai de trás, passa alto sob o corpo e estende à frente.
  const t = (p - 0.5) * 2;
  pisada.f = -meio * Math.cos(Math.PI * t);
  pisada.z = 2.4 * (1 - suave(t / 0.45)) + 3.6 * Math.sin(Math.PI * t);
  pisada.pe = t < 0.3 ? 0.62 + 0.14 * (t / 0.3) : 0.76 - 1.1 * suave((t - 0.3) / 0.7);
}

function perna(saida: Leg, b: Build, lado: number, andando: boolean, fase: number, zQuadril: number): void {
  let pf = 0;
  let pz = b.tornozelo;
  let pe = 0;
  if (andando) {
    pisar(fase, b.passo);
    pf = pisada.f;
    pz += pisada.z;
    pe = pisada.pe;
  }
  const qr = lado * b.quadris;
  const pr = lado * b.pes;
  const coxa = b.quadril - b.joelho;
  const canela = b.joelho - b.tornozelo;
  let desce = zQuadril - pz;
  let distancia = Math.hypot(pf, desce);
  const alcance = (coxa + canela) * 0.998;
  if (distancia > alcance) {
    // A perna não alcança: o pé sobe em direção ao quadril.
    const k = alcance / distancia;
    pf *= k;
    desce *= k;
    pz = zQuadril - desce;
    distancia = alcance;
  }
  // Joelho: os dois ossos fecham o triângulo, com a dobra para a frente.
  const a = (coxa * coxa - canela * canela + distancia * distancia) / (2 * distancia);
  const h = Math.sqrt(Math.max(0, coxa * coxa - a * a));
  const uf = pf / distancia;
  const uz = -desce / distancia;
  const jf = a * uf - h * uz;
  const jz = zQuadril + a * uz + h * uf;
  const jr = (qr + pr) / 2 + lado * 0.2;
  saida.x0 = telaX(0, qr);
  saida.y0 = telaY(0, qr, zQuadril);
  saida.x1 = telaX(jf, jr);
  saida.y1 = telaY(jf, jr, jz);
  saida.x2 = telaX(pf, pr);
  saida.y2 = telaY(pf, pr, pz);
  saida.pe = pe;
  saida.perto = frenteTela * pf + pr;
}

function braco(saida: Chain, b: Build, lado: number, of: number, zOmbro: number, alfa: number, beta: number, abre: number): void {
  // O ombro de longe fica um pouco para dentro, para o tronco cobrir a cava.
  const or = (lado * (b.peito - (lado > 0 ? 2.2 : 3.2))) / AX;
  const cf = of + b.braco * Math.sin(alfa);
  const cz = zOmbro - b.braco * Math.cos(alfa);
  const cr = or + lado * abre;
  const pf = cf + b.antebraco * Math.sin(alfa + beta);
  const pz = cz - b.antebraco * Math.cos(alfa + beta);
  const pr = or + lado * abre * 0.4;
  saida.x0 = telaX(of, or);
  saida.y0 = telaY(of, or, zOmbro);
  saida.x1 = telaX(cf, cr);
  saida.y1 = telaY(cf, cr, cz);
  saida.x2 = telaX(pf, pr);
  saida.y2 = telaY(pf, pr, pz);
}

/**
 * Calcula a pose. `fase` é o ciclo do passo, de 0 a 1: em 0 e em 0,5 uma perna
 * passa dobrada sob o corpo; em 0,25 e em 0,75 os dois pés tocam o chão, um à
 * frente e um atrás. `respiro` vai de 0 a 1 e só vale parado. Com
 * `bracoOcupado` o braço de perto fica dobrado, segurando algo, e não balança.
 */
export function computePose(pose: Pose, b: Build, frente: boolean, andando: boolean, fase: number, respiro: number, bracoOcupado: boolean): void {
  ladoTela = frente ? -1 : 1;
  frenteTela = frente ? 1 : -1;
  alturaOmbro = b.ombro;
  pose.frente = frente;

  // Perna direita à frente quando positivo.
  const giro = andando ? Math.sin(fase * TAU) : 0;
  // O quadril desce quando as pernas se abrem e volta quando uma passa pela outra.
  const pernaInteira = b.quadril - b.tornozelo;
  const fundo = pernaInteira - Math.sqrt(pernaInteira * pernaInteira - b.passo * b.passo) + 0.35;
  const afunda = andando ? (1 - Math.cos(fase * 2 * TAU)) / 2 : 0;
  const queda = fundo * afunda;
  const sobe = andando ? 0 : respiro * 0.7;
  // Ao andar o tronco vai um pouco à frente.
  const inclina = andando ? 1.2 : 0;

  pose.afunda = afunda;
  pose.troncoX = telaX(inclina, 0);
  pose.baseX = telaX(inclina * 0.25, 0);
  pose.ombroY = telaY(inclina, 0, b.ombro - queda + sobe);
  pose.pescocoY = telaY(inclina, 0, b.pescoco - queda + sobe);
  pose.cinturaY = -(b.cintura - queda + sobe * 0.3);
  pose.barraY = -(b.barra - queda);
  pose.desnivel = (AY_CORPO * (b.peito - 2.2)) / AX;
  pose.cabecaX = telaX(inclina * 1.3 + 0.7, 0);
  pose.cabecaY = telaY(inclina * 1.3 + 0.7, 0, b.cabeca - queda + sobe * 1.15);

  const zQuadril = b.quadril - queda;
  perna(pose.pernaPerto, b, 1, andando, fase - 0.25, zQuadril);
  perna(pose.pernaLonge, b, -1, andando, fase + 0.25, zQuadril);

  // Braços em oposição às pernas; os ombros giram um pouco contra o quadril.
  const zOmbro = b.ombro - b.manga + 0.5 - queda + sobe;
  const alfaPerto = andando ? 0.04 - BALANCO * giro : 0.03;
  const alfaLonge = andando ? 0.04 + BALANCO * giro : 0.03;
  if (bracoOcupado) braco(pose.bracoPerto, b, 1, inclina, zOmbro, -0.2, 1.32, 0.6);
  else braco(pose.bracoPerto, b, 1, inclina - giro * 0.6, zOmbro, alfaPerto, dobra(alfaPerto, andando), 1.3);
  braco(pose.bracoLonge, b, -1, inclina + giro * 0.6, zOmbro - 0.8, alfaLonge, dobra(alfaLonge, andando), 1.3);
}

/** Quanto o braço vai à frente e atrás, em radianos. */
const BALANCO = 0.3;

/** A dobra do cotovelo: maior quando o braço vem à frente. */
function dobra(alfa: number, andando: boolean): number {
  return andando ? 0.26 + 0.6 * Math.max(0, alfa) + 0.1 * Math.abs(alfa) : 0.2;
}
