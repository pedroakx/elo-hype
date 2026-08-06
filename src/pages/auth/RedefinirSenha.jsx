import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound } from "lucide-react";

import AuthLayout from "../../components/authLayout/AuthLayout";
import { supabase } from "../../lib/supabaseClient";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";

export default function RedefinirSenha() {
  useDocumentTitle("Redefinir senha");
  const navigate = useNavigate();

  const [pronto, setPronto] = useState(false);
  const [linkInvalido, setLinkInvalido] = useState(false);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    let prontoAgora = false;

    // O link do e-mail abre a página já com uma sessão temporária de
    // recuperação — só liberamos o formulário depois de confirmar isso.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        prontoAgora = true;
        setPronto(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        prontoAgora = true;
        setPronto(true);
      }
    });

    // Se depois de alguns segundos nenhuma sessão de recuperação apareceu,
    // o link provavelmente é inválido ou já expirou
    const timeout = setTimeout(() => {
      if (!prontoAgora) setLinkInvalido(true);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (senha.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: senha });

    setLoading(false);

    if (error) {
      setError("Não foi possível redefinir sua senha. Tente pedir um novo link.");
      return;
    }

    setSucesso(true);
    setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
  }

  if (sucesso) {
    return (
      <AuthLayout
        title="Senha redefinida!"
        subtitle="Você já pode acompanhar seus pedidos. Redirecionando..."
      />
    );
  }

  if (!pronto) {
    return (
      <AuthLayout
        title={linkInvalido ? "Link inválido ou expirado" : "Confirmando link..."}
        subtitle={
          linkInvalido
            ? "Peça um novo link de recuperação e tente novamente."
            : "Só um instante."
        }
        footer={
          linkInvalido && (
            <Link to="/recuperar-senha">Pedir novo link</Link>
          )
        }
      />
    );
  }

  return (
    <AuthLayout
      title="Escolha uma nova senha"
      subtitle="Sua nova senha precisa ter pelo menos 8 caracteres"
    >
      <form className={formStyles.form} onSubmit={handleSubmit}>

        {error && <div className={formStyles.error}>{error}</div>}

        <div className={formStyles.field}>
          <label htmlFor="senha">Nova senha</label>
          <input
            id="senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div className={formStyles.field}>
          <label htmlFor="confirmarSenha">Confirmar nova senha</label>
          <input
            id="confirmarSenha"
            type="password"
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={formStyles.submit}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Redefinir senha"}
          <KeyRound size={18} />
        </button>

      </form>
    </AuthLayout>
  );
}
