import { BookOpen, Target, LineChart, Video } from "lucide-react";
import ServicePage from "../../components/servicePage/ServicePage";

export default function Coaching() {
  return (
    <ServicePage
      icon={<BookOpen size={32} />}
      badge="Coaching"
      slug="coaching"
      title="Sessões personalizadas para evoluir seu jogo"
      description="Trabalhe mecânica, macro gaming e visão de jogo com sessões individuais focadas nos pontos que realmente vão te fazer subir de elo."
      features={[
        {
          icon: <Target size={22} />,
          title: "Foco no que importa",
          text: "Análise dos seus pontos fracos e um plano de treino direcionado para corrigi-los."
        },
        {
          icon: <Video size={22} />,
          title: "Revisão de replays",
          text: "Suas partidas são analisadas em detalhe, com explicações sobre decisões e alternativas."
        },
        {
          icon: <LineChart size={22} />,
          title: "Evolução acompanhada",
          text: "Acompanhamento do seu progresso ao longo das sessões, com metas claras a cada etapa."
        }
      ]}
      includes={[
        "Sessão individual ao vivo com coach experiente",
        "Análise de replays das suas partidas",
        "Plano de treino personalizado",
        "Material de apoio após a sessão",
        "Acompanhamento de evolução"
      ]}
    />
  );
}
