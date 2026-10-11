// O catálogo de falas do Escrivão (D-127). Escrito à mão, validado por teste
// (validacao.ts): toda fala tem sala, evento e camada; a instrução diz o que
// fazer; a documental só repete campos do registro publicado; o humor é
// ficção sobre papelada, carimbos, gavetas e o próprio Escrivão, igual para
// os dois personagens, sem citar pessoa, partido ou lado, sem data e sem
// juízo. A seleção roda as falas pelo histórico (selecao.ts).
//
// Convenção dos identificadores: <evento>-<sala>-<camada>-<n>.

import type { Fala } from "./types";

const fala = (id: string, sala: Fala["sala"], evento: Fala["evento"], camada: Fala["camada"], texto: string): Fala => ({ id, sala, evento, camada, texto });

// ---------------------------------------------------------------------------
// Entrada: o capítulo abriu
// ---------------------------------------------------------------------------

const ENTRADA: Fala[] = [
  fala("entrada-todas-instrucao-1", "todas", "entrada", "instrucao", "Os registros deste capítulo estão espalhados pelo cenário. Chegue perto de um deles e use a tecla E, ou o botão de interação, para recolher. A saída abre com todos recolhidos e a tarefa cumprida."),
  fala("entrada-todas-documental-1", "todas", "entrada", "documental", "Capítulo {capitulo}: {registros}, de {periodo}."),
  fala("entrada-todas-humor-1", "todas", "entrada", "humor", "Bem-vindo ao arquivo. Eu numerei as pastas, tirei o pó das estantes e perdi o lápis. Se encontrar um lápis, é meu."),
  fala("entrada-todas-humor-2", "todas", "entrada", "humor", "Cuidado com a pilha de papel ao lado da porta. Ela não faz parte do capítulo; faz parte da minha vida."),
  fala("entrada-todas-humor-3", "todas", "entrada", "humor", "Eu carimbo tudo o que entra aqui. Até o meu café tem protocolo."),

  fala("entrada-historico-instrucao-1", "historico", "entrada", "instrucao", "Esta sala guarda a trajetória por período. Cada pasta no cenário é um acontecimento publicado no atlas, com data e fontes. Recolha todas e cumpra a tarefa do capítulo para a passagem abrir."),
  fala("entrada-historico-documental-1", "historico", "entrada", "documental", "Neste capítulo da trajetória há {registros}, de {periodo}."),
  fala("entrada-historico-humor-1", "historico", "entrada", "humor", "Organizei este período em ordem cronológica. Levou uma tarde e três carimbos de data, um deles emprestado."),
  fala("entrada-historico-humor-2", "historico", "entrada", "humor", "As pastas antigas rangem quando abrem. Não é mistério: é cola de papel e falta de verba para pastas novas."),
  fala("entrada-historico-humor-3", "historico", "entrada", "humor", "Anos e anos de papel, e eu com uma régua só. Sigo firme."),

  fala("entrada-economia-instrucao-1", "economia", "entrada", "instrucao", "Esta sala reúne decisões documentadas no tema Economia: votos registrados e atos do Executivo. Cada pasta diz o cargo, a instituição, a data, o que foi decidido e as fontes. Recolha todas e cumpra a tarefa para a passagem abrir."),
  fala("entrada-economia-documental-1", "economia", "entrada", "documental", "Nesta sala há {registros}, de {periodo}."),
  fala("entrada-economia-humor-1", "economia", "entrada", "humor", "Nesta sala as pastas têm colunas, somas e carimbos. Eu só confiro se o papel está no lugar; as contas não são comigo."),
  fala("entrada-economia-humor-2", "economia", "entrada", "humor", "Pedi uma calculadora para o arquivo. Veio um ábaco e um memorando pedindo paciência."),
  fala("entrada-economia-humor-3", "economia", "entrada", "humor", "Guardo os papéis desta sala em ordem numérica. Já perdi a conta de quantas vezes recontei."),

  fala("entrada-seguranca-publica-instrucao-1", "seguranca-publica", "entrada", "instrucao", "Esta sala reúne decisões documentadas no tema Segurança pública: votos registrados e atos do Executivo. Cada pasta diz o cargo, a instituição, a data, o que foi decidido e as fontes. Recolha todas e cumpra a tarefa para a passagem abrir."),
  fala("entrada-seguranca-publica-documental-1", "seguranca-publica", "entrada", "documental", "Nesta sala há {registros}, de {periodo}."),
  fala("entrada-seguranca-publica-humor-1", "seguranca-publica", "entrada", "humor", "Nesta sala eu uso duas chaves para a mesma gaveta. Uma abre; a outra eu carrego por hábito."),
  fala("entrada-seguranca-publica-humor-2", "seguranca-publica", "entrada", "humor", "O cadeado do arquivo é só para o vento não levar os papéis. Já levou um memorando inteiro."),
  fala("entrada-seguranca-publica-humor-3", "seguranca-publica", "entrada", "humor", "Lacrei as pastas com fita. A fita acabou na terceira pasta, como sempre."),
];

// ---------------------------------------------------------------------------
// Ajuda: a pessoa procurou o Escrivão
// ---------------------------------------------------------------------------

const AJUDA: Fala[] = [
  fala("ajuda-todas-instrucao-1", "todas", "ajuda", "instrucao", "O objetivo do capítulo está acima. Recolha os registros no cenário, ou pelo painel Capítulos e tarefas, e responda a tarefa quando ela pedir. Errar explica e deixa tentar de novo, sem penalidade."),
  fala("ajuda-todas-documental-1", "todas", "ajuda", "documental", "Registros recolhidos até agora: {recolhidos}."),
  fala("ajuda-todas-humor-1", "todas", "ajuda", "humor", "Perguntar ao arquivista é de graça. Preencher o formulário de pergunta, não; por isso eu respondo antes de você preencher."),
  fala("ajuda-todas-humor-2", "todas", "ajuda", "humor", "Eu também me perdi neste arquivo no primeiro dia. No segundo também. Hoje só me perco às quintas."),
  fala("ajuda-todas-humor-3", "todas", "ajuda", "humor", "Minha função é guiar; a de carimbar eu faço por gosto."),

  fala("ajuda-historico-instrucao-1", "historico", "ajuda", "instrucao", "Cada registro traz a data na precisão documentada e as fontes com o trecho que o sustenta. A tarefa pede o que está escrito no registro: leia o cartão antes de responder."),
  fala("ajuda-historico-documental-1", "historico", "ajuda", "documental", "Neste capítulo da trajetória: {recolhidos} registros recolhidos."),
  fala("ajuda-historico-humor-1", "historico", "ajuda", "humor", "Datas eu confiro duas vezes. Não por desconfiança: é que a primeira vez eu estava sem óculos."),
  fala("ajuda-historico-humor-2", "historico", "ajuda", "humor", "Se uma pasta parece fora de ordem, não foi eu. Foi a estagiária que nunca existiu."),
  fala("ajuda-historico-humor-3", "historico", "ajuda", "humor", "Tenho um carimbo para cada década. O desta eu ainda não encontrei."),

  fala("ajuda-economia-instrucao-1", "economia", "ajuda", "instrucao", "Em cada decisão desta sala, leia o cargo e a instituição, o objeto votado ou o tipo do ato, a manifestação registrada e as fontes. A tarefa pergunta exatamente isso."),
  fala("ajuda-economia-documental-1", "economia", "ajuda", "documental", "Nesta sala: {recolhidos} registros recolhidos."),
  fala("ajuda-economia-humor-1", "economia", "ajuda", "humor", "Não me peça para somar as colunas. Eu arquivo as colunas; somar é um departamento que fechou."),
  fala("ajuda-economia-humor-2", "economia", "ajuda", "humor", "O ábaco do arquivo tem uma conta solta. Uso como pesa-papéis e sigo em frente."),
  fala("ajuda-economia-humor-3", "economia", "ajuda", "humor", "Recibo de carimbo? Tenho um bloco inteiro. Nunca ninguém pediu."),

  fala("ajuda-seguranca-publica-instrucao-1", "seguranca-publica", "ajuda", "instrucao", "Em cada decisão desta sala, leia o cargo e a instituição, o objeto votado ou o tipo do ato, a manifestação registrada e as fontes. A tarefa pergunta exatamente isso."),
  fala("ajuda-seguranca-publica-documental-1", "seguranca-publica", "ajuda", "documental", "Nesta sala: {recolhidos} registros recolhidos."),
  fala("ajuda-seguranca-publica-humor-1", "seguranca-publica", "ajuda", "humor", "A chave desta sala fica comigo. A cópia fica comigo também. O sistema tem falhas, admito."),
  fala("ajuda-seguranca-publica-humor-2", "seguranca-publica", "ajuda", "humor", "Protocolei a minha própria entrada hoje. Esqueci de assinar. Vou ter de me notificar."),
  fala("ajuda-seguranca-publica-humor-3", "seguranca-publica", "ajuda", "humor", "O lacre das pastas é fita adesiva comum. O que protege os papéis aqui é a minha teimosia."),
];

// ---------------------------------------------------------------------------
// Descoberta: um registro foi recolhido
// ---------------------------------------------------------------------------

const DESCOBERTA: Fala[] = [
  fala("descoberta-todas-instrucao-1", "todas", "descoberta", "instrucao", "Leia o registro: a data, o resumo e as fontes com o trecho que o sustenta. O que a tarefa perguntar está aqui."),
  fala("descoberta-todas-documental-1", "todas", "descoberta", "documental", "Registro de {data}: {titulo}. Fontes citadas: {fontes}."),
  fala("descoberta-todas-humor-1", "todas", "descoberta", "humor", "Mais uma pasta fora da estante. Eu arrumo depois. Eu sempre digo isso."),
  fala("descoberta-todas-humor-2", "todas", "descoberta", "humor", "Recolhido e protocolado. O carimbo está meio torto, mas o conteúdo é o mesmo."),
  fala("descoberta-todas-humor-3", "todas", "descoberta", "humor", "Esta pasta estava embaixo de outras três. O arquivo tem suas camadas, como tudo aqui."),

  fala("descoberta-historico-instrucao-1", "historico", "descoberta", "instrucao", "Repare na precisão da data: quando só o ano está documentado, o registro diz isso, e a ordem em relação a outro pode ficar em aberto. Leia as fontes antes de seguir."),
  // As decisões da trajetória vêm antes do modelo geral: os campos de cargo e manifestação só existem nelas, e um acontecimento cai no modelo geral.
  fala("descoberta-historico-documental-1", "historico", "descoberta", "documental", "Decisão de {data}, pelo cargo de {cargo} ({instituicao}): {manifestacao}. Fontes citadas: {fontes}."),
  fala("descoberta-historico-documental-2", "historico", "descoberta", "documental", "Ato de {data}, pelo cargo de {cargo} ({instituicao}): {tipoDoAto}. Fontes citadas: {fontes}."),
  fala("descoberta-historico-documental-3", "historico", "descoberta", "documental", "Da trajetória, em {data}: {titulo}. Fontes citadas: {fontes}."),
  fala("descoberta-historico-humor-1", "historico", "descoberta", "humor", "Pasta com data, resumo e fontes. Minhas três palavras favoritas depois de pausa para o café."),
  fala("descoberta-historico-humor-2", "historico", "descoberta", "humor", "Se o papel amarelou, não foi o tempo. Foi a luz da janela que eu insisto em não fechar."),
  fala("descoberta-historico-humor-3", "historico", "descoberta", "humor", "Guardo os acontecimentos em ordem de data. O resto da minha vida, nem tanto."),

  fala("descoberta-economia-instrucao-1", "economia", "descoberta", "instrucao", "Leia o cargo e a instituição pelos quais a decisão foi tomada, o objeto votado ou o tipo do ato, a manifestação registrada com o valor original do acervo e as fontes. Uma decisão só é comparável a outra com essas diferenças à vista."),
  fala("descoberta-economia-documental-1", "economia", "descoberta", "documental", "Decisão de {data}, pelo cargo de {cargo} ({instituicao}): {manifestacao}."),
  fala("descoberta-economia-documental-2", "economia", "descoberta", "documental", "Ato de {data}, pelo cargo de {cargo} ({instituicao}): {tipoDoAto}."),
  fala("descoberta-economia-humor-1", "economia", "descoberta", "humor", "Esta pasta tem mais números do que o meu contracheque. E o meu contracheque é curto."),
  fala("descoberta-economia-humor-2", "economia", "descoberta", "humor", "Carimbei esta como conferida. Conferi o carimbo, não as contas; contas não são comigo."),
  fala("descoberta-economia-humor-3", "economia", "descoberta", "humor", "O papel almaço desta sala é o mais caro do arquivo. Ironia que eu registro, mas não comento."),

  fala("descoberta-seguranca-publica-instrucao-1", "seguranca-publica", "descoberta", "instrucao", "Leia o cargo e a instituição pelos quais a decisão foi tomada, o objeto votado ou o tipo do ato, a manifestação registrada com o valor original do acervo e as fontes. Uma decisão só é comparável a outra com essas diferenças à vista."),
  fala("descoberta-seguranca-publica-documental-1", "seguranca-publica", "descoberta", "documental", "Decisão de {data}, pelo cargo de {cargo} ({instituicao}): {manifestacao}."),
  fala("descoberta-seguranca-publica-documental-2", "seguranca-publica", "descoberta", "documental", "Ato de {data}, pelo cargo de {cargo} ({instituicao}): {tipoDoAto}."),
  fala("descoberta-seguranca-publica-humor-1", "seguranca-publica", "descoberta", "humor", "Esta pasta estava na gaveta trancada. A chave estava na pasta. Eu sei, eu sei."),
  fala("descoberta-seguranca-publica-humor-2", "seguranca-publica", "descoberta", "humor", "Lacre rompido, pasta aberta, protocolo cumprido. Agora vem a parte difícil: ler."),
  fala("descoberta-seguranca-publica-humor-3", "seguranca-publica", "descoberta", "humor", "Guardo as cópias desta sala em um cofre. O cofre é uma caixa de sapato com cadeado. Funciona."),
];

// ---------------------------------------------------------------------------
// Fonte: conferir o documento que sustenta um registro
// ---------------------------------------------------------------------------

const FONTE: Fala[] = [
  fala("fonte-todas-instrucao-1", "todas", "fonte", "instrucao", "Indique o documento que sustenta este registro. A lista de fontes está no próprio registro, com o trecho que cada uma sustenta; os outros documentos são de outros registros do capítulo."),
  fala("fonte-todas-documental-1", "todas", "fonte", "documental", "O registro {titulo} cita {fontes}."),
  fala("fonte-todas-humor-1", "todas", "fonte", "humor", "Sem documento, não há registro; há boato. E boato eu não arquivo, por falta de pasta adequada."),
  fala("fonte-todas-humor-2", "todas", "fonte", "humor", "Um carimbo de conferido vale mais do que dez promessas. Eu tenho o carimbo; as promessas ficam com os outros."),
  fala("fonte-todas-humor-3", "todas", "fonte", "humor", "Fonte é o papel que diz onde está escrito. Minha fonte favorita diz onde está o café."),

  fala("fonte-historico-instrucao-1", "historico", "fonte", "instrucao", "O documento certo é citado pelo registro, com onde está o trecho e o que ele sustenta. Compare a lista do registro com as opções antes de confirmar."),
  fala("fonte-historico-documental-1", "historico", "fonte", "documental", "Para {titulo}, o atlas cita {fontes}."),
  fala("fonte-historico-humor-1", "historico", "fonte", "humor", "Confiro fontes como quem confere troco: devagar, duas vezes e com cara de quem já se enganou."),
  fala("fonte-historico-humor-2", "historico", "fonte", "humor", "Documento antigo tem cheiro de papel e de paciência. Os dois acabam."),
  fala("fonte-historico-humor-3", "historico", "fonte", "humor", "Na dúvida, abra a pasta de novo. Eu abro a minha gaveta de novo todos os dias e ainda me surpreendo."),

  fala("fonte-economia-instrucao-1", "economia", "fonte", "instrucao", "O documento certo é o que o registro da decisão cita: o acervo oficial da casa ou o texto do ato. Compare a lista do registro com as opções antes de confirmar."),
  fala("fonte-economia-documental-1", "economia", "fonte", "documental", "A decisão {titulo} cita {fontes}."),
  fala("fonte-economia-humor-1", "economia", "fonte", "humor", "Planilha sem fonte é desenho. Eu arquivo desenhos em outra sala, com giz de cera."),
  fala("fonte-economia-humor-2", "economia", "fonte", "humor", "O documento oficial tem número, data e assinatura. Meu bilhete de almoço tem só a mancha de café."),
  fala("fonte-economia-humor-3", "economia", "fonte", "humor", "Confiro a referência duas vezes. Na terceira, já é teimosia, e eu respeito a teimosia."),

  fala("fonte-seguranca-publica-instrucao-1", "seguranca-publica", "fonte", "instrucao", "O documento certo é o que o registro da decisão cita: o acervo oficial da casa ou o texto do ato. Compare a lista do registro com as opções antes de confirmar."),
  fala("fonte-seguranca-publica-documental-1", "seguranca-publica", "fonte", "documental", "A decisão {titulo} cita {fontes}."),
  fala("fonte-seguranca-publica-humor-1", "seguranca-publica", "fonte", "humor", "Documento conferido é documento trancado. Tranco com fita adesiva, mas o sentido é esse."),
  fala("fonte-seguranca-publica-humor-2", "seguranca-publica", "fonte", "humor", "Sem fonte, a gaveta não fecha. É a única regra de segurança que eu aplico com rigor."),
  fala("fonte-seguranca-publica-humor-3", "seguranca-publica", "fonte", "humor", "O protocolo manda conferir a origem do papel. O meu protocolo manda conferir se o papel ainda está lá."),
];

// ---------------------------------------------------------------------------
// Erro: a resposta não era essa
// ---------------------------------------------------------------------------

const ERRO: Fala[] = [
  fala("erro-todas-instrucao-1", "todas", "erro", "instrucao", "Não era essa. A resposta está escrita no registro recolhido: abra-o de novo pelo painel e compare. Não há penalidade."),
  fala("erro-todas-humor-1", "todas", "erro", "humor", "Eu já arquivei um processo inteiro na gaveta errada. Levou um ano. Você errou uma vez; estamos longe do meu recorde."),
  fala("erro-todas-humor-2", "todas", "erro", "humor", "Errar e tentar de novo é o método do arquivo. O meu método, pelo menos."),
  fala("erro-todas-humor-3", "todas", "erro", "humor", "Nenhum carimbo foi gasto com esse erro. Eu guardo os carimbos para os acertos."),

  fala("erro-historico-instrucao-1", "historico", "erro", "instrucao", "Não era essa. Releia a data e as fontes do registro: a ordem vem das datas, e o documento vem da lista de fontes. Não há penalidade."),
  fala("erro-historico-humor-1", "historico", "erro", "humor", "Datas enganam até quem vive entre elas. Eu já comemorei um aniversário no mês errado."),
  fala("erro-historico-humor-2", "historico", "erro", "humor", "Confundir duas pastas é humano. Confundir a mesma pasta duas vezes é meu dia a dia."),
  fala("erro-historico-humor-3", "historico", "erro", "humor", "Tente de novo. O arquivo não fecha, e eu não tenho mais nada marcado."),

  fala("erro-economia-instrucao-1", "economia", "erro", "instrucao", "Não era essa. Releia no registro a manifestação com o valor original, o objeto votado ou o tipo do ato. É isso que a tarefa pergunta. Não há penalidade."),
  fala("erro-economia-humor-1", "economia", "erro", "humor", "Errei a soma do meu próprio vale-transporte durante meses. Um erro na pasta não me assusta."),
  fala("erro-economia-humor-2", "economia", "erro", "humor", "O ábaco aqui ao lado erra mais do que você. E ele nem tenta de novo."),
  fala("erro-economia-humor-3", "economia", "erro", "humor", "Releia a coluna certa. Eu digo isso para mim mesmo toda sexta, quando confiro a escala de limpeza."),

  fala("erro-seguranca-publica-instrucao-1", "seguranca-publica", "erro", "instrucao", "Não era essa. Releia no registro a manifestação com o valor original, o objeto votado ou o tipo do ato. É isso que a tarefa pergunta. Não há penalidade."),
  fala("erro-seguranca-publica-humor-1", "seguranca-publica", "erro", "humor", "Já tranquei a chave dentro da gaveta que ela abre. Erro de leitura é mais fácil de desfazer."),
  fala("erro-seguranca-publica-humor-2", "seguranca-publica", "erro", "humor", "O lacre não registra tentativas. Eu também não. Siga."),
  fala("erro-seguranca-publica-humor-3", "seguranca-publica", "erro", "humor", "Abra a pasta de novo. O cadeado é de enfeite, e a resposta está lá dentro."),
];

// ---------------------------------------------------------------------------
// Conclusão: a saída abriu
// ---------------------------------------------------------------------------

const CONCLUSAO: Fala[] = [
  fala("conclusao-todas-instrucao-1", "todas", "conclusao", "instrucao", "A tarefa está cumprida e os registros estão todos com você. A saída está aberta: atravesse a passagem para seguir."),
  fala("conclusao-todas-documental-1", "todas", "conclusao", "documental", "Capítulo {capitulo}: {recolhidos} registros recolhidos, com as fontes de cada um."),
  fala("conclusao-todas-humor-1", "todas", "conclusao", "humor", "Tudo recolhido e carimbado. Agora eu reorganizo a estante, o que leva o resto da semana."),
  fala("conclusao-todas-humor-2", "todas", "conclusao", "humor", "A porta abriu. Eu nunca sei onde deixei a chave dela, por isso prefiro que você cumpra a tarefa."),
  fala("conclusao-todas-humor-3", "todas", "conclusao", "humor", "Protocolo encerrado. Vou lavar a xícara e fingir que descanso."),

  fala("conclusao-historico-instrucao-1", "historico", "conclusao", "instrucao", "Este capítulo da trajetória está completo. A saída está aberta: atravesse a passagem para seguir ao período seguinte, ou reveja os registros pelo painel."),
  fala("conclusao-historico-documental-1", "historico", "conclusao", "documental", "Capítulo {capitulo} concluído: {recolhidos} registros, de {periodo}."),
  fala("conclusao-historico-humor-1", "historico", "conclusao", "humor", "Mais um período em ordem. Eu guardo as pastas e você guarda o que leu; a divisão me parece justa."),
  fala("conclusao-historico-humor-2", "historico", "conclusao", "humor", "A estante deste período fica vazia e eu fico orgulhoso. Depois eu a reabasteço e fico cansado."),
  fala("conclusao-historico-humor-3", "historico", "conclusao", "humor", "Carimbo final nesta década. O carimbo da próxima eu ainda procuro."),

  fala("conclusao-economia-instrucao-1", "economia", "conclusao", "instrucao", "As decisões desta sala estão todas com você, cada uma com cargo, instituição, data, objeto e fontes. A saída está aberta: atravesse a passagem."),
  fala("conclusao-economia-documental-1", "economia", "conclusao", "documental", "Sala concluída: {recolhidos} decisões documentadas, de {periodo}."),
  fala("conclusao-economia-humor-1", "economia", "conclusao", "humor", "Fechei a sala das colunas sem somar nada. Dia de glória para o arquivo."),
  fala("conclusao-economia-humor-2", "economia", "conclusao", "humor", "Devolvo o ábaco ao almoxarifado com um memorando de agradecimento. Ele não fez nada, mas é educado."),
  fala("conclusao-economia-humor-3", "economia", "conclusao", "humor", "Pastas numeradas, estante vazia, carimbo guardado. A porta pode abrir."),

  fala("conclusao-seguranca-publica-instrucao-1", "seguranca-publica", "conclusao", "instrucao", "As decisões desta sala estão todas com você, cada uma com cargo, instituição, data, objeto e fontes. A saída está aberta: atravesse a passagem."),
  fala("conclusao-seguranca-publica-documental-1", "seguranca-publica", "conclusao", "documental", "Sala concluída: {recolhidos} decisões documentadas, de {periodo}."),
  fala("conclusao-seguranca-publica-humor-1", "seguranca-publica", "conclusao", "humor", "Gaveta vazia, lacre refeito, chave no bolso certo. Hoje foi um bom dia."),
  fala("conclusao-seguranca-publica-humor-2", "seguranca-publica", "conclusao", "humor", "Tranco esta sala com a fita que sobrou. Sobrou pouca; a porta vai ficar entreaberta, como de costume."),
  fala("conclusao-seguranca-publica-humor-3", "seguranca-publica", "conclusao", "humor", "Protocolo cumprido e cadeado fechado. O cadeado é de enfeite, mas o protocolo não."),
];

export const CATALOGO: readonly Fala[] = [...ENTRADA, ...AJUDA, ...DESCOBERTA, ...FONTE, ...ERRO, ...CONCLUSAO];
