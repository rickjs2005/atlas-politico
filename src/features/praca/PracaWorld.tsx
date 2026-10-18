"use client";

// A Praça do Mural na tela (docs/PRACA.md, D-153, D-154 e D-155): a
// composição. O estado do jogo vive aqui (o progresso, a janela aberta, o
// lugar próximo); as regras ficam em src/lib/praca, puras; a cena fica em
// useCena (ciclo de vida e eventos tipados); cada lugar tem a sua janela em
// janelas/; o que fica sobre a cena está em Hud. O progresso é gravado no
// navegador a cada mudança e a praça volta de onde parou. Sem WebGL, ou por
// escolha, os mesmos lugares aparecem como lista, com as mesmas janelas.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { camaraAberta, lugaresDeAgora, pautasDisponiveis, progressoInicial, situacaoDaMateria, situacaoDaPauta } from "@/lib/praca/regras";
import type { ConteudoDaPraca, ProgressoDaPraca } from "@/lib/praca/tipos";

import { Entrada } from "./Entrada";
import { BotaoDeAcao, Hud, rotuloDaAcao } from "./Hud";
import { Joystick } from "./Joystick";
import { ListaDaPraca } from "./ListaDaPraca";
import { COR_CEU } from "./cores";
import { Arquivo } from "./janelas/Arquivo";
import { Banca } from "./janelas/Banca";
import { Bilhete } from "./janelas/Bilhete";
import { Caderno } from "./janelas/Caderno";
import { Camara } from "./janelas/Camara";
import { Conversa } from "./janelas/Conversa";
import { Janela } from "./janelas/Janela";
import { Mural } from "./janelas/Mural";
import { apagarProgresso, assinarPreferencias, gravarPreferencias, gravarProgresso, lerDoNavegador, lerPreferenciasBruto, preferenciasDe, type PreferenciasDaPraca } from "./persistencia";
import type { PontoId } from "./scene";
import { bandeirasDaCena, useCena } from "./useCena";

export { CHAVE_DO_PROGRESSO } from "./persistencia";

type Etapa = "entrada" | "jogando";
type JanelaId = PontoId | "caderno";

export function PracaWorld({ conteudo }: { conteudo: ConteudoDaPraca }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const botaoDeAcao = useRef<HTMLButtonElement>(null);
  const posicao = useRef<{ x: number; z: number } | undefined>(undefined);
  const [etapa, setEtapa] = useState<Etapa>("entrada");
  const [semWebGL, setSemWebGL] = useState(false);
  const [perto, setPerto] = useState<PontoId | null>(null);
  const [janela, setJanela] = useState<JanelaId | null>(null);
  const [progresso, setProgresso] = useState<ProgressoDaPraca>(progressoInicial);
  const progressoRef = useRef(progresso);
  useEffect(() => {
    progressoRef.current = progresso;
  });

  // As preferências de desenho vêm do navegador, como fonte externa: no servidor, o padrão.
  const preferenciasBruto = useSyncExternalStore(assinarPreferencias, lerPreferenciasBruto, () => null);
  const preferencias = useMemo(() => preferenciasDe(preferenciasBruto), [preferenciasBruto]);
  const mudarPreferencias = useCallback((novas: PreferenciasDaPraca) => gravarPreferencias(novas), []);

  const semCena = semWebGL || preferencias.lista;

  // A cena vive enquanto a praça está na tela; ao sair da tela, a posição fica guardada.
  const { mundo, cena } = useCena({
    ativa: etapa === "jogando" && !semCena,
    canvas,
    posicao,
    progresso: progressoRef,
    conteudo,
    modoLeve: preferencias.modoLeve ? true : null,
    onPerto: setPerto,
    onFalha: () => setSemWebGL(true),
  });

  // O progresso salvo é lido quando a pessoa entra na praça; depois, cada mudança é gravada.
  const entrar = useCallback(() => {
    const salvo = lerDoNavegador(conteudo);
    if (salvo !== null) {
      setProgresso(salvo);
      posicao.current = salvo.posicao;
    }
    setEtapa("jogando");
  }, [conteudo]);
  useEffect(() => {
    if (etapa === "jogando") gravarProgresso(progresso, mundo.current?.getPosition() ?? posicao.current);
  }, [etapa, progresso, mundo]);
  // Ao sair da página, a posição de agora vai junto. Só depois de entrar: quem passa pela entrada e vai embora não apaga o que tinha salvo.
  useEffect(() => {
    if (etapa !== "jogando") return;
    const aoSair = () => gravarProgresso(progresso, mundo.current?.getPosition() ?? posicao.current);
    window.addEventListener("pagehide", aoSair);
    return () => window.removeEventListener("pagehide", aoSair);
  }, [etapa, progresso, mundo]);

  const disponiveis = useMemo(() => pautasDisponiveis(progresso, conteudo), [conteudo, progresso]);
  const publicadas = useMemo(() => disponiveis.filter((pauta) => situacaoDaPauta(progresso, pauta.id) === "publicada").length, [disponiveis, progresso]);
  const camaraEstaAberta = camaraAberta(progresso, conteudo);
  const atas = conteudo.materias.filter((materia) => situacaoDaMateria(progresso, materia.id) === "publicada").length;
  const bilheteNoChao = !progresso.itens.includes("bilhete");
  const lugares = lugaresDeAgora(progresso, conteudo);

  // As bandeiras vão para a cena quando mudam, e de novo quando a cena nasce.
  useEffect(() => {
    const bandeiras = bandeirasDaCena(progresso, conteudo);
    mundo.current?.setMural(bandeiras.publicadas);
    mundo.current?.setCamaraAberta(bandeiras.camaraAberta);
    mundo.current?.setAta(bandeiras.ataLavrada);
    mundo.current?.setBilhete(bandeiras.bilheteNoChao);
  }, [progresso, conteudo, mundo, cena.instancias]);
  // A cena para enquanto uma janela está aberta, e volta quando ela fecha.
  useEffect(() => {
    mundo.current?.setPaused(janela !== null || etapa !== "jogando");
  }, [janela, etapa, mundo, cena.instancias]);

  // Abrir uma janela guarda onde o personagem está: a cena para, e a posição serve à gravação.
  const abrir = (id: JanelaId) => {
    posicao.current = mundo.current?.getPosition() ?? posicao.current;
    setJanela(id);
  };
  const fechar = useCallback(() => {
    setJanela(null);
    window.requestAnimationFrame(() => (botaoDeAcao.current ?? raiz.current)?.focus());
  }, []);

  // "E" ou Enter fazem a ação do lugar em que o personagem está. A tecla é
  // assinada uma vez só, e lê o estado de agora de uma referência atualizada
  // antes da pintura: com o WebGL por software, um quadro lento atrasaria um
  // efeito comum, e a tecla cairia no vazio logo depois de o botão aparecer.
  const agora = useRef({ etapa, janela, perto });
  useLayoutEffect(() => {
    agora.current = { etapa, janela, perto };
  });
  useLayoutEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      const { etapa: fase, janela: aberta, perto: ponto } = agora.current;
      if (fase !== "jogando" || aberta !== null || ponto === null) return;
      if (evento.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT|A/.test(evento.target.tagName)) return;
      if (evento.key === "e" || evento.key === "E" || evento.key === "Enter") {
        posicao.current = mundo.current?.getPosition() ?? posicao.current;
        setJanela(ponto);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [mundo]);

  const recomecar = useCallback(() => {
    setProgresso(progressoInicial());
    posicao.current = undefined;
    apagarProgresso();
  }, []);

  if (etapa === "entrada") {
    return <Entrada conteudo={conteudo} preferencias={preferencias} onPreferencias={mudarPreferencias} onEntrar={entrar} onRecomecar={recomecar} />;
  }

  const rotulo = perto === null ? null : rotuloDaAcao(perto, camaraEstaAberta);
  const janelaProps = { conteudo, progresso, onProgresso: setProgresso, onFechar: fechar };

  return (
    <div
      ref={raiz}
      tabIndex={-1}
      className="palco relative h-[calc(100dvh-var(--atlas-header-h))] min-h-[480px] w-full overflow-hidden outline-none"
      style={{ backgroundColor: COR_CEU }}
      data-praca={semCena ? "lista" : "cena"}
      data-cena={semCena ? "lista" : cena.situacao}
      data-cena-instancias={cena.instancias}
      data-movimento={cena.reduzida ? "reduzido" : "normal"}
      data-modo-leve={cena.leve}
      data-publicadas={publicadas}
      data-atas={atas}
    >
      {semCena ? (
        <ListaDaPraca lugares={lugares} bilheteNoChao={bilheteNoChao} motivo={semWebGL ? "sem-webgl" : "escolha"} onAbrir={abrir} />
      ) : (
        <canvas ref={canvas} className="block h-full w-full touch-none" aria-label="Praça do Mural. Use o joystick ou as setas para andar até um lugar." />
      )}

      <Hud conteudo={conteudo} progresso={progresso} semCena={semCena} publicadas={publicadas} disponiveis={disponiveis.length} atas={atas} onAbrirCaderno={() => abrir("caderno")} />

      {perto !== null && janela === null && rotulo !== null && <BotaoDeAcao ref={botaoDeAcao} ponto={perto} rotulo={rotulo} onClick={() => abrir(perto)} />}

      {!semCena && janela === null && <Joystick onMove={(x, y) => mundo.current?.setStick(x, y)} />}

      {janela === "mural" && <Mural {...janelaProps} />}
      {janela === "padaria" && (
        <Janela titulo="Padaria da Zefa" id="padaria" onFechar={fechar}>
          <Conversa morador="zefa" conteudo={conteudo} progresso={progresso} onProgresso={setProgresso} onEncerrar={fechar} />
        </Janela>
      )}
      {janela === "banca" && <Banca {...janelaProps} />}
      {janela === "arquivo" && <Arquivo {...janelaProps} />}
      {janela === "bilhete" && <Bilhete onProgresso={setProgresso} onFechar={fechar} />}
      {janela === "camara" && <Camara {...janelaProps} />}
      {janela === "caderno" && <Caderno conteudo={conteudo} progresso={progresso} preferencias={preferencias} onPreferencias={mudarPreferencias} cenaPossivel={!semWebGL} onFechar={fechar} onRecomecar={recomecar} />}

      <p className="sr-only" aria-live="polite">
        {perto !== null && janela === null && rotulo !== null ? `Perto: ${rotulo}.` : ""}
      </p>
    </div>
  );
}
