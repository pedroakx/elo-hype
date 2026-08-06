import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import AuthLayout from "../../components/authLayout/AuthLayout";
import { supabase } from "../../lib/supabaseClient";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";

export default function RecuperarSenha() {
  useDocumentTitle("Recuperar senha");

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`
    });

    setLoading(false);

    if (error) {
      setError("Não foi possível enviar o e-mail. Tente novamente.");
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        subtitle={`Enviamos um link de recuperação para ${email}. Clique nele para escolher uma nova senha.`}
        footer={
          <>
            Lembrou a senha? <Link to="/entrar">Entrar</Link>
          </>
        }
      >
        <></>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha"
      footer={
        <>
          Lembrou a senha? <Link to="/entrar">Entrar</Link>
        </>
      }
    >
      <form className={formStyles.form} onSubmit={handleSubmit}>

        {error && <div className={formStyles.error}>{error}</div>}

        <div className={formStyles.field}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={formStyles.submit}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar link de recuperação"}
          <Mail size={18} />
        </button>

      </form>
    </AuthLayout>
  );
}
