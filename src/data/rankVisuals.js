import { Shield, Gem, Crown, Sparkles } from "lucide-react";

// Paleta e ícone de cada tier — inspirado no visual comum de sites de boost
// (badge com brilho neon), mas com ícones e tons próprios, não os emblemas
// oficiais da Riot nem de nenhum concorrente.
export const TIER_INFO = {
  "Ferro":       { cor: "#8b8d94", icon: Shield },
  "Bronze":      { cor: "#c17a45", icon: Shield },
  "Prata":       { cor: "#b9c2cc", icon: Shield },
  "Ouro":        { cor: "#e8b74a", icon: Shield },
  "Platina":     { cor: "#2dd4bf", icon: Gem },
  "Esmeralda":   { cor: "#22c55e", icon: Gem },
  "Diamante":    { cor: "#38bdf8", icon: Gem },
  "Mestre":      { cor: "#a855f7", icon: Crown },
  "Grão-Mestre": { cor: "#f43f5e", icon: Crown },
  "Desafiante":  { cor: "#fbbf24", icon: Sparkles }
};

export const TIERS_ORDEM = [
  "Ferro", "Bronze", "Prata", "Ouro", "Platina",
  "Esmeralda", "Diamante", "Mestre", "Grão-Mestre", "Desafiante"
];

export const TIERS_COM_DIVISAO = [
  "Ferro", "Bronze", "Prata", "Ouro", "Platina", "Esmeralda", "Diamante"
];

export const DIVISOES = ["IV", "III", "II", "I"];

export function partesDoElo(elo) {
  if (!elo) return { tier: null, divisao: null };
  const [tier, divisao] = elo.split(" ");
  return { tier, divisao: divisao || null };
}
