import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Sem isso, o React Router mantém a posição de rolagem da página
// anterior ao navegar — por exemplo, ao clicar em "Voltar para a Home"
// estando no meio de uma página de serviço, a Home carregava no meio
// da rolagem em vez de aparecer do topo.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
