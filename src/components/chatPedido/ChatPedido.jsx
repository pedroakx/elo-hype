import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import styles from "./ChatPedido.module.css";

export default function ChatPedido({ pedidoId, tituloChat, onClose }) {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let ativo = true;

    async function carregarMensagens() {
      setLoading(true);

      const { data } = await supabase
        .from("mensagens")
        .select("*")
        .eq("pedido_id", pedidoId)
        .order("created_at", { ascending: true });

      if (ativo) {
        setMensagens(data || []);
        setLoading(false);
      }
    }

    carregarMensagens();

    // Escuta novas mensagens em tempo real pra esse pedido específico
    const canal = supabase
      .channel(`mensagens-${pedidoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens",
          filter: `pedido_id=eq.${pedidoId}`
        },
        (payload) => {
          setMensagens((atual) => {
            if (atual.some((m) => m.id === payload.new.id)) return atual;
            return [...atual, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      ativo = false;
      supabase.removeChannel(canal);
    };
  }, [pedidoId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mensagens]);

  async function enviarMensagem(e) {
    e.preventDefault();

    const conteudo = texto.trim();
    if (!conteudo || enviando) return;

    setEnviando(true);
    setTexto("");

    const { error } = await supabase.from("mensagens").insert({
      pedido_id: pedidoId,
      sender_id: user.id,
      conteudo
    });

    if (error) {
      setTexto(conteudo);
    }

    setEnviando(false);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div
        className={styles.painel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>{tituloChat}</h3>
          <button className={styles.fechar} onClick={onClose} aria-label="Fechar chat">
            <X size={20} />
          </button>
        </div>

        <div className={styles.mensagens} ref={scrollRef}>
          {loading && <p className={styles.estado}>Carregando conversa...</p>}

          {!loading && mensagens.length === 0 && (
            <p className={styles.estado}>Nenhuma mensagem ainda. Diga oi!</p>
          )}

          {!loading && mensagens.map((m) => (
            <div
              key={m.id}
              className={`${styles.bolha} ${m.sender_id === user.id ? styles.minha : styles.outra}`}
            >
              <p>{m.conteudo}</p>
              <span>
                {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>

        <form className={styles.form} onSubmit={enviarMensagem}>
          <input
            type="text"
            placeholder="Escreva uma mensagem..."
            aria-label="Escreva uma mensagem"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={1000}
          />
          <button type="submit" disabled={!texto.trim() || enviando} aria-label="Enviar mensagem">
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
