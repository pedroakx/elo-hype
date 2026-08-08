import RankBadge from "./RankBadge";
import { TIERS_ORDEM, TIERS_COM_DIVISAO, DIVISOES, partesDoElo } from "../../data/rankVisuals";
import styles from "./RankPicker.module.css";

export default function RankPicker({ label, value, onChange }) {
  const { tier: tierAtual, divisao: divisaoAtual } = partesDoElo(value);

  function selecionarTier(tier) {
    if (TIERS_COM_DIVISAO.includes(tier)) {
      // Mantém a divisão já escolhida, se o tier novo também tiver divisões
      const divisao = divisaoAtual && TIERS_COM_DIVISAO.includes(tierAtual) ? divisaoAtual : "IV";
      onChange(`${tier} ${divisao}`);
    } else {
      onChange(tier);
    }
  }

  function selecionarDivisao(divisao) {
    onChange(`${tierAtual} ${divisao}`);
  }

  return (
    <div className={styles.picker}>
      <span className={styles.label}>{label}</span>

      <div className={styles.grid}>
        {TIERS_ORDEM.map((tier) => (
          <RankBadge
            key={tier}
            tier={tier}
            size="sm"
            selected={tier === tierAtual}
            onClick={() => selecionarTier(tier)}
          />
        ))}
      </div>

      {tierAtual && TIERS_COM_DIVISAO.includes(tierAtual) && (
        <div className={styles.divisoes}>
          {DIVISOES.map((divisao) => (
            <button
              type="button"
              key={divisao}
              className={`${styles.divisaoBotao} ${divisao === divisaoAtual ? styles.divisaoSelecionada : ""}`}
              onClick={() => selecionarDivisao(divisao)}
            >
              {divisao}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
