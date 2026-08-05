import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

import AuthLayout from "../../components/authLayout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import formStyles from "../../components/authLayout/AuthForm.module.css";

export default function Cadastro() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { data, error } = await signUp({ email, password, nome });

    setLoading(false);

    if (error) {
      setError(
        error.message === "User already registered"
          ? "Esse e-mail já está cadastrado."
          : "Não foi possível criar a conta. Tente novamente."
      );
      return;
    }

    // Se a confirmação de e-mail estiver desativada no Supabase,
    // já existe uma sessão ativa e o usuário pode ir direto ao dashboard.
    if (data.session) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <AuthLayout
        title="Quase lá!"
        subtitle="Enviamos um link de confirmação para o seu e-mail. Confirme para acessar seu dashboard."
      >
        <Link to="/entrar" className={formStyles.submit} style={{ marginTop: 28 }}>
          Ir para o login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Acompanhe seus pedidos em um só lugar"
      footer={
        <>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </>
      }
    >
      <form className={formStyles.form} onSubmit={handleSubmit}>

        {error && <div className={formStyles.error}>{error}</div>}

        <div className={formStyles.field}>
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={formStyles.submit}
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Criar conta"}
          <UserPlus size={18} />
        </button>

      </form>
    </AuthLayout>
  );
}
