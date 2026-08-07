import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Sem isso, o React Router mantém a posição de rolagem da página
// anterior ao navegar (ex: "Voltar para a Home" no meio de uma página
// de serviço) — e também não sabe rolar até uma âncora (#services)
// quando o link vem de outra página, tipo /#services.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Dá um instante pra página/seção terminar de montar antes de rolar
      const id = hash.replace("#", "");

      const tentarRolar = () => {
        const elemento = document.getElementById(id);
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth" });
        }
      };

      const timeout = setTimeout(tentarRolar, 50);
      return () => clearTimeout(timeout);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
