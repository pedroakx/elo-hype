import { useEffect } from "react";

const BASE_TITLE = "Elo Hype";

export function useDocumentTitle(titulo) {
  useEffect(() => {
    const anterior = document.title;
    document.title = titulo ? `${titulo} · ${BASE_TITLE}` : BASE_TITLE;

    return () => {
      document.title = anterior;
    };
  }, [titulo]);
}
