import { Users, MessageCircle, Sparkles, Gamepad2 } from "lucide-react";
import ServicePage from "../../components/servicePage/ServicePage";

export default function DuoBoost() {
  return (
    <ServicePage
      icon={<Users size={32} />}
      badge="Duo Boost"
      slug="duo-boost"
      title="Suba de elo jogando ao lado de um booster"
      description="Jogue em dupla com um booster experiente, evolua sua mecânica e sua tomada de decisão enquanto acompanha cada partida de perto."
      features={[
        {
          icon: <Gamepad2 size={22} />,
          title: "Você joga, você aprende",
          text: "Diferente do boost solo, você participa de cada partida ao lado de um jogador de alto nível."
        },
        {
          icon: <MessageCircle size={22} />,
          title: "Comunicação direta",
          text: "Converse por voz durante as partidas e receba dicas em tempo real sobre suas decisões."
        },
        {
          icon: <Sparkles size={22} />,
          title: "Evolução mais rápida",
          text: "Absorva macro e micro jogadas observando de perto como um jogador experiente joga."
        }
      ]}
      includes={[
        "Duo com jogador de elo elevado",
        "Comunicação por voz durante as partidas",
        "Dicas personalizadas sobre seu gameplay",
        "Flexibilidade de horários e campeões",
        "Suporte via chat durante todo o processo"
      ]}
    />
  );
}
