import { useCallback, useEffect, useRef, useState } from "react";
import { mensajeDeError } from "../api/clienteVoluntariado";

export interface EstadoApi<T> {
  datos: T | undefined;
  cargando: boolean;
  error: string | null;
  /** Vuelve a pedir los datos; lo usan las pantallas después de escribir. */
  recargar: () => void;
}

interface Resultado<T> {
  clave: string;
  claveDependencias: string;
  datos: T | undefined;
  error: string | null;
}

/**
 * Carga datos de la API al montar y cada vez que cambian `dependencias`.
 *
 * `cargando` no se guarda: se deduce de si el último resultado corresponde a
 * la petición vigente. Una respuesta que llega tarde (dependencias ya
 * cambiadas, o componente desmontado) se descarta, y los datos de otras
 * dependencias no se muestran mientras llegan los nuevos: si no, un clic
 * rápido entre dos grupos podía pintar los datos del primero debajo del
 * título del segundo. Al recargar, en cambio, los datos anteriores se
 * conservan hasta que llegan los nuevos.
 */
export function useApi<T>(cargar: () => Promise<T>, dependencias: unknown[]): EstadoApi<T> {
  const [version, setVersion] = useState(0);
  const claveDependencias = JSON.stringify(dependencias);
  const clave = `${claveDependencias}#${version}`;
  const [resultado, setResultado] = useState<Resultado<T>>({
    clave: "",
    claveDependencias: "",
    datos: undefined,
    error: null,
  });

  const cargarRef = useRef(cargar);
  useEffect(() => {
    cargarRef.current = cargar;
  });

  useEffect(() => {
    let vigente = true;
    cargarRef
      .current()
      .then((datos) => {
        if (vigente) setResultado({ clave, claveDependencias, datos, error: null });
      })
      .catch((e) => {
        if (!vigente) return;
        setResultado((previo) => ({
          clave,
          claveDependencias,
          datos: previo.claveDependencias === claveDependencias ? previo.datos : undefined,
          error: mensajeDeError(e),
        }));
      });
    return () => {
      vigente = false;
    };
  }, [clave, claveDependencias]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  const mismasDependencias = resultado.claveDependencias === claveDependencias;

  return {
    datos: mismasDependencias ? resultado.datos : undefined,
    cargando: resultado.clave !== clave,
    error: resultado.clave === clave ? resultado.error : null,
    recargar,
  };
}
