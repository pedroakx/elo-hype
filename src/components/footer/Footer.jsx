import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import logo from "../../assets/images/elohypelogo.png";

export default function Footer() {

  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>

      <div className={styles.container}>

        <div className={styles.top}>

          <div className={styles.brand}>
            <img
              src={logo}
              alt="Elo Hype"
              className={styles.logo}
            />
            <p>
              Conectando jogadores, equipes e oportunidades
              dentro do universo competitivo.
            </p>
          </div>

          <div className={styles.column}>
            <h4>Serviços</h4>
            <Link to="/services/elo-boost">Elo Boost</Link>
            <Link to="/services/duo-boost">Duo Boost</Link>
            <Link to="/services/coaching">Coaching</Link>
            <Link to="/services/placement">Placement</Link>
          </div>

          <div className={styles.column}>
            <h4>Navegação</h4>
            <a href="#services">Serviços</a>
            <a href="#games">Jogos</a>
            <a href="#how-it-works">Como funciona</a>
          </div>

          <div className={styles.column}>
            <h4>Contato</h4>
            <a href="mailto:elohypeinc@gmail.com">elohypeinc@gmail.com</a>
            <a href="https://discord.gg/vsGpwDy25s" target="_blank" rel="noopener noreferrer">Discord</a>
            <Link to="/termos">Termos de Uso e Privacidade</Link>
          </div>

        </div>

        <div className={styles.bottom}>
          <span>© {year} Elo Hype. Todos os direitos reservados.</span>
        </div>

      </div>

    </footer>
  );
}
