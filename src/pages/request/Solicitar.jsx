import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import formStyles from "../../components/authLayout/AuthForm.module.css";
import styles from "./Solicitar.module.css";

const SERVICOS = [
  { value: "elo-boost", label: "Elo Boost" },
  { value: "duo-boost", label: "Duo Boost" },
  { value: "coaching", label: "Coaching" },
  { value: "placement", label: "Placement" }
];

export default function Solicitar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const servicoInicial = SERVICOS.some(s => s.value === searchParams.get("servico"))
    ? searchParams.get("servico")
    : "elo-boost";

  const [servico, setServico] = useState(servicoInicial);
  const [eloAtual, setEloAtual] = useState("");
  const [eloDesejado, setEloDesejado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.from("pedidos").insert({
      user_id: user.id,
      servico,
      elo_atual: eloAtual || null,
      elo_desejado: eloDesejado || null,
      observacoes: observacoes || null
    });

    setLoading(false);

    if (error) {
      setError("Não foi possível enviar sua solicitação. Tente novamente.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.backgroundGlow}></div>
          <motion.div
            className={styles.successCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={48} />
            <h1>Solicitação enviada!</h1>
            <p>Você já pode acompanhar o andamento no seu dashboard.</p>
            <button
              className={formStyles.submit}
              onClick={() => navigate("/dashboard")}
            >
              Ir para o dashboard
            </button>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className={styles.page}>

        <div className={styles.backgroundGlow}></div>

        <div className={styles.container}>

          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className={styles.badge}>Solicitação</span>
            <h1>Vamos começar seu pedido</h1>
            <p>Preencha os dados abaixo e acompanhe tudo pelo seu dashboard.</p>
          </motion.div>

          <motion.form
            className={styles.formCard}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .1 }}
          >

            {error && <div className={formStyles.error}>{error}</div>}

            <div className={formStyles.field}>
              <label htmlFor="servico">Serviço</label>
              <select
                id="servico"
                className={styles.select}
                value={servico}
                onChange={(e) => setServico(e.target.value)}
              >
                {SERVICOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.row}>
              <div className={formStyles.field}>
                <label htmlFor="eloAtual">Elo atual</label>
                <input
                  id="eloAtual"
                  type="text"
                  placeholder="Ex: Ouro II"
                  value={eloAtual}
                  onChange={(e) => setEloAtual(e.target.value)}
                />
              </div>

              <div className={formStyles.field}>
                <label htmlFor="eloDesejado">Elo desejado</label>
                <input
                  id="eloDesejado"
                  type="text"
                  placeholder="Ex: Platina IV"
                  value={eloDesejado}
                  onChange={(e) => setEloDesejado(e.target.value)}
                />
              </div>
            </div>

            <div className={formStyles.field}>
              <label htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                className={styles.textarea}
                placeholder="Conte detalhes importantes sobre o seu pedido (opcional)"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
              />
            </div>

            <button
              type="submit"
              className={formStyles.submit}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar solicitação"}
              <Send size={18} />
            </button>

          </motion.form>

        </div>

      </main>

      <Footer />
    </>
  );
}
