// A praça: os lugares, as sessões, as pautas, a matéria da mesa da Câmara, as
// conversas, o bilhete e a credencial (docs/PRACA.md, D-153, D-154 e D-155).
// Tudo o que é ficção mora aqui, marcado como tal; o que é fato aponta um
// documento publicado pelo identificador, e um teste confere que cada ano
// escrito em uma pergunta está no documento apontado, e que os dois documentos
// de uma matéria citam a mesma proposição.
//
// As pautas variam o que se faz com o documento (D-155): a primeira de cada
// pessoa só pede para conferir a data (o tutorial: uma ação documentada antes
// de qualquer leitura jurídica); as seguintes pedem a nota de três campos, a
// natureza da ação entre documentos parecidos, ou a ordem de dois documentos
// pela data. Sempre uma pauta de cada tipo por pessoa.
//
// Regra das falas: ninguém da praça fala das pessoas retratadas, de partido ou
// de lado, nem escreve ano ou juízo; as conversas passam pela mesma validação
// do catálogo do Escrivão (src/lib/game/escrivao/validacao.ts). O que as
// pessoas da praça fazem é apontar onde procurar e dar o que têm.

import type { DialogGraph } from "@/lib/game/escrivao";

import type { ItemId, Lugar, Materia, MoradorId, Pauta, Sessao } from "./tipos";

export const LUGARES: readonly Lugar[] = [
  {
    id: "mural",
    nome: "Mural da praça",
    funcao: "Ler as perguntas dos moradores e fixar as notas conferidas.",
    morador: null,
    trancado: false,
  },
  {
    id: "padaria",
    nome: "Padaria da Zefa",
    funcao: "Ouvir quem sabe onde procurar.",
    morador: "zefa",
    trancado: false,
  },
  {
    id: "banca",
    nome: "Banca do Teodoro",
    funcao: "Ver os recortes de jornal, com a data de cada um.",
    morador: "teodoro",
    trancado: false,
  },
  {
    id: "arquivo",
    nome: "Arquivo",
    funcao: "Abrir as gavetas, por pessoa e por ano, e levar cópias dos documentos.",
    morador: "escrivao",
    trancado: false,
  },
  {
    id: "camara",
    nome: "Câmara",
    funcao: "Abre quando as pautas da primeira sessão estiverem no mural. Dentro, a sessão põe uma matéria na mesa.",
    morador: "lourdes",
    trancado: true,
  },
];

export const MORADORES: Record<MoradorId, { nome: string; papel: string }> = {
  zefa: {
    nome: "Zefa",
    papel: "dona da padaria, sabe de tudo que acontece na praça",
  },
  teodoro: {
    nome: "Teodoro",
    papel: "dono da banca, guarda recorte de jornal por data",
  },
  escrivao: {
    nome: "Escrivão",
    papel: "guarda as gavetas do arquivo, por pessoa e por ano",
  },
  lourdes: {
    nome: "Lourdes",
    papel: "secretária da Câmara, lavra a ata de toda sessão",
  },
};

export const ITENS: Record<ItemId, { nome: string; descricao: string }> = {
  bilhete: {
    nome: "Bilhete amassado",
    descricao: "Um bilhete achado no chão, perto do coreto. Diz quem está com a chave das gavetas do Senado.",
  },
  "chave-senado": {
    nome: "Chave das gavetas do Senado",
    descricao: "Abre as gavetas do Senado no arquivo. Estava com a Zefa.",
  },
  credencial: {
    nome: "Credencial de imprensa",
    descricao: "Abre a mesa de imprensa da Câmara. Chegou pelo correio da rádio, que nesta cidade vai parar na banca do Teodoro.",
  },
};

/** O que o bilhete diz, quando a pessoa o pega. Ficção da praça. */
export const BILHETE = "Zefa, me devolve a chave das gavetas do Senado. Sem ela eu não abro nada de lá. O Escrivão.";

/**
 * As sessões da praça. Cada uma tem as suas pautas, uma matéria da mesa quando
 * é na Câmara, e um portão: o item que a sessão pede e o que ele abre. A
 * segunda abre quando a primeira é concluída, e é ela que abre a Câmara.
 */
export const SESSOES: readonly Sessao[] = [
  {
    id: "mural",
    titulo: "Sessão 1 · As pautas do mural",
    abreCom: null,
    abreLugar: null,
    pautas: ["primeira-data-estadual", "primeira-data-planalto", "veto-regime-fiscal", "duas-pecs"],
    materia: null,
    portao: { item: "chave-senado", abre: "as gavetas do Senado" },
  },
  {
    id: "camara",
    titulo: "Sessão 2 · A sessão da Câmara",
    abreCom: "mural",
    abreLugar: "camara",
    pautas: ["bolsa-familia-medida", "duas-leis-de-2025", "lei-promulgada", "voto-contra-2024"],
    materia: "saida-temporaria",
    portao: { item: "credencial", abre: "a mesa de imprensa da Câmara" },
  },
];

/**
 * As pautas do mural, por sessão. As perguntas são de moradores inventados; o
 * que elas afirmam é só o que o documento apontado registra. Na primeira
 * sessão, o tutorial (conferir a data de um documento, um por pessoa) e a
 * nota de três campos (uma por pessoa). Na segunda, uma pauta de natureza e
 * uma de ordem por pessoa, tiradas de gavetas que a primeira não visita.
 */
export const PAUTAS: readonly Pauta[] = [
  {
    id: "primeira-data-estadual",
    sessao: "mural",
    pessoa: "flavio-bolsonaro",
    tipo: "campo",
    autor: "Dona Rute, da rádio",
    pergunta: "Para começar: o deputado estadual é autor de uma lei estadual de 2006, sobre laqueadura e vasectomia gratuitas. Em que data o arquivo registra essa lei? Leve a cópia e confira o campo Data.",
    objetivo: "Levar do arquivo a cópia da lei estadual de 2006 e conferir no mural a data que o campo Data registra.",
    resposta: "alerj-lei-4916-2006-autoria",
    comparar: [],
    detalhe: "objeto",
    gaveta: "alerj-2006",
    reacao: "Dona Rute conferiu a data com o dedo no papel e disse que agora a rádio tem repórter de verdade.",
  },
  {
    id: "primeira-data-planalto",
    sessao: "mural",
    pessoa: "lula",
    tipo: "campo",
    autor: "Dona Rute, da rádio",
    pergunta: "Para começar: em 2006 o Planalto sancionou uma lei sobre a violência doméstica e familiar contra a mulher. Em que data o arquivo registra essa lei? Leve a cópia e confira o campo Data.",
    objetivo: "Levar do arquivo a cópia da lei de 2006 do Planalto e conferir no mural a data que o campo Data registra.",
    resposta: "planalto-lei-11340-2006-violencia-contra-a-mulher",
    comparar: [],
    detalhe: "objeto",
    gaveta: "planalto-2006",
    reacao: "Dona Rute guardou a cópia na pasta da rádio e disse que pergunta de morador vem a seguir.",
  },
  {
    id: "veto-regime-fiscal",
    sessao: "mural",
    pessoa: "lula",
    tipo: "nota",
    autor: "Seu Nilton, da feira",
    pergunta: "Em 2023, a lei do novo regime fiscal foi sancionada com um veto a uma parte dela. Que documento registra isso, e o que ficou de fora?",
    objetivo: "Achar o ato de 2023 sobre o regime fiscal e fixar no mural o que foi vetado.",
    resposta: "planalto-lei-complementar-200-2023-regime-fiscal",
    comparar: ["planalto-decreto-11377-2023-intervencao-df"],
    detalhe: "dispositivos",
    gaveta: "planalto-2023",
    reacao: "Seu Nilton leu a lista do que ficou de fora duas vezes e dobrou a nota para levar à feira.",
  },
  {
    id: "duas-pecs",
    sessao: "mural",
    pessoa: "flavio-bolsonaro",
    tipo: "nota",
    autor: "Dona Márcia, da escola",
    pergunta: "O senador votou em segundo turno em duas propostas de emenda à Constituição, uma em 2023 e outra em 2024. Em qual delas o voto registrado foi contra?",
    objetivo: "Achar os dois votos em segundo turno, de 2023 e de 2024, e fixar no mural o que foi contra.",
    resposta: "senado-voto-6777-5894",
    comparar: ["senado-voto-6825-5894"],
    detalhe: "objeto",
    gaveta: "senado-2023",
    reacao: "Dona Márcia copiou a etapa e a data no caderno da escola, para mostrar à turma como se lê uma votação.",
  },
  {
    id: "bolsa-familia-medida",
    sessao: "camara",
    pessoa: "lula",
    tipo: "ordem",
    autor: "Dona Cida, do posto de saúde",
    pergunta: "Dois documentos do Planalto tratam do programa Bolsa Família: a medida provisória que o criou e a lei em que a medida se converteu. Qual dos dois foi registrado primeiro? Ache os dois no arquivo e ponha na ordem do campo Data.",
    objetivo: "Achar no arquivo a medida provisória que criou o programa e a lei em que ela virou, e fixar no mural os dois na ordem da data.",
    resposta: "planalto-mpv-132-2003-bolsa-familia",
    comparar: ["planalto-lei-10836-2004-bolsa-familia"],
    detalhe: "dispositivos",
    gaveta: "planalto-2003",
    reacao: "Dona Cida pregou a nota ao lado do cartaz da vacina e disse que agora o posto sabe qual papel veio antes.",
  },
  {
    id: "duas-leis-de-2025",
    sessao: "camara",
    pessoa: "lula",
    tipo: "natureza",
    autor: "Seu Arlindo, do sindicato",
    pergunta: "Em 2025, duas leis sobre tributos passaram pelo Planalto: uma instituiu o IBS e a CBS, e a outra instituiu a redução do imposto de renda e uma tributação mínima para altas rendas. Qual das duas foi sancionada sem veto, e o que o campo Ação dela registra?",
    objetivo: "Achar as duas leis de 2025 sobre tributos e fixar no mural a que foi sancionada sem veto, com a ação que ela registra.",
    resposta: "planalto-lei-15270-2025-imposto-de-renda",
    comparar: ["planalto-lei-complementar-214-2025-ibs-cbs"],
    detalhe: "objeto",
    gaveta: "planalto-2025",
    reacao: "Seu Arlindo sublinhou a palavra sanção e disse que no sindicato ninguém mais vai confundir com veto.",
  },
  {
    id: "lei-promulgada",
    sessao: "camara",
    pessoa: "flavio-bolsonaro",
    tipo: "ordem",
    autor: "Dona Nair, da autoescola",
    pergunta: "O deputado estadual é autor de duas leis estaduais: uma sobre certidão negativa de proteção ao crédito no ingresso ao serviço público, outra sobre os motivos de reprovação em exame psicológico para cargo público. Qual das duas foi registrada primeiro? Ache as duas no arquivo e ponha na ordem do campo Data.",
    objetivo: "Achar no arquivo as duas leis estaduais de autoria do deputado e fixar no mural as duas na ordem da data.",
    resposta: "alerj-lei-4250-2003-autoria",
    comparar: ["alerj-lei-5938-2011-autoria"],
    detalhe: "objeto",
    gaveta: "alerj-2003",
    reacao: "Dona Nair pediu uma cópia da nota para a parede da autoescola, com as duas datas em letra grande.",
  },
  {
    id: "voto-contra-2024",
    sessao: "camara",
    pessoa: "flavio-bolsonaro",
    tipo: "natureza",
    autor: "Seu Benedito, da oficina",
    pergunta: "Em 2024, o senador votou no substitutivo do projeto que instituiu o IBS e a CBS e no projeto que alterou a Lei de Execução Penal, sobre a saída temporária. Em qual dos dois o voto registrado foi contra, e o que o campo Ação dele registra?",
    objetivo: "Achar os dois votos de 2024, sobre os tributos e sobre a Lei de Execução Penal, e fixar no mural o que foi contra, com a ação que ele registra.",
    resposta: "senado-voto-6899-5894",
    comparar: ["senado-voto-6818-5894"],
    detalhe: "objeto",
    gaveta: "senado-2024",
    reacao: "Seu Benedito limpou as mãos no pano antes de pegar a nota e disse que voto a gente lê no papel, não no boato.",
  },
];

/**
 * A matéria da mesa da Câmara: um projeto que o senador votou e que o
 * presidente sancionou com veto parcial. Os dois documentos citam a mesma
 * proposição (teste). A ata mostra os dois lado a lado, e não compara posições.
 */
export const MATERIAS: readonly Materia[] = [
  {
    id: "saida-temporaria",
    sessao: "camara",
    titulo: "A saída temporária na Lei de Execução Penal",
    pergunta:
      "O projeto de lei de 2022 que alterou a Lei de Execução Penal, sobre a monitoração eletrônica do preso e a saída temporária, foi votado no Senado e depois virou lei, sancionada com veto a uma parte. A mesa pede os dois documentos lado a lado: o voto do senador e o ato do presidente, cada um com o que registra.",
    objetivo: "Levar à mesa da Câmara o voto de 2024 no Senado e o ato de 2024 no Planalto sobre a Lei de Execução Penal, e lavrar a ata.",
    proposicao: "senado-pl-2253-2022",
    lados: [
      { id: "senado", rotulo: "O voto no Senado", pessoa: "flavio-bolsonaro", documento: "senado-voto-6818-5894", gaveta: "senado-2024" },
      { id: "planalto", rotulo: "O ato no Planalto", pessoa: "lula", documento: "planalto-lei-14843-2024-saidas-temporarias", gaveta: "planalto-2024" },
    ],
  },
];

/** Os nós de conversa que entregam um item quando são alcançados. Cada nó só existe em um grafo. */
export const ITENS_POR_NO: Readonly<Record<string, ItemId>> = {
  "zefa-chave": "chave-senado",
  "teodoro-credencial": "credencial",
};

/**
 * As conversas, por morador e por momento. Cada uma é um grafo pequeno
 * (src/lib/game/escrivao/dialogo.ts): nós, escolhas e marcas. A situação da
 * praça decide qual grafo vale (src/lib/praca/regras.ts, `conversaDe`).
 */
export const CONVERSAS: Readonly<Record<string, DialogGraph>> = {
  "zefa-boas-vindas": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Você é da rádio nova? Que bom. O mural ali está cheio de pergunta e ninguém responde. Eu respondo pão de queijo; pergunta de papel não é comigo. Comece pelo recado da chefe da rádio: é só conferir uma data.",
        escolhas: [
          { id: "mural", texto: "Que perguntas?", proximo: "mural" },
          {
            id: "quem",
            texto: "Quem sabe das coisas por aqui?",
            proximo: "quem",
          },
        ],
      },
      mural: {
        id: "mural",
        texto: "Os moradores escrevem o que querem saber e pregam no mural. Quem responde tem de pregar o documento junto, senão o Teodoro arranca.",
        escolhas: [
          {
            id: "quem",
            texto: "Quem sabe das coisas por aqui?",
            proximo: "quem",
          },
        ],
      },
      quem: {
        id: "quem",
        texto:
          "Papel de cartório é com o Escrivão, no arquivo: ele separa as gavetas por pessoa e por ano. Data de jornal é com o Teodoro, na banca. E recado perdido no chão da praça é meu, pode trazer.",
        escolhas: [],
      },
    },
  },
  "zefa-chave": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Voltou? Achou alguma coisa no chão? O Escrivão vive deixando bilhete e esquecendo com quem deixou a chave.",
        escolhas: [
          {
            id: "bilhete",
            texto: "Achei um bilhete: ele pede a chave das gavetas do Senado.",
            proximo: "zefa-chave",
          },
          {
            id: "depois",
            texto: "Ainda não. Volto depois.",
            proximo: "depois",
          },
        ],
      },
      "zefa-chave": {
        id: "zefa-chave",
        texto: "Ah, essa. Estava na gaveta do balcão, embaixo do pão de ontem. Leva. E diz a ele que a padaria não é chaveiro.",
        escolhas: [],
      },
      depois: {
        id: "depois",
        texto: "Dá uma olhada perto do coreto. Vento forte, papel voa.",
        escolhas: [],
      },
    },
  },
  "zefa-sessao": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Viu o mural? Amanheceu cheio de pergunta nova. E a Câmara abriu a porta: a Lourdes está lá na escada, de pasta na mão, esperando alguém da imprensa.",
        escolhas: [
          { id: "quem", texto: "Quem é a Lourdes?", proximo: "quem" },
          { id: "ok", texto: "Vou lá.", proximo: "fim" },
        ],
      },
      quem: {
        id: "quem",
        texto: "A secretária da Câmara. Lavra ata de tudo, até de reunião que não acontece. Se tem papel na mesa, ela sabe de que gaveta veio.",
        escolhas: [{ id: "ok", texto: "Vou lá.", proximo: "fim" }],
      },
      fim: {
        id: "fim",
        texto: "Vai. Pão de queijo só sai do forno depois da sessão.",
        escolhas: [],
      },
    },
  },
  "zefa-fim": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Seis notas no mural e uma ata na Câmara. A praça nunca teve tanto papel bom. Hoje a padaria fecha cedo; volte na próxima edição, que pergunta não acaba.",
        escolhas: [],
      },
    },
  },
  "teodoro-recortes": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Recorte eu tenho de tudo, por data. Mas recorte diz o que aconteceu, não como alguém votou. Voto é papel do arquivo.",
        escolhas: [
          {
            id: "pec",
            texto: "Uma proposta de emenda à Constituição vai a voto mais de uma vez?",
            proximo: "pec",
            marca: "etapas",
          },
          { id: "ok", texto: "Entendi. Vou ao arquivo.", proximo: "fim" },
        ],
      },
      pec: {
        id: "pec",
        texto: "Vai, sim: em dois turnos em cada casa. Por isso a gaveta do Senado tem mais de um voto parecido. Olhe a etapa e a data antes de pregar qualquer coisa no mural.",
        escolhas: [{ id: "ok", texto: "Entendi. Vou ao arquivo.", proximo: "fim" }],
      },
      fim: { id: "fim", texto: "Vai. E não dobre os recortes.", escolhas: [] },
    },
  },
  "teodoro-credencial": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Chegou um envelope da rádio aqui na banca. O correio desta cidade acha que banca é agência. Tem um crachá dentro: credencial de imprensa, com o seu nome.",
        escolhas: [
          { id: "pegar", texto: "É minha. Pode dar.", proximo: "teodoro-credencial" },
          { id: "depois", texto: "Depois eu pego. Me mostre os recortes.", proximo: "fim" },
        ],
      },
      "teodoro-credencial": {
        id: "teodoro-credencial",
        texto: "Leva. E assina aqui, que eu não sou correio. Com isso a Lourdes deixa você sentar à mesa da Câmara.",
        escolhas: [],
      },
      fim: { id: "fim", texto: "Fica guardado. Recorte eu tenho de tudo, por data; não dobre.", escolhas: [] },
    },
  },
  "escrivao-gavetas": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Arquivo aberto. As gavetas vão por pessoa e por ano. As do Senado estão trancadas: perdi a chave outra vez, e deixei um bilhete para quem a tem.",
        escolhas: [
          {
            id: "ler",
            texto: "Como se lê um documento daqui?",
            proximo: "ler",
            marca: "leitura",
          },
          { id: "abrir", texto: "Me mostre as gavetas.", proximo: "fim" },
        ],
      },
      ler: {
        id: "ler",
        texto: "Cinco campos: a data, a instituição, o cargo, o objeto e a ação. Dois documentos parecidos quase sempre diferem em um deles. Leve uma cópia do que servir.",
        escolhas: [{ id: "abrir", texto: "Me mostre as gavetas.", proximo: "fim" }],
      },
      fim: {
        id: "fim",
        texto: "Pode abrir. Devolva na ordem, ou eu renumero tudo de novo.",
        escolhas: [],
      },
    },
  },
  "escrivao-com-chave": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "A chave! Eu sabia que estava com alguém que não sou eu. As gavetas do Senado estão abertas.",
        escolhas: [{ id: "abrir", texto: "Me mostre as gavetas.", proximo: "fim" }],
      },
      fim: { id: "fim", texto: "Pode abrir. Devolva na ordem.", escolhas: [] },
    },
  },
  "escrivao-materia": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "A Lourdes mandou avisar da mesa. Uma matéria que passa por duas pessoas deixa papel em duas gavetas: uma de voto, outra de sanção. O objeto dos dois diz a mesma coisa; a ação, não.",
        escolhas: [
          { id: "como", texto: "Como eu sei que são da mesma matéria?", proximo: "como", marca: "materia" },
          { id: "abrir", texto: "Me mostre as gavetas.", proximo: "fim" },
        ],
      },
      como: {
        id: "como",
        texto: "Pelo campo Objeto: a ementa é a mesma nos dois, palavra por palavra. O resto muda: a data, a instituição, o cargo e a ação. É assim que a ata se lavra.",
        escolhas: [{ id: "abrir", texto: "Me mostre as gavetas.", proximo: "fim" }],
      },
      fim: { id: "fim", texto: "Pode abrir. Devolva na ordem.", escolhas: [] },
    },
  },
  "lourdes-sessao": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Entrou? Então a corrente caiu mesmo. Eu sou a Lourdes, da secretaria: lavro a ata de toda sessão desta casa. A de hoje tem uma matéria só na mesa, e ela vem de longe.",
        escolhas: [
          { id: "materia", texto: "Que matéria?", proximo: "materia" },
          { id: "ata", texto: "O que é lavrar a ata?", proximo: "ata", marca: "ata" },
        ],
      },
      materia: {
        id: "materia",
        texto: "Está escrita na mesa, leia lá. O que eu sei: um documento é de voto e o outro é de sanção. Gaveta diferente, pessoa diferente, a mesma matéria.",
        escolhas: [
          { id: "ata", texto: "O que é lavrar a ata?", proximo: "ata", marca: "ata" },
          { id: "mesa", texto: "E como eu sento à mesa?", proximo: "mesa" },
        ],
      },
      ata: {
        id: "ata",
        texto: "Ata é o registro do que a sessão viu, campo por campo. Eu não escrevo opinião: copio o que cada documento diz e ponho a fonte embaixo.",
        escolhas: [{ id: "mesa", texto: "E como eu sento à mesa?", proximo: "mesa" }],
      },
      mesa: {
        id: "mesa",
        texto: "Com credencial de imprensa. A da rádio chegou pelo correio esta semana, e o correio desta cidade vai parar na banca do Teodoro. Vá buscar.",
        escolhas: [],
      },
    },
  },
  "lourdes-mesa": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Credencial no pescoço, mesa liberada. Traga os dois documentos da matéria e diga, de cada um, o que ele registra. Eu confiro com o papel na mão.",
        escolhas: [{ id: "ok", texto: "Vou à mesa.", proximo: "fim" }],
      },
      fim: { id: "fim", texto: "A mesa é sua. Não dobre a ata.", escolhas: [] },
    },
  },
  "lourdes-ata": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Ata lavrada, com os dois documentos grampeados. Esta casa nunca teve sessão tão bem documentada. O mural também amanheceu cheio: vá ver o que os moradores perguntaram.",
        escolhas: [],
      },
    },
  },
  "lourdes-fim": {
    inicio: "oi",
    nos: {
      oi: {
        id: "oi",
        texto: "Ata lavrada e mural respondido. Por hoje a sessão está encerrada; a próxima matéria chega com a próxima edição. Se quiser ver as duas trajetórias inteiras, o atlas está aberto.",
        escolhas: [],
      },
    },
  },
};
