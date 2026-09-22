import { useCallback, useEffect, useRef, useState } from "react";
import { mensajeDeError } from "./cliente";

interface Resultado<T> {
  /** null mientras carga por primera vez o si la carga falló. */
  datos: T | null;
  cargando: boolean;
  /** Mensaje ya legible para el usuario; null si todo fue bien. */
  error: string | null;
  /** Vuelve a pedir los datos (p. ej. tras guardar), sin vaciar la pantalla mientras llega. */
  recargar: () => void;
}

/**
 * Carga datos de la API al montar y cada vez que cambian las `dependencias`.
 * Las respuestas de una petición vieja se descartan, así que un filtro que
 * cambia rápido no deja en pantalla el resultado de la búsqueda anterior.
 *
 * `cargar` puede cambiar en cada render (es una función anónima); lo que
 * decide cuándo volver a pedir es solo `dependencias`.
 */
export function useConsulta<T>(cargar: () => Promise<T>, dependencias: readonly unknown[]): Resultado<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // Siempre la versión más reciente de `cargar`, sin obligar a quien llama a memorizarla.
  // Se actualiza en un efecto (declarado antes que el de carga, así que corre primero).
  const cargarRef = useRef(cargar);
  useEffect(() => {
    cargarRef.current = cargar;
  });

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    cargarRef
      .current()
      .then((resultado) => {
        if (!vigente) return;
        setDatos(resultado);
        setCargando(false);
      })
      .catch((causa: unknown) => {
        if (!vigente) return;
        setError(mensajeDeError(causa));
        setCargando(false);
      });

    return () => {
      vigente = false;
    };
    // eslint-disable-next-line -- las dependencias las define quien llama.
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { datos, cargando, error, recargar };
}
