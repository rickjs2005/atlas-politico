// As três partes da comparação (D-155): o fragmento do endereço escolhe a
// parte, e os fragmentos antigos (as âncoras dos temas e das áreas) continuam
// valendo e abrem a parte certa.

import { describe, expect, it } from "vitest";

import { COMPARISON_SECTIONS, filterScope, sectionOfHash } from "@/features/comparison/sections";

describe("a parte da comparação pelo fragmento", () => {
  it("sem fragmento, ou com uma âncora da trajetória, é a trajetória", () => {
    for (const hash of ["", "#", "#trajetoria", "#resumo", "#trajetoria-lula", "#qualquer-coisa"]) expect(sectionOfHash(hash), hash).toBe("trajetoria");
  });

  it("as âncoras das decisões e dos temas abrem as decisões", () => {
    for (const hash of ["#decisoes", "#tema-economia", "#tema-outros-assuntos"]) expect(sectionOfHash(hash), hash).toBe("decisoes");
  });

  it("as âncoras das propostas e das áreas abrem as propostas", () => {
    for (const hash of ["#propostas", "#propostas-saude", "#propostas-economia"]) expect(sectionOfHash(hash), hash).toBe("propostas");
  });

  it("as três partes têm id, rótulo e descrição, na ordem trajetória, decisões, propostas", () => {
    expect(COMPARISON_SECTIONS.map((parte) => parte.id)).toEqual(["trajetoria", "decisoes", "propostas"]);
    for (const parte of COMPARISON_SECTIONS) expect(parte.descricao.length).toBeGreaterThan(10);
  });

  it("o alcance do recorte diz que só a trajetória segue o período e as categorias", () => {
    expect(filterScope("trajetoria")).toContain("valem");
    for (const parte of ["decisoes", "propostas"] as const) {
      expect(filterScope(parte)).toContain("não se aplicam");
      expect(filterScope(parte)).toContain("amostra inteira");
    }
  });
});
