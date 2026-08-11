import { useMemo, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Check } from "lucide-react";

import Footer from "../../components/footer/Footer";
import RankPicker from "../../components/rankPicker/RankPicker";
import JornadaHeader from "../../components/rankPicker/JornadaHeader";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import {
  ELOS,
  calcularPreco,
  indiceDoElo,
  extrasDisponiveis,
  calcularTotalComExtras,
  aplicarDescontoLancamento,
  EXTRAS
} from "../../data/pricing";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";
import styles from "./Solicitar.module.css";

const SERVICOS = [
  { value: "elo-boost", label: "Elo Boost" },
  { value: "duo-boost", label: "Duo Boost" },
  { value: "coaching", label: "Coaching" },
  { value: "placement", label: "Placement" }
];

const USA_ELO = (servico) => servico === "elo-boost" || servico === "duo-boost";
const USA_QUANTIDADE = (servico) => servico === "coaching" || servico === "placement";

const CHAVE_RASCUNHO = "elohype:pedido-rascunho";

function lerRascunho() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_RASCUNHO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export default function Solicitar() {
  useDocumentTitle("Solicitar serviço");

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Se a pessoa preencheu o formulário, foi mandada pra criar conta/entrar
  // e voltou, restaura tudo o que ela já tinha escolhido
  const [rascunho] = useState(() => {
    const salvo = lerRascunho();
    if (salvo) sessionStorage.removeItem(CHAVE_RASCUNHO);
    return salvo;
  });

  const servicoInicial = rascunho?.servico
    ? rascunho.servico
    : SERVICOS.some(s => s.value === searchParams.get("servico"))
      ? searchParams.get("servico")
      : "elo-boost";

  const [servico, setServico] = useState(servicoInicial);
  const [eloAtual, setEloAtual] = useState(rascunho?.eloAtual || ELOS[0]);
  const [eloDesejado, setEloDesejado] = useState(rascunho?.eloDesejado || ELOS[1]);
  const [lpAtual, setLpAtual] = useState(rascunho?.lpAtual ?? 0);
  const [quantidade, setQuantidade] = useState(rascunho?.quantidade ?? 5);
  const [observacoes, setObservacoes] = useState(rascunho?.observacoes || "");
  const [extrasSelecionados, setExtrasSelecionados] = useState(rascunho?.extrasSelecionados || []);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const extrasDoServico = useMemo(() => extrasDisponiveis(servico), [servico]);

  function alternarExtra(id) {
    setExtrasSelecionados((atual) => {
      if (atual.includes(id)) {
        return atual.filter((e) => e !== id);
      }

      const extra = EXTRAS.find((e) => e.id === id);
      const semConflitantes = atual.filter((e) => !extra?.conflitaCom?.includes(e));

      return [...semConflitantes, id];
    });
  }

  // Ao trocar de serviço, remove da seleção qualquer extra que não
  // esteja disponível para o novo serviço escolhido
  function handleServicoChange(novoServico) {
    setServico(novoServico);
    const idsPermitidos = extrasDisponiveis(novoServico).map((e) => e.id);
    setExtrasSelecionados((atual) => atual.filter((id) => idsPermitidos.includes(id)));
  }

  const precoBase = useMemo(() => calcularPreco({
    servico,
    eloAtual,
    eloDesejado,
    lpAtual,
    quantidade
  }), [servico, eloAtual, eloDesejado, lpAtual, quantidade]);

  const precoOriginal = useMemo(
    () => calcularTotalComExtras(precoBase, extrasSelecionados),
    [precoBase, extrasSelecionados]
  );

  const preco = useMemo(
    () => aplicarDescontoLancamento(precoOriginal),
    [precoOriginal]
  );

  const ordemValida = !USA_ELO(servico) || indiceDoElo(eloDesejado) > indiceDoElo(eloAtual);
  const precoIndisponivel = ordemValida && !preco;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!preco) {
      setError(
        !ordemValida
          ? "O elo desejado precisa ser maior que o elo atual."
          : USA_ELO(servico)
            ? "Esse intervalo de elo está sob consulta. Entre em contato conosco pelo Discord ou WhatsApp."
            : "Informe uma quantidade válida."
      );
      return;
    }

    setLoading(true);

    // Ainda não tem conta? Salva o que já foi preenchido e manda criar
    // conta primeiro — ao voltar, o formulário é restaurado automaticamente.
    if (!user) {
      sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({
        servico, eloAtual, eloDesejado, lpAtual, quantidade, observacoes, extrasSelecionados
      }));

      navigate("/cadastro", { state: { from: location } });
      return;
    }

    // 1. Cria o pedido como "pendente" — o preço enviado aqui é só uma
    //    referência: o banco recalcula (base + extras + desconto de
    //    lançamento) e substitui esse valor no servidor, então não tem
    //    como manipular o preço alterando essa requisição.
    const { data: pedido, error: insertError } = await supabase
      .from("pedidos")
      .insert({
        user_id: user.id,
        servico,
        elo_atual: USA_ELO(servico) ? eloAtual : null,
        elo_desejado: USA_ELO(servico) ? eloDesejado : null,
        lp_atual: USA_ELO(servico) ? Number(lpAtual) : null,
        quantidade: USA_QUANTIDADE(servico) ? Number(quantidade) : null,
        observacoes: observacoes || null,
        extras: extrasSelecionados
      })
      .select()
      .single();

    if (insertError || !pedido) {
      setLoading(false);
      setError("Não foi possível criar sua solicitação. Tente novamente.");
      return;
    }

    // 2. Chama a Edge Function que cria a preferência de pagamento no Mercado Pago
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-preference`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          pedidoId: pedido.id,
          titulo: SERVICOS.find(s => s.value === servico)?.label
        })
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok || !result.init_point) {
      setError("Não foi possível iniciar o pagamento. Tente novamente.");
      return;
    }

    // 3. Redireciona para o checkout do Mercado Pago
    window.location.href = result.init_point;
  }

  return (
    <>
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
            <p>Preencha os dados abaixo, confira o valor e finalize o pagamento.</p>
            {!user && (
              <p className={styles.avisoConta}>
                Você pode simular o preço à vontade — só vamos pedir uma conta rápida na hora de pagar.
              </p>
            )}
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
                onChange={(e) => handleServicoChange(e.target.value)}
              >
                {SERVICOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {USA_ELO(servico) && (
              <>
                <JornadaHeader eloAtual={eloAtual} eloDesejado={eloDesejado} />

                <div className={styles.row}>
                  <RankPicker label="Elo atual" value={eloAtual} onChange={setEloAtual} />
                  <RankPicker label="Elo desejado" value={eloDesejado} onChange={setEloDesejado} />
                </div>
              </>
            )}

            {USA_ELO(servico) && (
              <div className={formStyles.field}>
                <label htmlFor="lpAtual">LP atuais na divisão (0 a 99)</label>
                <input
                  id="lpAtual"
                  type="number"
                  min="0"
                  max="99"
                  value={lpAtual}
                  onChange={(e) => setLpAtual(e.target.value)}
                />
              </div>
            )}

            {USA_QUANTIDADE(servico) && (
              <div className={formStyles.field}>
                <label htmlFor="quantidade">
                  {servico === "coaching" ? "Número de sessões" : "Número de partidas"}
                </label>
                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>
            )}

            {extrasDoServico.length > 0 && (
              <div className={formStyles.field}>
                <label>Serviços extras (opcional)</label>
                <div className={styles.extras}>
                  {extrasDoServico.map((extra) => {
                    const selecionado = extrasSelecionados.includes(extra.id);
                    return (
                      <button
                        type="button"
                        key={extra.id}
                        className={`${styles.extraCard} ${selecionado ? styles.extraSelecionado : ""}`}
                        onClick={() => alternarExtra(extra.id)}
                        aria-pressed={selecionado}
                      >
                        <div className={styles.extraCheck}>
                          {selecionado && <Check size={14} />}
                        </div>
                        <div className={styles.extraTexto}>
                          <strong>{extra.label}</strong>
                          <p>{extra.descricao}</p>
                        </div>
                        <span className={styles.extraPreco}>
                          {extra.tipo === "percentual" ? `+${extra.valor}%` : `+R$${extra.valor}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

            <div className={styles.priceBox}>
              <div className={styles.priceInfo}>
                <span>Valor total</span>

                {precoOriginal && preco ? (
                  <>
                    <small className={styles.precoOriginal}>
                      {precoOriginal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                    </small>

                    <strong className={styles.precoFinal}>
                      {preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      })}
                    </strong>
                  </>
                ) : (
                  <strong>
                    {precoIndisponivel ? "Sob consulta" : "—"}
                  </strong>
                )}
              </div>

              {precoOriginal && preco && (
                <div className={styles.lancamentoBadge}>
                  <span>🔥 50% OFF</span>
                  <small>Promoção de lançamento</small>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={formStyles.submit}
              disabled={loading || !preco}
            >
              {loading
                ? "Redirecionando..."
                : user
                  ? "Pagar e enviar solicitação"
                  : "Continuar e criar conta"}
              <Send size={18} />
            </button>

          </motion.form>

        </div>

      </main>

      <Footer />
    </>
  );
}
