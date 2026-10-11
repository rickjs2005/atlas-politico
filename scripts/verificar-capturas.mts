// Confere a integridade das capturas brutas dos acervos (docs/DATA-PIPELINE.md,
// seção Importação de decisões): para cada arquivo de `research/capturas/`, o
// resumo SHA-256 e o tamanho registrados têm de bater com o corpo original, e
// a resposta interpretada tem de corresponder a ele (`verificarCaptura`).
//
// Uso:
//   npm run capturas:verificar
//   npm run capturas:verificar -- --pasta <caminho>
//   npm run capturas:verificar -- --aceitar-legadas
//
// Sai com código 1 quando alguma captura está adulterada, não é JSON ou não
// tem o corpo original. Sem o corpo não há o que conferir, e tirar o corpo de
// um arquivo seria o jeito de esconder uma alteração: por isso reprova. O
// repositório não tem captura sem corpo. `--aceitar-legadas` existe para
// conferir uma pasta antiga de fora do repositório, e a verificação contínua
// não a usa: com ela, a captura sem corpo é listada como não verificável e não
// reprova. O resumo não prova a veracidade do documento, só que o arquivo
// guardado é o que foi capturado.

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { verificarCaptura, type Captura } from "@/lib/import/capturas";

const argumentos = process.argv.slice(2);
const aceitarLegadas = argumentos.includes("--aceitar-legadas");
const posicaoDaPasta = argumentos.indexOf("--pasta");
const pasta = path.resolve(posicaoDaPasta >= 0 && argumentos[posicaoDaPasta + 1] !== undefined ? argumentos[posicaoDaPasta + 1]! : path.join("research", "capturas"));
const arquivos = readdirSync(pasta)
  .filter((nome) => nome.endsWith(".json"))
  .sort();

let integras = 0;
let naoVerificaveis = 0;
let adulteradas = 0;
for (const nome of arquivos) {
  let captura: Captura;
  try {
    captura = JSON.parse(readFileSync(path.join(pasta, nome), "utf8")) as Captura;
  } catch (erro) {
    adulteradas += 1;
    console.log(`ADULTERADA       ${nome}: não é JSON (${(erro as Error).message})`);
    continue;
  }
  const resultado = verificarCaptura(captura);
  if (resultado.estado === "integra") {
    integras += 1;
    console.log(`íntegra          ${nome}`);
  } else if (resultado.estado === "nao-verificavel") {
    naoVerificaveis += 1;
    console.log(`${aceitarLegadas ? "não verificável " : "SEM CORPO       "} ${nome}: ${resultado.motivo}`);
  } else {
    adulteradas += 1;
    console.log(`ADULTERADA       ${nome}: ${resultado.motivo}`);
  }
}

console.log(`\n${arquivos.length} captura(s) em ${path.relative(process.cwd(), pasta) || "."}: ${integras} íntegra(s), ${naoVerificaveis} sem o corpo original, ${adulteradas} adulterada(s).`);
if (adulteradas > 0 || (naoVerificaveis > 0 && !aceitarLegadas)) process.exit(1);
