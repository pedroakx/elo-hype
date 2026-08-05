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
// PREÇOS — tabela oficial do Elo Boost (preço pra subir o tier inteiro,
// de IV até I -- 3 divisões). Duo Boost usa a mesma base + um adicional.
// ==========================================================================

const PRECO_TIER_COMPLETO = {
  "Ferro": 40,
  "Bronze": 45,
  "Prata": 55,
  "Ouro": 70,
  "Platina": 100,
  "Esmeralda": 190,
  "Diamante": 310
};

// Preço de cada etapa especial que não tem divisão (fora do padrão "por tier")
const PRECO_DIAMANTE_I_PARA_MESTRE = 140;
const PRECO_MESTRE_PARA_GRAO_MESTRE = 1300;
// Grão-Mestre -> Desafiante: sem valor definido, tratado como "sob consulta"

const MULTIPLICADOR_DUO_BOOST = 1.65; // +65% sobre o Elo Boost

// Monta um array com o preço de cada "etapa" entre um elo e o próximo
// (PRECOS_POR_ETAPA[i] = preço para subir de ELOS[i] para ELOS[i + 1])
const PRECOS_POR_ETAPA = ELOS.slice(0, -1).map((elo, i) => {
  const proximoElo = ELOS[i + 1];

  if (elo === "Diamante I" && proximoElo === "Mestre") {
    return PRECO_DIAMANTE_I_PARA_MESTRE;
  }

  if (elo === "Mestre" && proximoElo === "Grão-Mestre") {
    return PRECO_MESTRE_PARA_GRAO_MESTRE;
  }

  if (elo === "Grão-Mestre" && proximoElo === "Desafiante") {
    return 5000;
  }

  // Dentro de um tier com divisão (ex: Ferro IV -> Ferro III) ou entrando
  // num tier novo (ex: Ferro I -> Bronze IV): usa o preço do tier de destino,
  // dividido pelas 3 etapas que compõem a subida completa do tier.
  const [tierDestino] = proximoElo.split(" ");
  const totalTier = PRECO_TIER_COMPLETO[tierDestino];

  return totalTier ? totalTier / 3 : null;
});

function precoEloBoost(indiceAtual, indiceDesejado) {
  let total = 0;

  for (let i = indiceAtual; i < indiceDesejado; i++) {
    const etapa = PRECOS_POR_ETAPA[i];
    if (etapa == null) return null; // trecho sob consulta
    total += etapa;
  }

  return total; // sem arredondar aqui — o arredondamento final acontece
                // só uma vez em calcularPreco, igual ao SQL do servidor
}

// Preço fixo por sessão (Coaching) ou por partida (Placement)
export const PRECO_POR_UNIDADE = {
  coaching: 60,
  placement: 25
};

export function calcularPreco({ servico, eloAtual, eloDesejado, quantidade }) {
  if (servico === "elo-boost" || servico === "duo-boost") {
    const indiceAtual = indiceDoElo(eloAtual);
    const indiceDesejado = indiceDoElo(eloDesejado);

    if (indiceAtual === -1 || indiceDesejado === -1) return null;
    if (indiceDesejado <= indiceAtual) return null;

    const base = precoEloBoost(indiceAtual, indiceDesejado);
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
