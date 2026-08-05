import { TrendingUp, ShieldCheck, Gauge, Eye } from "lucide-react";
import ServicePage from "../../components/servicePage/ServicePage";

export default function EloBoost() {
  return (
    <ServicePage
      icon={<TrendingUp size={32} />}
      badge="Elo Boost"
      slug="elo-boost"
      title="Suba de elo com rapidez e segurança"
      description="Jogadores de alto nível assumem sua conta ou jogam ao seu lado para te levar até o elo desejado, com total discrição e segurança."
      features={[
        {
          icon: <Gauge size={22} />,
          title: "Progresso rápido",
          text: "Boosters de elite jogam com foco total no seu objetivo, otimizando cada partida."
        },
        {
          icon: <ShieldCheck size={22} />,
          title: "Segurança da conta",
          text: "Uso de VPN compatível com sua região e boas práticas para proteger sua conta o tempo todo."
        },
        {
          icon: <Eye size={22} />,
          title: "Acompanhamento em tempo real",
          text: "Veja o progresso de cada partida e receba atualizações constantes sobre o andamento do boost."
        }
      ]}
      includes={[
        "Booster verificado e de alto elo",
        "Acompanhamento das partidas em tempo real",
        "Suporte via chat durante todo o processo",
        "Garantia de sigilo e segurança da conta",
        "Flexibilidade de horários"
      ]}
    />
  );
}
