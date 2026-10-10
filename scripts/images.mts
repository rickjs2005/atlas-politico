// Prepara os retratos antes do build (docs/PERFORMANCE.md, seção Imagens).
//
//   npm run images          gera as versões em public/media/derivados/ e o manifesto
//   npm run images:check    confere se as versões estão em dia; não gera nada
//
// O original cadastrado em content/published/imagens.json não é alterado: é a
// fonte, com crédito e condições de uso. Cada retrato de perfil vira um
// conjunto de arquivos WebP, recortados na proporção de cada moldura e em
// várias larguras. O enquadramento de cada um está em scripts/images.config.json.
//
// O manifesto (src/lib/media/portraits.manifest.json) guarda de que original
// e de que configuração cada conjunto saiu. `images:check` roda antes de `dev`
// e de `build`: se um retrato mudou e as versões não foram refeitas, o comando
// para e diz o que fazer. A conferência não usa a biblioteca de imagem.
//
// Código de saída: 0 quando deu certo, 1 quando as versões estão desatualizadas.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  DERIVED_DIR,
  PORTRAIT_FORMAT,
  PORTRAIT_QUALITY,
  PORTRAIT_SHAPES,
  derivedHeight,
  derivedPath,
  derivedQuality,
  type PortraitShape,
} from "@/lib/media/portraits";
import { stableStringify } from "@/lib/publication/stable-json";

interface Box {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

interface ImageRecord {
  id: string;
  arquivo: string;
  dimensoes?: { largura: number; altura: number };
}

interface ManifestEntry {
  origem: string;
  sha256: string;
  enquadramento: Record<PortraitShape, Box>;
  arquivos: Record<string, number>;
}

interface Manifest {
  formato: string;
  qualidade: typeof PORTRAIT_QUALITY;
  molduras: Record<PortraitShape, { codigo: string; proporcao: readonly [number, number]; larguras: readonly number[] }>;
  imagens: Record<string, ManifestEntry>;
}

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_DIR = path.join(PUBLIC_DIR, DERIVED_DIR);
const MANIFEST_FILE = path.join(ROOT, "src/lib/media/portraits.manifest.json");
const CONFIG_FILE = path.join(ROOT, "scripts/images.config.json");
const SHAPES = Object.keys(PORTRAIT_SHAPES) as PortraitShape[];

const readJson = <T,>(arquivo: string): T => JSON.parse(readFileSync(arquivo, "utf8")) as T;
const publicFile = (caminho: string) => path.join(PUBLIC_DIR, caminho);

/** Os retratos de perfil: as imagens que alguma pessoa da edição usa. */
function listPortraits(): ImageRecord[] {
  const pessoas = readJson<{ retratoId: string | null }[]>(path.join(ROOT, "content/published/pessoas.json"));
  const imagens = readJson<ImageRecord[]>(path.join(ROOT, "content/published/imagens.json"));
  const usadas = new Set(pessoas.map((pessoa) => pessoa.retratoId).filter((id) => id !== null));
  return imagens.filter((imagem) => usadas.has(imagem.id)).sort((a, b) => (a.id < b.id ? -1 : 1));
}

/** Sem enquadramento configurado: a maior área na proporção, a partir do topo e centralizada. */
function defaultBox(imagem: ImageRecord, shape: PortraitShape): Box {
  const { dimensoes } = imagem;
  if (!dimensoes) throw new Error(`A imagem ${imagem.id} não declara dimensões, e não tem enquadramento em scripts/images.config.json.`);
  const [w, h] = PORTRAIT_SHAPES[shape].proporcao;
  const largura = Math.min(dimensoes.largura, Math.floor((dimensoes.altura * w) / h));
  const altura = Math.floor((largura * h) / w);
  return { x: Math.floor((dimensoes.largura - largura) / 2), y: 0, largura, altura };
}

function checkBox(imagem: ImageRecord, shape: PortraitShape, box: Box) {
  const [w, h] = PORTRAIT_SHAPES[shape].proporcao;
  const desvio = Math.abs(box.largura / box.altura - w / h);
  if (desvio > 0.005) {
    throw new Error(`Enquadramento de ${imagem.id} (${shape}): ${box.largura}×${box.altura} não está na proporção ${w}:${h}.`);
  }
  const { dimensoes } = imagem;
  if (dimensoes && (box.x < 0 || box.y < 0 || box.x + box.largura > dimensoes.largura || box.y + box.altura > dimensoes.altura)) {
    throw new Error(`Enquadramento de ${imagem.id} (${shape}) sai do arquivo, que tem ${dimensoes.largura}×${dimensoes.altura}.`);
  }
  const maior = Math.max(...PORTRAIT_SHAPES[shape].larguras);
  if (box.largura < maior) {
    throw new Error(`Enquadramento de ${imagem.id} (${shape}) tem ${box.largura} px de largura, menos do que a maior versão (${maior} px).`);
  }
}

/** O que o manifesto deve dizer, tirando o tamanho dos arquivos gerados. */
function expected(): Manifest {
  const config = readJson<{ enquadramentos: Record<string, Partial<Record<PortraitShape, Box>>> }>(CONFIG_FILE);
  const imagens: Manifest["imagens"] = {};
  for (const imagem of listPortraits()) {
    const origem = publicFile(imagem.arquivo);
    if (!existsSync(origem)) throw new Error(`Arquivo original ausente: public${imagem.arquivo}`);
    const enquadramento = Object.fromEntries(
      SHAPES.map((shape) => {
        const box = config.enquadramentos[imagem.id]?.[shape] ?? defaultBox(imagem, shape);
        checkBox(imagem, shape, box);
        return [shape, box];
      }),
    ) as Record<PortraitShape, Box>;
    imagens[imagem.id] = {
      origem: imagem.arquivo,
      sha256: createHash("sha256").update(readFileSync(origem)).digest("hex"),
      enquadramento,
      arquivos: {},
    };
  }
  return {
    formato: PORTRAIT_FORMAT,
    qualidade: PORTRAIT_QUALITY,
    molduras: Object.fromEntries(
      SHAPES.map((shape) => {
        const { codigo, proporcao, larguras } = PORTRAIT_SHAPES[shape];
        return [shape, { codigo, proporcao, larguras }];
      }),
    ) as Manifest["molduras"],
    imagens,
  };
}

const filesOf = (id: string) =>
  SHAPES.flatMap((shape) => PORTRAIT_SHAPES[shape].larguras.map((largura) => ({ shape, largura, caminho: derivedPath(id, shape, largura) })));

async function generate() {
  const { default: sharp } = await import("sharp");
  const manifesto = expected();
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const gerados = new Set<string>();
  for (const [id, entrada] of Object.entries(manifesto.imagens)) {
    for (const { shape, largura, caminho } of filesOf(id)) {
      const box = entrada.enquadramento[shape];
      const destino = publicFile(caminho);
      await sharp(publicFile(entrada.origem))
        .extract({ left: box.x, top: box.y, width: box.largura, height: box.altura })
        .resize(largura, derivedHeight(shape, largura), { kernel: "lanczos3" })
        .webp({ quality: derivedQuality(largura), effort: 6 })
        .toFile(destino);
      entrada.arquivos[caminho] = statSync(destino).size;
      gerados.add(path.basename(destino));
    }
  }

  // O que sobrou de uma configuração anterior não fica publicado.
  for (const nome of readdirSync(OUTPUT_DIR)) {
    if (!gerados.has(nome)) rmSync(path.join(OUTPUT_DIR, nome));
  }

  writeFileSync(MANIFEST_FILE, `${stableStringify(manifesto)}\n`);

  for (const [id, entrada] of Object.entries(manifesto.imagens)) {
    const original = statSync(publicFile(entrada.origem)).size;
    const tamanhos = Object.values(entrada.arquivos);
    console.log(
      `${id}: ${tamanhos.length} versões, de ${(Math.min(...tamanhos) / 1024).toFixed(1)} a ${(Math.max(...tamanhos) / 1024).toFixed(1)} KB (original: ${(original / 1024).toFixed(0)} KB)`,
    );
  }
  console.log(`Manifesto gravado em ${path.relative(ROOT, MANIFEST_FILE)}`);
}

function check(): string[] {
  if (!existsSync(MANIFEST_FILE)) return ["O manifesto dos retratos não existe."];
  const atual = readJson<Manifest>(MANIFEST_FILE);
  const esperado = expected();
  const problemas: string[] = [];

  const semArquivos = (manifesto: Manifest) => ({
    ...manifesto,
    imagens: Object.fromEntries(Object.entries(manifesto.imagens).map(([id, entrada]) => [id, { ...entrada, arquivos: {} }])),
  });
  if (stableStringify(semArquivos(atual)) !== stableStringify(semArquivos(esperado))) {
    problemas.push("Um retrato, o enquadramento ou as larguras mudaram desde a última geração.");
  }

  const previstos = new Set<string>();
  for (const id of Object.keys(esperado.imagens)) {
    for (const { caminho } of filesOf(id)) {
      previstos.add(path.basename(caminho));
      const arquivo = publicFile(caminho);
      if (!existsSync(arquivo)) problemas.push(`Falta a versão public${caminho}.`);
      else if (atual.imagens[id]?.arquivos[caminho] !== statSync(arquivo).size) {
        problemas.push(`A versão public${caminho} não é a que o manifesto registra.`);
      }
    }
  }
  if (existsSync(OUTPUT_DIR)) {
    for (const nome of readdirSync(OUTPUT_DIR)) {
      if (!previstos.has(nome)) problemas.push(`Arquivo sem uso em public${DERIVED_DIR}/: ${nome}.`);
    }
  }
  return problemas;
}

try {
  if (process.argv.includes("--check")) {
    const problemas = check();
    if (problemas.length > 0) {
      console.error("As versões dos retratos estão desatualizadas:");
      for (const problema of problemas) console.error(`  - ${problema}`);
      console.error("Rode `npm run images` e confira o resultado antes de continuar.");
      process.exit(1);
    }
    console.log("Retratos: versões em dia.");
  } else {
    await generate();
  }
} catch (erro) {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
}
