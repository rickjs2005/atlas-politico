// Requisições aos acervos oficiais, com ritmo, nova tentativa e relato. Só o
// comando de importação usa isto; o build normal não consulta rede.
//
// Regras observadas na pesquisa dos contratos (docs/DATA-PIPELINE.md, seção
// Importação de decisões): o Senado limita a 10 requisições por segundo e
// devolve 429 ou 503 sob carga; a Câmara não documenta limite; os dois
// respondem a pedidos com cabeçalhos de navegador. Aqui o ritmo fica em no
// máximo quatro requisições por segundo, com espera crescente a cada falha.

export interface HttpResult {
  url: string;
  status: number;
  texto: string;
  tentativas: number;
}

export interface HttpOptions {
  /** Tentativas além da primeira. */
  tentativas?: number;
  /** Intervalo mínimo entre requisições, em milissegundos. */
  intervaloMs?: number;
  /** Para os testes: a função que faz a requisição. */
  fetchImpl?: typeof fetch;
  /** Para os testes: a espera. */
  esperar?: (ms: number) => Promise<void>;
  /** Para o relato: cada requisição e o que respondeu. */
  aoResponder?: (resultado: HttpResult) => void;
}

const CABECALHOS = {
  "User-Agent": "Mozilla/5.0 (compatible; atlas-politico/0.1; +https://github.com/rickjs2005/atlas-politico)",
  Accept: "application/json",
};

const RETENTAVEIS = new Set([408, 425, 429, 500, 502, 503, 504]);

const dormir = (ms: number) => new Promise<void>((pronto) => setTimeout(pronto, ms));

let ultimaRequisicao = 0;

/**
 * Busca um JSON com nova tentativa em 429, 5xx e falha de rede, esperando 1,
 * 3 e 9 segundos (ou o `Retry-After`). Devolve o texto como chegou: quem
 * chama guarda a captura e interpreta.
 */
export async function fetchTexto(url: string, options: HttpOptions = {}): Promise<HttpResult> {
  const tentativas = options.tentativas ?? 3;
  const intervalo = options.intervaloMs ?? 250;
  const fetchImpl = options.fetchImpl ?? fetch;
  const esperar = options.esperar ?? dormir;

  let ultimoErro: unknown = null;
  for (let tentativa = 0; tentativa <= tentativas; tentativa += 1) {
    const agora = Date.now();
    const falta = ultimaRequisicao + intervalo - agora;
    if (falta > 0) await esperar(falta);
    ultimaRequisicao = Date.now();

    try {
      const resposta = await fetchImpl(url, { headers: CABECALHOS, redirect: "follow" });
      const texto = await resposta.text();
      const resultado: HttpResult = { url, status: resposta.status, texto, tentativas: tentativa + 1 };
      options.aoResponder?.(resultado);
      if (!RETENTAVEIS.has(resposta.status) || tentativa === tentativas) return resultado;
      const retryAfter = Number(resposta.headers.get("retry-after"));
      await esperar(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 3 ** tentativa);
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa === tentativas) break;
      await esperar(1000 * 3 ** tentativa);
    }
  }
  throw new Error(`Falha de rede em ${url} depois de ${tentativas + 1} tentativas: ${ultimoErro instanceof Error ? ultimoErro.message : String(ultimoErro)}`);
}
