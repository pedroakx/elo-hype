import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";

import AuthLayout from "../../components/authLayout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";

export default function Login() {
  useDocumentTitle("Entrar");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    
    const { error } = await signIn({ email, password });
    

    setLoading(false);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Tente novamente."
      );
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <AuthLayout
      title="Entrar na sua conta"
      subtitle="Acompanhe seus pedidos no seu dashboard"
      footer={
        <>
          Ainda não tem conta? <Link to="/cadastro" state={{ from: location.state?.from }}>Criar conta</Link>
          <div className={formStyles.staffLink}>
            É da equipe? <Link to="/equipe/entrar">Entrar como booster/admin</Link>
          </div>
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

        <div className={formStyles.field}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Link to="/recuperar-senha" className={formStyles.esqueceuSenha}>
          Esqueci minha senha
        </Link>

        <button
          type="submit"
          className={formStyles.submit}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
          <LogIn size={18} />
        </button>

      </form>
    </AuthLayout>
  );
}
