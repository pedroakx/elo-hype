import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import styles from "./ServicePage.module.css";

export default function ServicePage({
  icon,
  badge,
  slug,
  title,
  description,
  features,
  includes
}) {
  return (
    <>
      <Navbar />

      <main className={styles.page}>

        <div className={styles.backgroundGlow}></div>

        <div className={styles.container}>

          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
          >
            <div className={styles.icon}>
              {icon}
            </div>

            <span className={styles.badge}>{badge}</span>

            <h1>{title}</h1>

            <p>{description}</p>

            <div className={styles.actions}>
              <Link to={`/solicitar?servico=${slug}`} className={styles.primary}>
                Solicitar agora
                <ArrowRight size={18} />
              </Link>

              <Link to="/" className={styles.secondary}>
                Voltar para a Home
              </Link>
            </div>
          </motion.div>

          <div className={styles.grid}>

            <motion.div
              className={styles.features}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .6 }}
            >
              <h2>Por que escolher esse serviço</h2>

              <div className={styles.featureList}>
                {features.map((feature) => (
                  <div className={styles.featureCard} key={feature.title}>
                    <div className={styles.featureIcon}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className={styles.includesCard}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .6, delay: .15 }}
            >
              <h2>O que está incluso</h2>

              <ul>
                {includes.map((item) => (
                  <li key={item}>
                    <Check size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link to={`/solicitar?servico=${slug}`} className={styles.primary}>
                Começar agora
                <ArrowRight size={18} />
              </Link>
            </motion.div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}
