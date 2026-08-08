import { ArrowRight } from "lucide-react";
import RankBadge from "./RankBadge";
import { partesDoElo } from "../../data/rankVisuals";
import styles from "./JornadaHeader.module.css";

export default function JornadaHeader({ eloAtual, eloDesejado }) {
  const { tier: tierAtual } = partesDoElo(eloAtual);
  const { tier: tierDesejado } = partesDoElo(eloDesejado);

  return (
    <div className={styles.jornada}>

      <div className={styles.lado}>
        <RankBadge tier={tierAtual} size="lg" selected />
        <span className={styles.rotulo}>Atual</span>
        <strong className={styles.eloNome}>{eloAtual || "—"}</strong>
      </div>

      <div className={styles.meio}>
        <ArrowRight size={28} />
      </div>

      <div className={styles.lado}>
        <RankBadge tier={tierDesejado} size="lg" selected />
        <span className={`${styles.rotulo} ${styles.rotuloDesejado}`}>Desejado</span>
        <strong className={styles.eloNome}>{eloDesejado || "—"}</strong>
      </div>

    </div>
  );
}
