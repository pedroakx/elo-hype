import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProtectedRoute.module.css";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  return children;
}
