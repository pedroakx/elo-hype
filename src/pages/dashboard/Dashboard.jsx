import { useEffect, useState } from "react";
import { LogOut, PackageOpen } from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import styles from "./Dashboard.module.css";

const SERVICO_LABELS = {
  "elo-boost": "Elo Boost",
  "duo-boost": "Duo Boost",
  "coaching": "Coaching",
  "placement": "Placement"
};

const STATUS_LABELS = {
  pendente: { label: "Pendente", className: "pendente" },
  em_andamento: { label: "Em andamento", className: "andamento" },
  concluido: { label: "Concluído", className: "concluido" },
  cancelado: { label: "Cancelado", className: "cancelado" }
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nome = user?.user_metadata?.nome || user?.email;

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Não foi possível carregar seus pedidos.");
      } else {
        setPedidos(data);
      }

      setLoading(false);
    }

    fetchPedidos();
  }, []);

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div>
              <span className={styles.badge}>Dashboard</span>
              <h1>Olá, {nome}</h1>
              <p>Acompanhe aqui o andamento dos seus pedidos.</p>
            </div>

            <button className={styles.logout} onClick={signOut}>
              <LogOut size={18} />
              Sair
            </button>
          </div>

          {loading && (
            <div className={styles.state}>Carregando seus pedidos...</div>
          )}

          {error && (
            <div className={styles.state}>{error}</div>
          )}

          {!loading && !error && pedidos.length === 0 && (
            <div className={styles.empty}>
              <PackageOpen size={40} />
              <h3>Você ainda não tem pedidos</h3>
              <p>Quando contratar um serviço, ele vai aparecer aqui.</p>
            </div>
          )}

          {!loading && !error && pedidos.length > 0 && (
            <div className={styles.list}>
              {pedidos.map((pedido) => {
                const status = STATUS_LABELS[pedido.status] || STATUS_LABELS.pendente;

                return (
                  <div className={styles.card} key={pedido.id}>
                    <div className={styles.cardTop}>
                      <h3>{SERVICO_LABELS[pedido.servico] || pedido.servico}</h3>
                      <span className={`${styles.status} ${styles[status.className]}`}>
                        {status.label}
                      </span>
                    </div>

                    {(pedido.elo_atual || pedido.elo_desejado) && (
                      <p className={styles.elo}>
                        {pedido.elo_atual && <>De <strong>{pedido.elo_atual}</strong></>}
                        {pedido.elo_atual && pedido.elo_desejado && " para "}
                        {pedido.elo_desejado && <strong>{pedido.elo_desejado}</strong>}
                      </p>
                    )}

                    {pedido.observacoes && (
                      <p className={styles.obs}>{pedido.observacoes}</p>
                    )}

                    <span className={styles.date}>
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
