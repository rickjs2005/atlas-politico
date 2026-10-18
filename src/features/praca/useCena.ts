"use client";

// O ciclo de vida da cena 3D da praça (D-152, D-155): criada quando a pessoa
// entra, descartada quando sai (laço parado, recursos soltos, contexto
// perdido), recriada no canvas novo com a posição e as bandeiras guardadas.
// A cena fala com a interface por eventos tipados, só quando algo muda; a
// interface manda bandeiras para a cena por efeitos, e não a cada quadro.

import { useEffect, useRef, useState, type RefObject } from "react";

import { camaraAberta, pautasDisponiveis, situacaoDaMateria, situacaoDaPauta } from "@/lib/praca/regras";
import type { ConteudoDaPraca, ProgressoDaPraca } from "@/lib/praca/tipos";

import type { PontoId, PracaEvento, PracaHandle } from "./scene";

export interface EstadoDaCena {
  situacao: "carregando" | "pronta" | "parada";
  /** Quantas vezes a cena nasceu: os testes conferem que sair e voltar recria tudo. */
  instancias: number;
  reduzida: boolean;
  /** O modo leve que valeu na criação: pedido pela pessoa ou decidido pelo aparelho. */
  leve: boolean;
}

/** As bandeiras que a cena desenha, tiradas do progresso. */
export function bandeirasDaCena(progresso: ProgressoDaPraca, conteudo: ConteudoDaPraca) {
  return {
    publicadas: pautasDisponiveis(progresso, conteudo).filter((pauta) => situacaoDaPauta(progresso, pauta.id) === "publicada").length,
    camaraAberta: camaraAberta(progresso, conteudo),
    ataLavrada: conteudo.materias.filter((materia) => situacaoDaMateria(progresso, materia.id) === "publicada").length > 0,
    bilheteNoChao: !progresso.itens.includes("bilhete"),
  };
}

interface Parametros {
  ativa: boolean;
  canvas: RefObject<HTMLCanvasElement | null>;
  /** Onde o personagem parou: a cena nasce aí e devolve a posição ao morrer. */
  posicao: RefObject<{ x: number; z: number } | undefined>;
  progresso: RefObject<ProgressoDaPraca>;
  conteudo: ConteudoDaPraca;
  /** `null` deixa o aparelho decidir. */
  modoLeve: boolean | null;
  onPerto: (id: PontoId | null) => void;
  onFalha: () => void;
}

export function useCena({ ativa, canvas, posicao, progresso, conteudo, modoLeve, onPerto, onFalha }: Parametros) {
  const mundo = useRef<PracaHandle | null>(null);
  const [cena, setCena] = useState<EstadoDaCena>({ situacao: "carregando", instancias: 0, reduzida: false, leve: false });
  const onPertoRef = useRef(onPerto);
  const onFalhaRef = useRef(onFalha);
  useEffect(() => {
    onPertoRef.current = onPerto;
    onFalhaRef.current = onFalha;
  });

  useEffect(() => {
    if (!ativa) return;
    const alvo = canvas.current;
    if (alvo === null) return;
    let cancelado = false;
    let instancia: PracaHandle | null = null;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const aoEvento = (evento: PracaEvento) => {
      if (evento.tipo === "perto") onPertoRef.current(evento.id);
    };
    import("./scene")
      .then(({ createPraca, aparelhoFraco }) => {
        if (cancelado) return;
        try {
          const leve = modoLeve ?? aparelhoFraco();
          instancia = createPraca(alvo, { onEvento: aoEvento }, { reduzirMovimento: reduzir, modoLeve: leve, posicaoInicial: posicao.current, ...bandeirasDaCena(progresso.current, conteudo) });
          mundo.current = instancia;
          setCena((anterior) => ({ situacao: "pronta", instancias: anterior.instancias + 1, reduzida: reduzir, leve }));
        } catch {
          onFalhaRef.current();
        }
      })
      .catch(() => onFalhaRef.current());
    return () => {
      cancelado = true;
      if (instancia !== null) {
        posicao.current = instancia.getPosition();
        instancia.dispose();
      }
      if (mundo.current === instancia) mundo.current = null;
      onPertoRef.current(null);
      setCena((anterior) => ({ ...anterior, situacao: "parada" }));
    };
  }, [ativa, canvas, posicao, progresso, conteudo, modoLeve]);

  return { mundo, cena };
}
