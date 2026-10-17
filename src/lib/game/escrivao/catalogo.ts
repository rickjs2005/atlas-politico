// O catálogo de falas do Escrivão (D-127, revisto pela D-133). Escrito à mão,
// validado por teste (validacao.ts): toda fala tem sala, evento e camada; a
// instrução é curta e diz a ação de agora; o humor é ficção sobre papelada,
// carimbos, gavetas e o próprio Escrivão, igual para os dois personagens, sem
// citar pessoa, partido ou lado, sem data e sem juízo. Nenhuma fala repete
// fato: o que é do conteúdo publicado fica na fase e no registro. A seleção
// roda as falas pela vez de cada momento (selecao.ts).
//
// Convenção dos identificadores: <evento>-<sala>-<camada>-<n>.

import type { Fala } from "./types";

const fala = (id: string, sala: Fala["sala"], evento: Fala["evento"], camada: Fala["camada"], texto: string): Fala => ({ id, sala, evento, camada, texto });

// ---------------------------------------------------------------------------
// Entrada: a fase abriu
// ---------------------------------------------------------------------------

const ENTRADA: Fala[] = [
  fala("entrada-todas-instrucao-1", "todas", "entrada", "instrucao", "Toque na pasta em destaque, ou no botão Abrir o marco, para ler a explicação desta fase."),
  fala("entrada-todas-humor-1", "todas", "entrada", "humor", "Bem-vindo ao arquivo. Eu numerei as pastas, tirei o pó das estantes e perdi o lápis. Se encontrar um lápis, é meu."),
  fala("entrada-todas-humor-2", "todas", "entrada", "humor", "Cuidado com a pilha de papel ao lado da porta. Ela não faz parte da fase; faz parte da minha vida."),
  fala("entrada-todas-humor-3", "todas", "entrada", "humor", "Eu carimbo tudo o que entra aqui. Até o meu café tem protocolo."),

  fala("entrada-historico-instrucao-1", "historico", "entrada", "instrucao", "Toque na pasta em destaque, ou no botão Abrir o marco, para ler o que está documentado deste período."),
  fala("entrada-historico-humor-1", "historico", "entrada", "humor", "Organizei este período em ordem cronológica. Levou uma tarde e dois carimbos, um deles emprestado."),
  fala("entrada-historico-humor-2", "historico", "entrada", "humor", "As pastas antigas rangem quando abrem. Não é mistério: é cola de papel e falta de verba para pastas novas."),
  fala("entrada-historico-humor-3", "historico", "entrada", "humor", "Anos e anos de papel, e eu com uma régua só. Sigo firme."),

  fala("entrada-economia-instrucao-1", "economia", "entrada", "instrucao", "Este é um aprofundamento sobre decisões de Economia. Toque na pasta em destaque, ou no botão Abrir o marco, para ler a explicação."),
  fala("entrada-economia-humor-1", "economia", "entrada", "humor", "Nesta sala as pastas têm colunas, somas e carimbos. Eu só confiro se o papel está no lugar; as contas não são comigo."),
  fala("entrada-economia-humor-2", "economia", "entrada", "humor", "Pedi uma calculadora para o arquivo. Veio um ábaco e um memorando pedindo paciência."),
  fala("entrada-economia-humor-3", "economia", "entrada", "humor", "Guardo os papéis desta sala em ordem numérica. Já perdi a conta de quantas vezes recontei."),

  fala("entrada-seguranca-publica-instrucao-1", "seguranca-publica", "entrada", "instrucao", "Este é um aprofundamento sobre decisões de Segurança pública. Toque na pasta em destaque, ou no botão Abrir o marco, para ler a explicação."),
  fala("entrada-seguranca-publica-humor-1", "seguranca-publica", "entrada", "humor", "Nesta sala eu uso duas chaves para a mesma gaveta. Uma abre; a outra eu carrego por hábito."),
  fala("entrada-seguranca-publica-humor-2", "seguranca-publica", "entrada", "humor", "O cadeado do arquivo é só para o vento não levar os papéis. Já levou um memorando inteiro."),
  fala("entrada-seguranca-publica-humor-3", "seguranca-publica", "entrada", "humor", "Lacrei as pastas com fita. A fita acabou na terceira pasta, como sempre."),
];

// ---------------------------------------------------------------------------
// Ajuda: a pessoa abriu "Como funciona"
// ---------------------------------------------------------------------------

const AJUDA: Fala[] = [
  fala("ajuda-todas-instrucao-1", "todas", "ajuda", "instrucao", "Cada fase tem um marco, uma explicação curta e uma atividade. Responda, ou leia a explicação da resposta, e siga para a próxima. As outras pastas são opcionais."),
  fala("ajuda-todas-humor-1", "todas", "ajuda", "humor", "Perguntar ao arquivista é de graça. Preencher o formulário de pergunta, não; por isso eu respondo antes de você preencher."),
  fala("ajuda-todas-humor-2", "todas", "ajuda", "humor", "Eu também me perdi neste arquivo no primeiro dia. No segundo também. Hoje só me perco às quintas."),
  fala("ajuda-todas-humor-3", "todas", "ajuda", "humor", "Minha função é guiar; a de carimbar eu faço por gosto."),

  fala("ajuda-historico-instrucao-1", "historico", "ajuda", "instrucao", "A trajetória vai da origem à data de corte, uma fase por período. Nenhuma fase segura a seguinte: a lista de fases abre qualquer uma."),
  fala("ajuda-historico-humor-1", "historico", "ajuda", "humor", "Cada etiqueta eu confiro duas vezes. Não por desconfiança: é que a primeira vez eu estava sem óculos."),
  fala("ajuda-historico-humor-2", "historico", "ajuda", "humor", "Se uma pasta parece fora de ordem, não fui eu. Foi a gaveta, que tem opinião própria."),
  fala("ajuda-historico-humor-3", "historico", "ajuda", "humor", "Tenho um carimbo para cada década. O desta eu ainda não encontrei."),

  fala("ajuda-economia-instrucao-1", "economia", "ajuda", "instrucao", "Aqui cada decisão diz o cargo, a instituição, o que foi decidido e as fontes. Um voto e um ato do Executivo são coisas diferentes, e a explicação diz qual é qual."),
  fala("ajuda-economia-humor-1", "economia", "ajuda", "humor", "Não me peça para somar as colunas. Eu arquivo as colunas; somar é um departamento que fechou."),
  fala("ajuda-economia-humor-2", "economia", "ajuda", "humor", "O ábaco do arquivo tem uma conta solta. Uso como pesa-papéis e sigo em frente."),
  fala("ajuda-economia-humor-3", "economia", "ajuda", "humor", "Recibo de carimbo? Tenho um bloco inteiro. Nunca ninguém pediu."),

  fala("ajuda-seguranca-publica-instrucao-1", "seguranca-publica", "ajuda", "instrucao", "Aqui cada decisão diz o cargo, a instituição, o que foi decidido e as fontes. Um voto e um ato do Executivo são coisas diferentes, e a explicação diz qual é qual."),
  fala("ajuda-seguranca-publica-humor-1", "seguranca-publica", "ajuda", "humor", "A chave desta sala fica comigo. A cópia fica comigo também. O sistema tem falhas, admito."),
  fala("ajuda-seguranca-publica-humor-2", "seguranca-publica", "ajuda", "humor", "Protocolei a minha própria entrada hoje. Esqueci de assinar. Vou ter de me notificar."),
  fala("ajuda-seguranca-publica-humor-3", "seguranca-publica", "ajuda", "humor", "O lacre das pastas é fita adesiva comum. O que protege os papéis aqui é a minha teimosia."),
];

// ---------------------------------------------------------------------------
// Explorar: um registro opcional do período foi aberto
// ---------------------------------------------------------------------------

const EXPLORAR: Fala[] = [
  fala("explorar-todas-instrucao-1", "todas", "explorar", "instrucao", "Este registro é opcional: leia se quiser saber mais do período. Ele não é necessário para continuar."),
  fala("explorar-todas-humor-1", "todas", "explorar", "humor", "Mais uma pasta fora da estante. Eu arrumo depois. Eu sempre digo isso."),
  fala("explorar-todas-humor-2", "todas", "explorar", "humor", "Aberto e protocolado. O carimbo está meio torto, mas o conteúdo é o mesmo."),
  fala("explorar-todas-humor-3", "todas", "explorar", "humor", "Esta pasta estava embaixo de outras três. O arquivo tem suas camadas, como tudo aqui."),

  fala("explorar-historico-instrucao-1", "historico", "explorar", "instrucao", "Este registro é do mesmo período e é opcional. As fontes ficam no fim do cartão, com o trecho que sustenta cada parte."),
  fala("explorar-historico-humor-1", "historico", "explorar", "humor", "Pasta com data, resumo e fontes. Minhas três palavras favoritas depois de pausa para o café."),
  fala("explorar-historico-humor-2", "historico", "explorar", "humor", "Se o papel amarelou, não foi o tempo. Foi a luz da janela que eu insisto em não fechar."),
  fala("explorar-historico-humor-3", "historico", "explorar", "humor", "Guardo os acontecimentos em ordem de data. O resto da minha vida, nem tanto."),

  fala("explorar-economia-instrucao-1", "economia", "explorar", "instrucao", "Este registro é opcional. Em uma decisão, leia o cargo e a instituição, o que foi votado ou o tipo do ato, e as fontes."),
  fala("explorar-economia-humor-1", "economia", "explorar", "humor", "Esta pasta tem mais números do que o meu contracheque. E o meu contracheque é curto."),
  fala("explorar-economia-humor-2", "economia", "explorar", "humor", "Carimbei esta como conferida. Conferi o carimbo, não as contas; contas não são comigo."),
  fala("explorar-economia-humor-3", "economia", "explorar", "humor", "O papel almaço desta sala é o mais caro do arquivo. Ironia que eu registro, mas não comento."),

  fala("explorar-seguranca-publica-instrucao-1", "seguranca-publica", "explorar", "instrucao", "Este registro é opcional. Em uma decisão, leia o cargo e a instituição, o que foi votado ou o tipo do ato, e as fontes."),
  fala("explorar-seguranca-publica-humor-1", "seguranca-publica", "explorar", "humor", "Esta pasta estava na gaveta trancada. A chave estava na pasta. Eu sei, eu sei."),
  fala("explorar-seguranca-publica-humor-2", "seguranca-publica", "explorar", "humor", "Lacre rompido, pasta aberta, protocolo cumprido. Agora vem a parte difícil: ler."),
  fala("explorar-seguranca-publica-humor-3", "seguranca-publica", "explorar", "humor", "Guardo as cópias desta sala em um cofre. O cofre é uma caixa de sapato com cadeado. Funciona."),
];

// ---------------------------------------------------------------------------
// Erro: a resposta não era essa
// ---------------------------------------------------------------------------

const ERRO: Fala[] = [
  fala("erro-todas-instrucao-1", "todas", "erro", "instrucao", "Não era essa. Leia a explicação acima e tente de novo, ou siga adiante: errar não tira nada."),
  fala("erro-todas-humor-1", "todas", "erro", "humor", "Eu já arquivei um processo inteiro na gaveta errada. Levou um ano. Você errou uma vez; estamos longe do meu recorde."),
  fala("erro-todas-humor-2", "todas", "erro", "humor", "Errar e tentar de novo é o método do arquivo. O meu método, pelo menos."),
  fala("erro-todas-humor-3", "todas", "erro", "humor", "Nenhum carimbo se perde com um erro. A almofada de tinta continua cheia, à espera do fim da fase."),

  fala("erro-historico-instrucao-1", "historico", "erro", "instrucao", "Não era essa. A explicação acima diz o porquê, com o que a fase acabou de contar. Tente de novo ou siga adiante."),
  fala("erro-historico-humor-1", "historico", "erro", "humor", "Errar de gaveta faz parte do ofício. Eu leio a etiqueta com calma e, mesmo assim, abro a do lado."),
  fala("erro-historico-humor-2", "historico", "erro", "humor", "Confundir duas pastas é humano. Confundir a mesma pasta duas vezes é meu dia a dia."),
  fala("erro-historico-humor-3", "historico", "erro", "humor", "Tente de novo. O arquivo não fecha, e eu não tenho mais nada marcado."),

  fala("erro-economia-instrucao-1", "economia", "erro", "instrucao", "Não era essa. A explicação acima diz o que o registro documenta. Tente de novo ou siga adiante."),
  fala("erro-economia-humor-1", "economia", "erro", "humor", "Errei a soma do meu próprio vale-transporte durante meses. Um erro na pasta não me assusta."),
  fala("erro-economia-humor-2", "economia", "erro", "humor", "O ábaco aqui ao lado erra mais do que você. E ele nem tenta de novo."),
  fala("erro-economia-humor-3", "economia", "erro", "humor", "Releia a coluna certa. Eu digo isso para mim mesmo toda sexta, quando confiro a escala de limpeza."),

  fala("erro-seguranca-publica-instrucao-1", "seguranca-publica", "erro", "instrucao", "Não era essa. A explicação acima diz o que o registro documenta. Tente de novo ou siga adiante."),
  fala("erro-seguranca-publica-humor-1", "seguranca-publica", "erro", "humor", "Já tranquei a chave dentro da gaveta que ela abre. Erro de leitura é mais fácil de desfazer."),
  fala("erro-seguranca-publica-humor-2", "seguranca-publica", "erro", "humor", "O lacre não registra tentativas. Eu também não. Siga."),
  fala("erro-seguranca-publica-humor-3", "seguranca-publica", "erro", "humor", "Abra a pasta de novo. O cadeado é de enfeite, e a resposta está lá dentro."),
];

// ---------------------------------------------------------------------------
// Conclusão: a pessoa revê uma fase que já estava concluída
// ---------------------------------------------------------------------------

const CONCLUSAO: Fala[] = [
  fala("conclusao-todas-instrucao-1", "todas", "conclusao", "instrucao", "Fase concluída. Use Continuar para ir à próxima, ou explore os outros registros do período."),
  fala("conclusao-todas-humor-1", "todas", "conclusao", "humor", "Tudo lido e carimbado. Agora eu reorganizo a estante, o que leva o resto da semana."),
  fala("conclusao-todas-humor-2", "todas", "conclusao", "humor", "A porta abriu. Eu nunca sei onde deixei a chave dela; ainda bem que ela abre sozinha no fim da fase."),
  fala("conclusao-todas-humor-3", "todas", "conclusao", "humor", "Protocolo encerrado. Vou lavar a xícara e fingir que descanso."),

  fala("conclusao-historico-instrucao-1", "historico", "conclusao", "instrucao", "Fase concluída. Continuar leva ao período seguinte da trajetória, ou ao resumo."),
  fala("conclusao-historico-humor-1", "historico", "conclusao", "humor", "Mais um período em ordem. Eu guardo as pastas e você guarda o que leu; a divisão me parece justa."),
  fala("conclusao-historico-humor-2", "historico", "conclusao", "humor", "A estante deste período fica vazia e eu fico orgulhoso. Depois eu a reabasteço e fico cansado."),
  fala("conclusao-historico-humor-3", "historico", "conclusao", "humor", "Carimbo final nesta década. O carimbo da próxima eu ainda procuro."),

  fala("conclusao-economia-instrucao-1", "economia", "conclusao", "instrucao", "Fase concluída. Continuar leva à próxima fase deste aprofundamento, ou ao resumo."),
  fala("conclusao-economia-humor-1", "economia", "conclusao", "humor", "Fechei a sala das colunas sem somar nada. Dia de glória para o arquivo."),
  fala("conclusao-economia-humor-2", "economia", "conclusao", "humor", "Devolvo o ábaco ao almoxarifado com um memorando de agradecimento. Ele não fez nada, mas é educado."),
  fala("conclusao-economia-humor-3", "economia", "conclusao", "humor", "Pastas numeradas, estante vazia, carimbo guardado. A porta pode abrir."),

  fala("conclusao-seguranca-publica-instrucao-1", "seguranca-publica", "conclusao", "instrucao", "Fase concluída. Continuar leva à próxima fase deste aprofundamento, ou ao resumo."),
  fala("conclusao-seguranca-publica-humor-1", "seguranca-publica", "conclusao", "humor", "Gaveta vazia, lacre refeito, chave no bolso certo. Hoje foi um bom dia."),
  fala("conclusao-seguranca-publica-humor-2", "seguranca-publica", "conclusao", "humor", "Tranco esta sala com a fita que sobrou. Sobrou pouca; a porta vai ficar entreaberta, como de costume."),
  fala("conclusao-seguranca-publica-humor-3", "seguranca-publica", "conclusao", "humor", "Protocolo cumprido e cadeado fechado. O cadeado é de enfeite, mas o protocolo não."),
];

// ---------------------------------------------------------------------------
// Carimbo: a fase acabou de ser concluída, e o carimbo dela entrou no passaporte
// ---------------------------------------------------------------------------
//
// Poucas falas, de propósito (D-150). A instrução confirma o registro, sem
// elogio e sem nota, e é a mesma em contexto sensível; o humor é sobre o
// carimbo e a caderneta, e nunca sobre o que a fase contou. As salas usam o
// humor de reserva, que roda pela ordem do carimbo entre os da pessoa: a
// primeira fala não conta carimbos, porque é a do primeiro, e "Mais um" fica
// para o terceiro.

const CARIMBO: Fala[] = [
  fala("carimbo-todas-instrucao-1", "todas", "carimbo", "instrucao", "Fase concluída: o carimbo dela está no seu passaporte. Use Continuar para ir à próxima, ou explore os outros registros do período."),
  fala("carimbo-todas-humor-1", "todas", "carimbo", "humor", "Carimbei com capricho. A almofada de tinta é nova; o carimbo, nem tanto."),
  fala("carimbo-todas-humor-2", "todas", "carimbo", "humor", "Página carimbada. Soprei a tinta para secar, como manda o regulamento que eu mesmo escrevi."),
  fala("carimbo-todas-humor-3", "todas", "carimbo", "humor", "Mais um carimbo. Esta caderneta está ficando mais organizada que a minha mesa."),

  fala("carimbo-historico-instrucao-1", "historico", "carimbo", "instrucao", "Fase concluída: o carimbo dela está no seu passaporte. Continuar leva ao período seguinte da trajetória, ou ao resumo."),
  fala("carimbo-economia-instrucao-1", "economia", "carimbo", "instrucao", "Fase concluída: o carimbo dela está no seu passaporte. O botão abaixo leva à fase seguinte deste aprofundamento ou, no fim dele, ao resumo."),
  fala("carimbo-seguranca-publica-instrucao-1", "seguranca-publica", "carimbo", "instrucao", "Fase concluída: o carimbo dela está no seu passaporte. O botão abaixo leva à fase seguinte deste aprofundamento ou, no fim dele, ao resumo."),
];

// ---------------------------------------------------------------------------
// Missão de investigação (D-151): a sala "O documento diz o quê?"
// ---------------------------------------------------------------------------
//
// A instrução de cada momento diz o passo da missão: falar com o Escrivão,
// abrir a gaveta, montar o dossiê, relacionar as fichas. O humor é sobre
// fichas, grampos e gavetas, como nas outras salas. A conversa que abre a
// missão, com as escolhas da pessoa, fica em dialogo.ts.

const INVESTIGACAO: Fala[] = [
  fala("entrada-investigacao-instrucao-1", "investigacao", "entrada", "instrucao", "Esta é uma missão de investigação. Fale com o Escrivão, ou toque no botão abaixo, para receber as fichas e saber o que conferir."),
  fala("entrada-investigacao-humor-1", "investigacao", "entrada", "humor", "Recebi as fichas em um envelope sem remetente. O envelope eu guardei; a dúvida, eu passo adiante."),
  fala("entrada-investigacao-humor-2", "investigacao", "entrada", "humor", "A gaveta de hoje range mais que as outras. Não é mau sinal: é só mais papel."),
  fala("entrada-investigacao-humor-3", "investigacao", "entrada", "humor", "Grampeador novo, grampo velho. Cada ficha vai receber o documento dela, se alguém encontrar o documento."),

  fala("ajuda-investigacao-instrucao-1", "investigacao", "ajuda", "instrucao", "Fale com o Escrivão, abra a gaveta e guarde no dossiê os documentos úteis. Na mesa, relacione cada ficha ao documento que a sustenta e aponte o campo do trecho destacado."),
  fala("ajuda-investigacao-humor-1", "investigacao", "ajuda", "humor", "O quadro na parede tem os cinco campos. Eu escrevi a lista três vezes; na quarta, plastifiquei."),
  fala("ajuda-investigacao-humor-2", "investigacao", "ajuda", "humor", "Dossiê é só uma pasta mais gorda. O nome é para o carimbo caber."),
  fala("ajuda-investigacao-humor-3", "investigacao", "ajuda", "humor", "Guardar documento demais no dossiê não é erro. Eu guardo até o recibo do café."),

  fala("explorar-investigacao-instrucao-1", "investigacao", "explorar", "instrucao", "Este documento é da gaveta. Leia os campos: a data, a instituição, o cargo, o objeto e a ação. Se parecer útil, guarde no dossiê."),
  fala("explorar-investigacao-humor-1", "investigacao", "explorar", "humor", "Tirei esta pasta de baixo de outras quatro. As outras quatro voltaram para o lugar, mais ou menos."),
  fala("explorar-investigacao-humor-2", "investigacao", "explorar", "humor", "Papel timbrado, carimbo e data. Se tivesse cheiro de café, era a minha mesa."),
  fala("explorar-investigacao-humor-3", "investigacao", "explorar", "humor", "Leio um campo de cada vez. Quando leio dois, troco a data pela instituição e preciso recomeçar."),

  fala("erro-investigacao-instrucao-1", "investigacao", "erro", "instrucao", "Não era esse. O aviso acima diz em que campos o documento escolhido não bate com a ficha. Confira outro documento do dossiê, ou siga pela explicação."),
  fala("erro-investigacao-humor-1", "investigacao", "erro", "humor", "Já grampeei o documento errado atrás de uma ficha. O grampo saiu; a vergonha ficou no arquivo."),
  fala("erro-investigacao-humor-2", "investigacao", "erro", "humor", "Dois documentos parecidos são a especialidade desta gaveta. A diferença está em um campo, sempre."),
  fala("erro-investigacao-humor-3", "investigacao", "erro", "humor", "Confira de novo. O dossiê não cobra tentativa, e eu não cobro hora extra."),

  fala("conclusao-investigacao-instrucao-1", "investigacao", "conclusao", "instrucao", "Missão concluída. As fichas estão conferidas, com o documento de cada uma. Use o botão abaixo para ver o resumo."),
  fala("conclusao-investigacao-humor-1", "investigacao", "conclusao", "humor", "Fichas grampeadas, dossiê fechado. Agora eu procuro onde deixei o grampeador."),
  fala("conclusao-investigacao-humor-2", "investigacao", "conclusao", "humor", "Dossiê arquivado na gaveta certa. Foi na primeira tentativa, o que é raro por aqui."),
  fala("conclusao-investigacao-humor-3", "investigacao", "conclusao", "humor", "Caso encerrado. O próximo envelope já está na mesa; o café, ainda não."),

  fala("carimbo-investigacao-instrucao-1", "investigacao", "carimbo", "instrucao", "Missão concluída: o carimbo dela está no seu passaporte. O botão abaixo leva ao resumo, com a explicação e as fontes de cada documento."),
];

export const CATALOGO: readonly Fala[] = [...ENTRADA, ...AJUDA, ...EXPLORAR, ...ERRO, ...CONCLUSAO, ...CARIMBO, ...INVESTIGACAO];
