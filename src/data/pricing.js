// Lista ordenada de todos os elos do League of Legends, do mais baixo pro mais alto.
// O "índice" de cada elo nessa lista é usado para calcular o caminho entre
// o elo atual e o elo desejado.

const TIERS_COM_DIVISAO = [
  "Ferro", "Bronze", "Prata", "Ouro", "Platina", "Esmeralda", "Diamante"
];
const DIVISOES = ["IV", "III", "II", "I"];

export const ELOS = [
  ...TIERS_COM_DIVISAO.flatMap((tier) =>
    DIVISOES.map((div) => `${tier} ${div}`)
  ),
  "Mestre",
  "Grão-Mestre",
  "Desafiante"
];

export function indiceDoElo(elo) {
  return ELOS.indexOf(elo);
}

// ==========================================================================
// PREÇOS — tabela oficial, preço POR DIVISÃO (não por tier inteiro).
// ==========================================================================

// Preço fixo por divisão dentro do tier (Ferro a Esmeralda têm valor único;
// a entrada em um tier novo usa o preço do tier de destino)
const PRECO_POR_DIVISAO = {
  "Ferro": 13,
  "Bronze": 15,
  "Prata": 17,
  "Ouro": 20,
  "Platina": 25,
  "Esmeralda": 40
};

// Diamante tem preço específico por degrau (fica cada vez mais caro
// conforme se aproxima do Mestre)
const PRECO_DIAMANTE_IV_PARA_III = 60;
const PRECO_DIAMANTE_III_PARA_II = 70;
const PRECO_DIAMANTE_II_PARA_I = 80;
const PRECO_DIAMANTE_I_PARA_MESTRE = 100;

const PRECO_MESTRE_PARA_GRAO_MESTRE = 1300;
const PRECO_GRAO_MESTRE_PARA_DESAFIANTE = 5000;

const MULTIPLICADOR_DUO_BOOST = 1.65; // +65% sobre o Elo Boost

// Monta um array com o preço de cada "etapa" entre um elo e o próximo
// (PRECOS_POR_ETAPA[i] = preço para subir de ELOS[i] para ELOS[i + 1])
const PRECOS_POR_ETAPA = ELOS.slice(0, -1).map((elo, i) => {
  const proximoElo = ELOS[i + 1];

  if (elo === "Diamante IV" && proximoElo === "Diamante III") return PRECO_DIAMANTE_IV_PARA_III;
  if (elo === "Diamante III" && proximoElo === "Diamante II") return PRECO_DIAMANTE_III_PARA_II;
  if (elo === "Diamante II" && proximoElo === "Diamante I") return PRECO_DIAMANTE_II_PARA_I;
  if (elo === "Diamante I" && proximoElo === "Mestre") return PRECO_DIAMANTE_I_PARA_MESTRE;
  if (elo === "Mestre" && proximoElo === "Grão-Mestre") return PRECO_MESTRE_PARA_GRAO_MESTRE;
  if (elo === "Grão-Mestre" && proximoElo === "Desafiante") return PRECO_GRAO_MESTRE_PARA_DESAFIANTE;

  // Entrando no Diamante vindo do Esmeralda I: usa o preço do primeiro
  // degrau do Diamante (mesma regra: o degrau usa o preço do elo de chegada)
  if (proximoElo === "Diamante IV") return PRECO_DIAMANTE_IV_PARA_III;

  // Dentro de um tier com divisão (ex: Ferro IV -> Ferro III) ou entrando
  // num tier novo (ex: Ferro I -> Bronze IV): usa o preço por divisão do
  // tier de destino
  const [tierDestino] = proximoElo.split(" ");
  return PRECO_POR_DIVISAO[tierDestino] ?? null;
});

// Calcula o preço do Elo Boost/Duo Boost considerando os LPs já feitos
// na divisão atual — o primeiro degrau é cobrado proporcional ao que
// ainda falta (100 - lpAtual)%, os degraus seguintes são cobrados inteiros.
function precoEloBoost(indiceAtual, indiceDesejado, lpAtual) {
  let total = 0;

  for (let i = indiceAtual; i < indiceDesejado; i++) {
    const etapa = PRECOS_POR_ETAPA[i];
    if (etapa == null) return null; // trecho sem preço definido

    if (i === indiceAtual) {
      const lp = Math.min(Math.max(Number(lpAtual) || 0, 0), 99);
      total += etapa * (100 - lp) / 100;
    } else {
      total += etapa;
    }
  }

  return total; // sem arredondar aqui — o arredondamento final acontece
                // só uma vez em calcularPreco, igual ao SQL do servidor
}

// Preço fixo por sessão (Coaching) ou por partida (Placement)
export const PRECO_POR_UNIDADE = {
  coaching: 60,
  placement: 25
};

export function calcularPreco({ servico, eloAtual, eloDesejado, lpAtual, quantidade }) {
  if (servico === "elo-boost" || servico === "duo-boost") {
    const indiceAtual = indiceDoElo(eloAtual);
    const indiceDesejado = indiceDoElo(eloDesejado);

    if (indiceAtual === -1 || indiceDesejado === -1) return null;
    if (indiceDesejado <= indiceAtual) return null;

    const base = precoEloBoost(indiceAtual, indiceDesejado, lpAtual);
    if (base == null) return null;

    const bruto = servico === "duo-boost" ? base * MULTIPLICADOR_DUO_BOOST : base;
    return Math.round(bruto * 100) / 100;
  }

  if (servico === "coaching" || servico === "placement") {
    const qtd = Number(quantidade) || 0;
    if (qtd <= 0) return null;

    return qtd * PRECO_POR_UNIDADE[servico];
  }

  return null;
}

// ==========================================================================
// EXTRAS — valores sugeridos, ajuste conforme a política de vocês.
// "percentual" multiplica o preço base (antes dos extras). "fixo" soma um
// valor fechado em reais. Disponíveis só para os serviços listados em
// `servicos` (Coaching não entra, já que não é "partida jogada pelo booster").
// ==========================================================================

export const EXTRAS = [
  {
    id: "prioridade",
    label: "Prioridade / Urgência",
    descricao: "Seu pedido é atendido antes da fila normal",
    tipo: "percentual",
    valor: 20, // +20%
    servicos: ["elo-boost", "duo-boost", "placement"]
  },
  {
    id: "campeoes",
    label: "Campeões específicos",
    descricao: "Você escolhe quais campeões o booster pode jogar",
    tipo: "fixo",
    valor: 15,
    servicos: ["elo-boost", "duo-boost", "placement"]
  },
  {
    id: "rota",
    label: "Rota específica",
    descricao: "O booster joga só na rota que você escolher",
    tipo: "fixo",
    valor: 10,
    servicos: ["elo-boost", "duo-boost", "placement"]
  },
  {
    id: "offline",
    label: "Modo offline / stream off",
    descricao: "Perfil fica invisível durante as partidas",
    tipo: "fixo",
    valor: 10,
    servicos: ["elo-boost", "duo-boost", "placement"],
    conflitaCom: ["discord_live"]
  },
  {
    id: "especialista",
    label: "Especialista (mono champion)",
    descricao: "Partidas jogadas por um booster especialista em 1 único campeão",
    tipo: "percentual",
    valor: 25, // +25%
    servicos: ["elo-boost", "duo-boost", "placement"]
  },
  {
    id: "discord_live",
    label: "Transmissão ao vivo no Discord",
    descricao: "Acompanhe as partidas ao vivo pelo nosso Discord",
    tipo: "fixo",
    valor: 20,
    servicos: ["elo-boost", "duo-boost", "coaching", "placement"],
    conflitaCom: ["offline"]
  }
];

export function extrasDisponiveis(servico) {
  return EXTRAS.filter((extra) => extra.servicos.includes(servico));
}

// Aplica os extras selecionados sobre o preço base: primeiro os percentuais
// (multiplicados entre si), depois os fixos somados — e arredonda só no
// final, igual ao cálculo espelhado no banco de dados.
export function calcularTotalComExtras(precoBase, extrasSelecionados = []) {
  if (precoBase == null) return null;

  let fator = 1;
  let somaFixa = 0;

  for (const id of extrasSelecionados) {
    const extra = EXTRAS.find((e) => e.id === id);
    if (!extra) continue;

    if (extra.tipo === "percentual") {
      fator *= 1 + extra.valor / 100;
    } else {
      somaFixa += extra.valor;
    }
  }

  const bruto = precoBase * fator + somaFixa;
  return Math.round(bruto * 100) / 100;
}


// ==========================================================================
// PROMOÇÃO DE LANÇAMENTO
// ==========================================================================

export const DESCONTO_LANCAMENTO = 0.50;

export function aplicarDescontoLancamento(preco) {
  if (preco == null) return null;

  return Math.round(preco * (1 - DESCONTO_LANCAMENTO) * 100) / 100;
}