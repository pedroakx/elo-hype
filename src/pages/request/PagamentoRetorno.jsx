import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle } from "lucide-react";


import Footer from "../../components/footer/Footer";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";
import styles from "./Solicitar.module.css";

const CONTEUDO = {
  approved: {
    icon: <CheckCircle2 size={48} color="#4ADE80" />,
    titulo: "Pagamento aprovado!",
    texto: "Seu pedido já está confirmado. Acompanhe o andamento no seu dashboard."
  },
  pending: {
    icon: <Clock size={48} color="#FCD34D" />,
    titulo: "Pagamento em análise",
    texto: "Assim que o Mercado Pago confirmar, seu pedido é liberado automaticamente."
  },
  failure: {
    icon: <XCircle size={48} color="#F87171" />,
    titulo: "Pagamento não concluído",
    texto: "Algo deu errado no pagamento. Você pode tentar novamente pelo dashboard."
  }
};

export default function PagamentoRetorno() {
  useDocumentTitle("Retorno do pagamento");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status") === "approved"
    ? "approved"
    : searchParams.get("status") === "pending" || searchParams.get("status") === "in_process"
      ? "pending"
      : "failure";

  const [contador, setContador] = useState(6);
  const conteudo = CONTEUDO[status];

  useEffect(() => {
    if (status === "failure") return;

    const interval = setInterval(() => {
      setContador((c) => c - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      navigate("/dashboard");
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status, navigate]);

  return (
    <>
      

      <main className={styles.page}>
        <div className={styles.backgroundGlow}></div>

        <motion.div
          className={styles.successCard}
          style={{ color: "white" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {conteudo.icon}
          <h1>{conteudo.titulo}</h1>
          <p>{conteudo.texto}</p>

          <Link to="/dashboard" className={formStyles.submit}>
            Ir para o dashboard {status !== "failure" && `(${contador}s)`}
          </Link>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
