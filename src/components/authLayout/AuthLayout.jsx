import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../assets/images/elohypelogo.png";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className={styles.page}>

      <div className={styles.backgroundGlow}></div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .5 }}
      >
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="Elo Hype" className={styles.logo} />
        </Link>

        <h1>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        {children}

        {footer && <div className={styles.footer}>{footer}</div>}
      </motion.div>

    </div>
  );
}
