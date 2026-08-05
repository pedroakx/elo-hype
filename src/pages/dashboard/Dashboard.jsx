import { useEffect, useState } from "react";
import { LogOut, PackageOpen, MessageCircle } from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ChatPedido from "../../components/chatPedido/ChatPedido";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { EXTRAS } from "../../data/pricing";
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

const PAGAMENTO_LABELS = {
  pendente: { label: "Aguardando pagamento", className: "pendente" },
  pago: { label: "Pago", className: "concluido" },
  cancelado: { label: "Pagamento cancelado", className: "cancelado" }
};

export default function Dashboard() {
  useDocumentTitle("Meu dashboard");

  const { user, signOut } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatAberto, setChatAberto] = useState(null);

  const nome = user?.user_metadata?.nome || user?.email;

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("pedidos")
        .select("*, booster:profiles!pedidos_booster_profile_fkey(nome, nickname, discord, nick_lol, avatar_url)")
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
                      <div className={styles.badges}>
                        <span className={`${styles.status} ${styles[PAGAMENTO_LABELS[pedido.payment_status].className]}`}>
                          {PAGAMENTO_LABELS[pedido.payment_status].label}
                        </span>
                        <span className={`${styles.status} ${styles[status.className]}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {pedido.preco && (
                      <p className={styles.preco}>
                        {Number(pedido.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    )}

                    {(pedido.elo_atual || pedido.elo_desejado) && (
                      <p className={styles.elo}>
                        {pedido.elo_atual && <>De <strong>{pedido.elo_atual}</strong></>}
                        {pedido.elo_atual && pedido.elo_desejado && " para "}
                        {pedido.elo_desejado && <strong>{pedido.elo_desejado}</strong>}
                      </p>
                    )}

                    {pedido.quantidade && (
                      <p className={styles.elo}>
                        Quantidade: <strong>{pedido.quantidade}</strong>
                      </p>
                    )}

                    {pedido.observacoes && (
                      <p className={styles.obs}>{pedido.observacoes}</p>
                    )}

                    {pedido.extras?.length > 0 && (
                      <div className={styles.extrasTags}>
                        {pedido.extras.map((id) => {
                          const extra = EXTRAS.find((e) => e.id === id);
                          return extra ? (
                            <span key={id} className={styles.extraTag}>{extra.label}</span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {pedido.booster && (
                      <div className={styles.booster}>
                        <div className={styles.boosterAvatar}>
                          {pedido.booster.avatar_url ? (
                            <img src={pedido.booster.avatar_url} alt="" />
                          ) : (
                            (pedido.booster.nickname || pedido.booster.nome || "?")[0]
                          )}
                        </div>
                        <div>
                          <strong>{pedido.booster.nickname || pedido.booster.nome}</strong>
                          <p>
                            {pedido.booster.discord && <>Discord: {pedido.booster.discord}</>}
                            {pedido.booster.discord && pedido.booster.nick_lol && " · "}
                            {pedido.booster.nick_lol && <>LoL: {pedido.booster.nick_lol}</>}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className={styles.cardBottom}>
                      <span className={styles.date}>
                        {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>

                      {pedido.booster_id && (
                        <button
                          className={styles.chatButton}
                          onClick={() => setChatAberto(pedido.id)}
                        >
                          <MessageCircle size={16} />
                          Chat com o booster
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {chatAberto && (
        <ChatPedido
          pedidoId={chatAberto}
          tituloChat="Chat com o booster"
          onClose={() => setChatAberto(null)}
        />
      )}

      <Footer />
    </>
  );
}
