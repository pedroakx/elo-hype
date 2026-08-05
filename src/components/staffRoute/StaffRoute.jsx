import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "../protectedRoute/ProtectedRoute.module.css";

export default function StaffRoute({ children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/equipe/entrar" state={{ from: location }} replace />;
  }

  if (role !== "booster" && role !== "admin") {
    return <Navigate to="/equipe/entrar" state={{ acessoNegado: true }} replace />;
  }

  return children;
}
