import { LogOut, Trophy, User } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/elohypelogo.png";
import { useAuth } from "../../context/AuthContext";
import styles from "./StaffHeader.module.css";

export default function StaffHeader() {
  const { profile, signOut } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>

        <div className={styles.brand}>
          <img src={logo} alt="Elo Hype" className={styles.logo} />
          <span className={styles.badge}>Área da equipe</span>
        </div>

        <nav className={styles.nav}>
          <Link to="/equipe/painel" className={styles.navLink}>Pedidos</Link>
          <Link to="/equipe/ranking" className={styles.navLink}>
            <Trophy size={16} />
            Ranking
          </Link>
          <Link to="/equipe/perfil" className={styles.navLink}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className={styles.avatarMini} />
            ) : (
              <User size={16} />
            )}
            Perfil
          </Link>
        </nav>

        <div className={styles.userArea}>
          {profile && (
            <span className={styles.nivel}>
              Nível {profile.nivel} · {profile.percentual_comissao}%
            </span>
          )}

          <button className={styles.logout} onClick={signOut}>
            <LogOut size={18} />
            Sair
          </button>
        </div>

      </div>
    </header>
  );
}
