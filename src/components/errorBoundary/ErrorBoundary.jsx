import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./ErrorBoundary.module.css";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Loga no console pra facilitar o diagnóstico em produção
    console.error("Erro capturado pelo ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.page}>
          <div className={styles.content}>
            <AlertTriangle size={44} />
            <h1>Algo deu errado</h1>
            <p>Tente recarregar a página. Se o problema continuar, entre em contato com a gente.</p>
            <button className={styles.button} onClick={() => window.location.reload()}>
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
