import { useEffect, useState } from "react";
import { Hand, CheckCircle2, MessageCircle, Wallet } from "lucide-react";

import StaffHeader from "../../components/staffHeader/StaffHeader";
import ChatPedido from "../../components/chatPedido/ChatPedido";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { EXTRAS } from "../../data/pricing";
import styles from "./StaffPanel.module.css";

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

export default function StaffPanel() {
  useDocumentTitle("Painel de pedidos");

  const { user, refreshProfile } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [chatAberto, setChatAberto] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("pedidos")
      .select("*, profiles!pedidos_user_profile_fkey(nome, email)")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Não foi possível carregar os pedidos.");
    } else {
      setPedidos(data);
    }

    setLoading(false);
  }

  async function assumirPedido(id) {
    setActionId(id);

    const { error } = await supabase
      .from("pedidos")
      .update({ booster_id: user.id, status: "em_andamento" })
      .eq("id", id);

    if (!error) {
      await fetchPedidos();
    }

    setActionId(null);
  }

  async function concluirPedido(id) {
    setActionId(id);

    const { error } = await supabase
      .from("pedidos")
      .update({ status: "concluido" })
      .eq("id", id);

    if (!error) {
      await fetchPedidos();
      await refreshProfile();
    }

    setActionId(null);
  }

  const disponiveis = pedidos.filter((p) => p.status === "pendente" && p.payment_status === "pago");
  const meus = pedidos.filter((p) => p.booster_id === user.id);

  const meusConcluidos = meus.filter((p) => p.status === "concluido");
  const saldoTotal = meusConcluidos.reduce((soma, p) => soma + (Number(p.comissao_valor) || 0), 0);

  function renderPedidoInfo(pedido) {
    return (
      <>
        <div className={styles.cardTop}>
          <h3>{SERVICO_LABELS[pedido.servico] || pedido.servico}</h3>
          <span className={`${styles.status} ${styles[STATUS_LABELS[pedido.status].className]}`}>
            {STATUS_LABELS[pedido.status].label}
          </span>
        </div>

        {(pedido.profiles?.nome || pedido.profiles?.email) && (
          <p className={styles.cliente}>
            {pedido.profiles?.nome || "Cliente"}
            {pedido.profiles?.email && ` · ${pedido.profiles.email}`}
          </p>
        )}

        {pedido.preco && (
          <p className={styles.cliente}>
            {Number(pedido.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            {pedido.comissao_valor && (
              <> · sua parte: {Number(pedido.comissao_valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} ({pedido.comissao_percentual}%)</>
            )}
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

        <span className={styles.date}>
          {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          })}
        </span>
      </>
    );
  }

  return (
    <>
      <StaffHeader />

      <main className={styles.page}>
        <div className={styles.container}>

          {loading && <div className={styles.state}>Carregando pedidos...</div>}
          {error && <div className={styles.state}>{error}</div>}

          {!loading && !error && (
            <>
              <div className={styles.saldoCard}>
                <div className={styles.saldoIcone}>
                  <Wallet size={22} />
                </div>
                <div>
                  <span className={styles.saldoLabel}>Saldo acumulado</span>
                  <strong className={styles.saldoValor}>
                    {saldoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </strong>
                </div>
                <span className={styles.saldoInfo}>
                  {meusConcluidos.length} pedido{meusConcluidos.length === 1 ? "" : "s"} concluído{meusConcluidos.length === 1 ? "" : "s"}
                </span>
              </div>

              <section className={styles.section}>
                <h2>Pedidos disponíveis</h2>
                <p className={styles.sectionSubtitle}>
                  Pedidos que ainda não foram assumidos por ninguém.
                </p>

                {disponiveis.length === 0 ? (
                  <div className={styles.empty}>Nenhum pedido disponível no momento.</div>
                ) : (
                  <div className={styles.list}>
                    {disponiveis.map((pedido) => (
                      <div className={styles.card} key={pedido.id}>
                        {renderPedidoInfo(pedido)}

                        <button
                          className={styles.assumir}
                          disabled={actionId === pedido.id}
                          onClick={() => assumirPedido(pedido.id)}
                        >
                          <Hand size={16} />
                          {actionId === pedido.id ? "Assumindo..." : "Assumir pedido"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <h2>Meus pedidos</h2>
                <p className={styles.sectionSubtitle}>
                  Pedidos que você já assumiu.
                </p>

                {meus.length === 0 ? (
                  <div className={styles.empty}>Você ainda não assumiu nenhum pedido.</div>
                ) : (
                  <div className={styles.list}>
                    {meus.map((pedido) => (
                      <div className={styles.card} key={pedido.id}>
                        {renderPedidoInfo(pedido)}

                        <div className={styles.acoes}>
                          <button
                            className={styles.chat}
                            onClick={() => setChatAberto(pedido.id)}
                          >
                            <MessageCircle size={16} />
                            Chat com o cliente
                          </button>

                          {pedido.status === "em_andamento" && (
                            <button
                              className={styles.concluir}
                              disabled={actionId === pedido.id}
                              onClick={() => concluirPedido(pedido.id)}
                            >
                              <CheckCircle2 size={16} />
                              {actionId === pedido.id ? "Salvando..." : "Marcar como concluído"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      </main>

      {chatAberto && (
        <ChatPedido
          pedidoId={chatAberto}
          tituloChat={`Chat com ${meus.find(p => p.id === chatAberto)?.profiles?.nome || "o cliente"}`}
          onClose={() => setChatAberto(null)}
        />
      )}
    </>
  );
}
