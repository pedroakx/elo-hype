import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, SearchX } from "lucide-react";

import Footer from "../../components/footer/Footer";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";
import styles from "./NotFound.module.css";

export default function NotFound() {
  useDocumentTitle("Página não encontrada");

  return (
    <>
      <main className={styles.page}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SearchX size={48} />
          <h1>404</h1>
          <p>Essa página não existe ou foi movida.</p>

          <Link to="/" className={formStyles.submit} style={{ marginTop: 12 }}>
            <Home size={18} />
            Voltar para a Home
          </Link>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
