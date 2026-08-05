import { Flag, Trophy, ShieldCheck, TrendingUp } from "lucide-react";
import ServicePage from "../../components/servicePage/ServicePage";

export default function Placement() {
  return (
    <ServicePage
      icon={<Flag size={32} />}
      badge="Placement"
      slug="placement"
      title="Comece a temporada no elo ideal"
      description="Garanta as melhores partidas de colocação com jogadores experientes e comece o ranking novo já num patamar competitivo."
      features={[
        {
          icon: <TrendingUp size={22} />,
          title: "Melhor ponto de partida",
          text: "Colocações bem jogadas definem um elo inicial mais alto e um ranking com menos obstáculos."
        },
        {
          icon: <Trophy size={22} />,
          title: "Jogadores de alto nível",
          text: "Suas partidas de colocação são jogadas por boosters com histórico consistente de vitórias."
        },
        {
          icon: <ShieldCheck size={22} />,
          title: "Processo seguro",
          text: "Mesmo cuidado com sua conta e discrição aplicado em todos os nossos serviços."
        }
      ]}
      includes={[
        "Partidas de colocação jogadas por booster experiente",
        "Acompanhamento em tempo real",
        "Suporte via chat durante todo o processo",
        "Garantia de sigilo e segurança da conta",
        "Flexibilidade de horários"
      ]}
    />
  );
}
