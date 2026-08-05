import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import AuthLayout from "../../components/authLayout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";

export default function StaffLogin() {
  useDocumentTitle("Área da equipe · Entrar");
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    location.state?.acessoNegado
      ? "Essa conta não tem acesso à área de funcionários."
      : null
  );
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/equipe/painel";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await signIn({ email, password });

    if (signInError) {
      setLoading(false);
      setError(
        signInError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Tente novamente."
      );
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (profile?.role !== "booster" && profile?.role !== "admin") {
      await signOut();
      setError("Essa conta não tem acesso à área de funcionários.");
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <AuthLayout
      title="Área da equipe"
      subtitle="Login exclusivo para boosters e administradores"
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

        <button
          type="submit"
          className={formStyles.submit}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
          <ShieldCheck size={18} />
        </button>

      </form>
    </AuthLayout>
  );
}
