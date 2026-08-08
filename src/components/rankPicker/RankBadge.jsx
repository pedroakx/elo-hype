import { TIER_INFO } from "../../data/rankVisuals";
import styles from "./RankBadge.module.css";

export default function RankBadge({ tier, size = "sm", selected = false, dimmed = false, onClick }) {
  const info = TIER_INFO[tier];
  if (!info) return null;

  const Icon = info.icon;
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`${styles.badge} ${styles[size]} ${selected ? styles.selected : ""} ${dimmed ? styles.dimmed : ""}`}
      style={{ "--cor": info.cor }}
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      title={tier}
    >
      <span className={styles.glow}></span>
      <Icon className={styles.icon} strokeWidth={1.75} />
    </Tag>
  );
}
