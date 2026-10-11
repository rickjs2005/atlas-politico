// O Escrivão: o catálogo de falas obedece às regras (três camadas, sala e
// evento, sem pessoa, partido, data ou juízo; instrução de reserva e humor
// suficiente em todo evento), a seleção é determinística, controla a
// repetição pelo histórico, só preenche a camada documental com os dados do
// registro e cala o humor quando a preferência manda.

import { describe, expect, it } from "vitest";

import { CATALOGO, ESCRIVAO_EVENTS, ESCRIVAO_NOME, MINIMO_DE_HUMOR, candidatas, menosRecente, preencher, registrarDitas, selectLines, validateCatalog, type Fala, type Momento } from "@/lib/game/escrivao";
import { ROOM_IDS } from "@/lib/game/rooms";

const momento = (mudancas: Partial<Momento> = {}): Momento => ({ sala: "historico", evento: "entrada", humor: true, vistas: [], ...mudancas });

describe("catálogo do Escrivão", () => {
  it("é válido: toda fala tem sala, evento e camada conhecidos, e as regras de conteúdo valem para todas", () => {
    expect(validateCatalog(CATALOGO)).toEqual([]);
    expect(ESCRIVAO_NOME).toBe("Escrivão");
  });

  it("todo evento tem instrução própria em cada sala, humor de reserva em número suficiente e pelo menos uma fala documental", () => {
    for (const evento of ESCRIVAO_EVENTS) {
      for (const sala of ROOM_IDS) expect(candidatas(CATALOGO, sala, evento, "instrucao").some((fala) => fala.sala === sala), `${evento} ${sala}`).toBe(true);
      expect(CATALOGO.filter((fala) => fala.evento === evento && fala.sala === "todas" && fala.camada === "humor").length, evento).toBeGreaterThanOrEqual(MINIMO_DE_HUMOR);
      if (evento !== "erro") expect(CATALOGO.some((fala) => fala.evento === evento && fala.camada === "documental"), evento).toBe(true);
    }
  });

  it("a validação recusa fala que cita pessoa, partido, data, juízo ou fala atribuída, e catálogo sem reserva", () => {
    const base: Fala = { id: "x", sala: "todas", evento: "entrada", camada: "humor", texto: "Uma fala qualquer sobre carimbos." };
    const problemasDe = (texto: string) => validateCatalog([...CATALOGO, { ...base, texto }]);
    expect(problemasDe("O Lula passou por aqui.").join(" ")).toMatch(/pessoa, partido ou lado/);
    expect(problemasDe("Isso foi em 1989, eu lembro.").join(" ")).toMatch(/ano ou data/);
    expect(problemasDe("Ele disse que sim.").join(" ")).toMatch(/atribui fala/);
    expect(problemasDe("O culpado era o grampeador.").join(" ")).toMatch(/juízo/);
    expect(problemasDe("Uma pausa — e seguimos.").join(" ")).toMatch(/travessão/);
    expect(problemasDe("Veja {titulo}.").join(" ")).toMatch(/só a camada documental/);
    expect(validateCatalog([...CATALOGO, { ...base, id: "entrada-todas-humor-1" }]).join(" ")).toMatch(/repetido/);
    expect(validateCatalog([...CATALOGO, { ...base, camada: "documental", texto: "Sem campo nenhum." }]).join(" ")).toMatch(/sem campo/);
    expect(validateCatalog([...CATALOGO, { ...base, camada: "documental", texto: "Campo {inventado}." }]).join(" ")).toMatch(/campo desconhecido/);
    // Sem o reserva de um evento, a validação aponta o evento.
    expect(validateCatalog(CATALOGO.filter((fala) => !(fala.evento === "erro" && fala.sala === "todas"))).join(" ")).toMatch(/evento erro: sem instrução de reserva/);
  });

  it("nenhuma fala de humor nem de instrução escreve ano, e as documentais só têm campos conhecidos", () => {
    for (const fala of CATALOGO) {
      if (fala.camada !== "documental") expect(fala.texto, fala.id).not.toMatch(/\b(?:1[89]|20)\d{2}\b/);
      else expect(fala.texto, fala.id).toMatch(/\{[a-zA-Z]+\}/);
    }
  });
});

describe("seleção das falas", () => {
  it("devolve a instrução sempre, a documental só com os dados e o humor só com a preferência ligada, nessa ordem", () => {
    const semDados = selectLines(momento());
    expect(semDados.map((fala) => fala.camada)).toEqual(["instrucao", "humor"]);
    const comDados = selectLines(momento({ dados: { capitulo: "Teste", registros: "3 registros", periodo: "2000 a 2001" } }));
    expect(comDados.map((fala) => fala.camada)).toEqual(["instrucao", "documental", "humor"]);
    expect(comDados[1]!.texto).toContain("3 registros");
    const semHumor = selectLines(momento({ humor: false, dados: { capitulo: "Teste", registros: "3 registros", periodo: "2000 a 2001" } }));
    expect(semHumor.map((fala) => fala.camada)).toEqual(["instrucao", "documental"]);
    expect(semHumor.some((fala) => fala.camada === "humor")).toBe(false);
  });

  it("prefere as falas da sala e cai no reserva quando a sala não tem a sua", () => {
    const historico = selectLines(momento({ sala: "historico" }));
    expect(historico[0]!.id).toMatch(/^entrada-historico-instrucao/);
    const economia = selectLines(momento({ sala: "economia", evento: "descoberta" }));
    expect(economia[0]!.id).toMatch(/^descoberta-economia-instrucao/);
    // Uma sala sem humor próprio em um evento usa o reserva.
    const soReserva: Fala[] = [
      { id: "i", sala: "todas", evento: "erro", camada: "instrucao", texto: "Releia." },
      { id: "h1", sala: "todas", evento: "erro", camada: "humor", texto: "Um." },
      { id: "h2", sala: "todas", evento: "erro", camada: "humor", texto: "Dois." },
    ];
    expect(selectLines(momento({ sala: "economia", evento: "erro" }), soReserva).map((fala) => fala.id)).toEqual(["i", "h1"]);
  });

  it("roda as falas pelo histórico: a não dita vem antes, depois a dita há mais tempo; o mesmo histórico dá a mesma fala", () => {
    const humorDe = (vistas: string[]) => selectLines(momento({ sala: "historico", evento: "erro", vistas })).find((fala) => fala.camada === "humor")!.id;
    const primeira = humorDe([]);
    const segunda = humorDe([primeira]);
    const terceira = humorDe([primeira, segunda]);
    expect(new Set([primeira, segunda, terceira]).size).toBe(3);
    // Com as três ditas, volta a primeira, que é a dita há mais tempo.
    expect(humorDe([primeira, segunda, terceira])).toBe(primeira);
    expect(humorDe([primeira, segunda, terceira])).toBe(humorDe([primeira, segunda, terceira]));
    // O histórico cresce com o que foi dito, na ordem.
    const ditas = selectLines(momento({ evento: "erro" }));
    expect(registrarDitas(["antes"], ditas)).toEqual(["antes", ...ditas.map((fala) => fala.id)]);
  });

  it("menosRecente e preencher são previsíveis", () => {
    const falas: Fala[] = [
      { id: "a", sala: "todas", evento: "ajuda", camada: "humor", texto: "A" },
      { id: "b", sala: "todas", evento: "ajuda", camada: "humor", texto: "B" },
    ];
    expect(menosRecente(falas, [])!.id).toBe("a");
    expect(menosRecente(falas, ["a"])!.id).toBe("b");
    expect(menosRecente(falas, ["a", "b"])!.id).toBe("a");
    expect(menosRecente(falas, ["b", "a"])!.id).toBe("b");
    expect(menosRecente([], [])).toBeNull();
    expect(preencher("Registro de {data}: {titulo}.", { data: "hoje", titulo: "X" })).toBe("Registro de hoje: X.");
    expect(preencher("Registro de {data}: {titulo}.", { data: "hoje" })).toBeNull();
  });

  it("uma fala documental que pede campo ausente fica de fora, e outra que cabe entra", () => {
    const ditas = selectLines(momento({ sala: "economia", evento: "descoberta", dados: { data: "1º de janeiro de 2000", cargo: "Cargo", instituicao: "Casa", tipoDoAto: "Decreto" } }));
    const documental = ditas.find((fala) => fala.camada === "documental")!;
    expect(documental.id).toBe("descoberta-economia-documental-2");
    expect(documental.texto).toContain("Decreto");
  });
});
