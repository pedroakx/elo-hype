import { motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import styles from "./Games.module.css";

export default function GameCard({ game, delay = 0 }) {
  return (
    <motion.div
      className={styles.comingSoon}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <img
        src={game.image}
        alt={game.title}
      />

      <div className={styles.overlay} />

      <div className={styles.cardContent}>
        <Clock3 size={30}/>

        <h4>{game.title}</h4>

        <p>{game.description}</p>

        <span>Em breve</span>
      </div>
    </motion.div>
  );
}