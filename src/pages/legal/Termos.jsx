import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import styles from "./Termos.module.css";

export default function Termos() {
  useDocumentTitle("Termos de Uso e Privacidade");

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className={styles.container}>

          <span className={styles.badge}>Última atualização: agosto de 2026</span>
          <h1>Termos de Uso e Política de Privacidade</h1>
          <p className={styles.intro}>
            Este documento explica como o Elo Hype funciona, o que esperamos
            de você como cliente e como tratamos seus dados. Leia com atenção
            antes de usar nossos serviços.
          </p>

          <section>
            <h2>1. Quem somos e o que oferecemos</h2>
            <p>
              O Elo Hype presta serviços de Elo Boost, Duo Boost, Coaching e
              Partidas de Colocação para o jogo League of Legends, realizados
              por jogadores independentes ("boosters") cadastrados em nossa
              plataforma.
            </p>
          </section>

          <section>
            <h2>2. Natureza do serviço e riscos para sua conta</h2>
            <p>
              Serviços de boosting — em que outra pessoa acessa e joga em sua
              conta, ou joga ao seu lado com o objetivo de elevar seu elo —
              não são endossados pela Riot Games e podem contrariar os Termos
              de Serviço do League of Legends. Ao contratar qualquer um dos
              nossos serviços, você reconhece e aceita esse risco, incluindo a
              possibilidade de penalidades aplicadas pela Riot Games à sua
              conta. O Elo Hype não se responsabiliza por sanções, suspensões
              ou banimentos aplicados por terceiros (incluindo a Riot Games)
              em decorrência do uso dos nossos serviços.
            </p>
          </section>

          <section>
            <h2>3. Cadastro e conta</h2>
            <p>
              Para contratar um serviço, é necessário criar uma conta com
              nome, e-mail e senha. Você é responsável por manter suas
              credenciais em sigilo e por todas as atividades realizadas na
              sua conta. Boosters não têm acesso automático aos seus dados de
              login do League of Legends através da nossa plataforma — as
              credenciais de jogo, quando necessárias, são combinadas
              diretamente entre você e o booster pelo chat interno.
            </p>
          </section>

          <section>
            <h2>4. Pagamentos e reembolsos</h2>
            <p>
              Os pagamentos são processados por um parceiro externo
              (Mercado Pago), via Pix ou cartão. Os preços são calculados
              automaticamente conforme o serviço, elo atual e elo desejado, e
              exibidos antes da confirmação do pagamento.
            </p>
            <p>
              Reembolsos podem ser solicitados antes de um booster assumir o
              pedido. Após o início do serviço (pedido em andamento), o
              reembolso fica sujeito à análise do caso individual, considerando
              o progresso já realizado. Entre em contato pelos canais abaixo
              para solicitar.
            </p>
          </section>

          <section>
            <h2>5. Dados que coletamos</h2>
            <p>Coletamos os seguintes dados pessoais, na medida em que você os fornece:</p>
            <ul>
              <li>Nome e e-mail, no cadastro da conta</li>
              <li>Dados de pagamento, processados diretamente pelo Mercado Pago — não armazenamos número de cartão em nossos servidores</li>
              <li>Nomeiscord e nick da conta de LoL, se você for um booster e optar por preencher seu perfil</li>
              <li>Mensagens trocadas no chat entre cliente e booster, vinculadas ao pedido correspondente</li>
            </ul>
          </section>

          <section>
            <h2>6. Como usamos e protegemos seus dados</h2>
            <p>
              Usamos seus dados exclusivamente para viabilizar a prestação do
              serviço contratado: identificar sua conta, processar pagamentos,
              conectar você ao booster responsável pelo seu pedido e permitir
              a comunicação entre as partes. Não vendemos nem compartilhamos
              seus dados com terceiros para fins de publicidade.
            </p>
            <p>
              Seus dados ficam armazenados em banco de dados protegido por
              controle de acesso, garantindo que cada cliente e booster só
              visualize as informações relacionadas aos próprios pedidos.
            </p>
          </section>

          <section>
            <h2>7. Seus direitos (LGPD)</h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
              você pode solicitar a qualquer momento a confirmação, correção,
              portabilidade ou eliminação dos seus dados pessoais, entrando em
              contato pelos canais informados abaixo.
            </p>
          </section>

          <section>
            <h2>8. Limitação de responsabilidade</h2>
            <p>
              O Elo Hype atua como intermediário entre clientes e boosters
              independentes. Fazemos o possível para garantir a qualidade do
              serviço, mas não garantimos resultado específico de desempenho
              em jogo além do que foi acordado no pedido.
            </p>
          </section>

          <section>
            <h2>9. Alterações destes termos</h2>
            <p>
              Podemos atualizar este documento periodicamente. Mudanças
              relevantes serão comunicadas por e-mail ou aviso no site.
            </p>
          </section>

          <section>
            <h2>10. Contato</h2>
            <p>
              Dúvidas sobre estes termos, solicitações de reembolso ou
              exercício dos seus direitos sobre dados pessoais podem ser
              enviadas para{" "}
              <a href="mailto:elohypeinc@gmail.com">elohypeinc@gmail.com</a>{" "}
              ou pelo nosso{" "}
              <a href="https://discord.gg/mAmrt3XSBN" target="_blank" rel="noopener noreferrer">
                Discord
              </a>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
