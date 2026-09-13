import { createContext, useContext } from "react";

/**
 * El modo «armar reporte» del panel de estadísticas.
 *
 * No hay ventana emergente: se elige sobre las tarjetas de siempre, en la
 * vista general. Mientras el modo está activo, cada tarjeta se dibuja con su
 * casilla y responde al clic; el estado vive en la página, y esto es solo el
 * cable que lo lleva hasta la tarjeta sin pasarlo de componente en componente
 * por las seis secciones.
 *
 * El valor por defecto está apagado, para que una tarjeta usada fuera del
 * panel —el reporte, por ejemplo— siga funcionando igual.
 */
export interface ValorSeleccion {
  activo: boolean;
  estaSeleccionada: (numero: string) => boolean;
  alternar: (numero: string) => void;
}

export const ContextoSeleccion = createContext<ValorSeleccion>({
  activo: false,
  estaSeleccionada: () => false,
  alternar: () => {},
});

export function useSeleccionReporte() {
  return useContext(ContextoSeleccion);
}
