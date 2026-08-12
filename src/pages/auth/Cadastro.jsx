import { useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { UserPlus } from "lucide-react";

import AuthLayout from "../../components/authLayout/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import formStyles from "../../components/authLayout/AuthForm.module.css";

export default function Cadastro() {
  useDocumentTitle("Criar conta");

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const captchaRef = useRef(null);

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/dashboard";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (!captchaToken) {
      setError("Complete o CAPTCHA para continuar.");
      return;
    }

    setLoading(true);

    const { data, error } = await signUp({
      email,
      password,
      nome,
      captchaToken
    });

    setLoading(false);

    // O token do hCaptcha é de uso único.
    // Resetamos o desafio após cada tentativa.
    captchaRef.current?.resetCaptcha();
    setCaptchaToken("");

    if (error) {
      setError(
        error.message === "User already registered"
          ? "Esse e-mail já está cadastrado."
          : "Não foi possível criar a conta. Tente novamente."
      );
      return;
    }

    // Com "Confirm email" ativado no Supabase,
    // normalmente data.session será null.
    if (data.session) {
      navigate(from, { replace: true });
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
        <Link
          to="/entrar"
          state={{ from: location.state?.from }}
          className={formStyles.submit}
          style={{ marginTop: 28 }}
        >
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
          Já tem conta?{" "}
          <Link
            to="/entrar"
            state={{ from: location.state?.from }}
          >
            Entrar
          </Link>
        </>
      }
    >
      <form
        className={formStyles.form}
        onSubmit={handleSubmit}
      >
        {error && (
          <div className={formStyles.error}>
            {error}
          </div>
        )}

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
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
                console.log("HCAPTCHA SITE KEY:", import.meta.env.VITE_HCAPTCHA_SITE_KEY);
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "20px 0"
          }}
        >
          
          <HCaptcha
            ref={captchaRef}
            sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
            onVerify={(token) => {
              setCaptchaToken(token);
            }}
            onExpire={() => {
              setCaptchaToken("");
            }}
            onError={() => {
              setCaptchaToken("");
              setError("Não foi possível validar o CAPTCHA. Tente novamente.");
            }}
          />
        </div>

        <button
          type="submit"
          className={formStyles.submit}
          disabled={loading || !captchaToken}
        >
          {loading ? "Criando conta..." : "Criar conta"}
          <UserPlus size={18} />
        </button>

        <p className={formStyles.termos}>
          Ao criar sua conta, você concorda com nossos{" "}
          <Link to="/termos">
            Termos de Uso e Privacidade
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}