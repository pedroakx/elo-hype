import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import StaffHeader from "../../components/staffHeader/StaffHeader";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import styles from "./StaffRanking.module.css";

const MEDALHAS = ["🥇", "🥈", "🥉"];

export default function StaffRanking() {
  useDocumentTitle("Ranking de boosters");

  const { profile } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_ranking_boosters");

      if (error) {
        setError("Não foi possível carregar o ranking.");
      } else {
        setRanking(data);
      }

      setLoading(false);
    }

    fetchRanking();
  }, []);

  return (
    <>
      <StaffHeader />

      <main className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <Trophy size={28} />
            <div>
              <h1>Ranking de boosters</h1>
              <p>Quanto mais pedidos concluídos, maior o nível e a comissão.</p>
            </div>
          </div>

          {profile && (
            <div className={styles.meuNivel}>
              <div>
                <span className={styles.meuNivelLabel}>Seu nível atual</span>
                <strong>Nível {profile.nivel} · {profile.percentual_comissao}% de comissão</strong>
              </div>
              <span className={styles.meuNivelPedidos}>
                {profile.pedidos_concluidos} pedido{profile.pedidos_concluidos === 1 ? "" : "s"} concluído{profile.pedidos_concluidos === 1 ? "" : "s"}
              </span>
            </div>
          )}

          {loading && <div className={styles.state}>Carregando ranking...</div>}
          {error && <div className={styles.state}>{error}</div>}

          {!loading && !error && (
            <div className={styles.list}>
              {ranking.map((booster, index) => (
                <div
                  className={`${styles.row} ${booster.nome === profile?.nome ? styles.rowEu : ""}`}
                  key={`${booster.nome}-${index}`}
                >
                  <span className={styles.posicao}>
                    {MEDALHAS[index] || `${index + 1}º`}
                  </span>

                  <div className={styles.identidade}>
                    <div className={styles.avatarRanking}>
                      {booster.avatar_url ? (
                        <img src={booster.avatar_url} alt="" />
                      ) : (
                        booster.nome?.[0] || "?"
                      )}
                    </div>
                    <span className={styles.nome}>{booster.nickname || booster.nome || "Booster"}</span>
                  </div>

                  <span className={styles.nivel}>Nível {booster.nivel}</span>

                  <span className={styles.pedidos}>{booster.pedidos_concluidos} pedidos</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
}
