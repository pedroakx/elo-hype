import styles from "./Games.module.css";

import FeaturedGameCard from "./FeaturedGameCard";
import GameCard from "./GameCard";

const games = [
  {
    title: "League of Legends",
    description:
      "Boost, Duo Boost, Coaching e Partidas de Colocação com jogadores profissionais.",
    image: "/images/games/lol-banner.webp",
    badge: "MAIS POPULAR",
    link: "/services/elo-boost"
  },

  {
    title: "Valorant",
    description:
      "Serviços competitivos disponíveis em breve.",
    image: "/images/games/valorant.webp"
  },

  {
    title: "Teamfight Tactics",
    description:
      "Boost e Coaching chegando em breve.",
    image: "/images/games/tft.webp"
  }
];

export default function Games() {
  return (
    <section
      className={styles.games}
      id="games"
    >
      <div className={styles.container}>

        <div className={styles.header}>

          <span>JOGOS</span>

          <h2>
            Escolha seu <strong>jogo</strong>
          </h2>

          <p>
            Começamos pelo League of Legends oferecendo uma experiência premium.
            Em breve expandiremos para novos títulos.
          </p>

        </div>

        <div className={styles.grid}>

          <FeaturedGameCard
            game={games[0]}
          />

          <div className={styles.sideCards}>

            {games.slice(1).map((game, index) => (
              <GameCard
                key={game.title}
                game={game}
                delay={index * .15}
              />
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}