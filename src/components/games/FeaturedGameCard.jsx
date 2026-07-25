import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Games.module.css";

export default function FeaturedGameCard({ game }) {
  return (
    <motion.div
      className={styles.mainCard}
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .6 }}
    >
      <img
        src={game.image}
        alt={game.title}
        className={styles.mainImage}
      />

      <div className={styles.overlay} />
      <div className={styles.glow} />

      <div className={styles.content}>
        <span className={styles.badge}>
          {game.badge}
        </span>

        <h3>{game.title}</h3>

        <p>{game.description}</p>

        <Link
          to={game.link}
          className={styles.button}
        >
          Ver Serviços
          <ArrowRight size={18}/>
        </Link>
      </div>
    </motion.div>
  );
}