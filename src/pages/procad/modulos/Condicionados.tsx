import { useMemo, useState } from "react";
import { HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import AvatarIniciales from "../../../components/procad/AvatarIniciales";
import BarraTabla, {
  BotonLimpiar,
  BuscadorTabla,
} from "../../../components/procad/BarraTabla";
import BotonDecision from "../../../components/procad/BotonDecision";
import {
  columnasDe,
  descargarTabla,
  filasDe,
  type CampoTabla,
} from "../../../components/procad/camposTabla";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";
import type { CondicionadoPendiente } from "../../../types";

interface AccionesCelda {
  resolver: (c: CondicionadoPendiente, autorizar: boolean) => void;
}

const CAMPOS: CampoTabla<CondicionadoPendiente, AccionesCelda>[] = [
  {
    label: "Estudiante",
    texto: (c) => c.nombre,
    celda: (c) => (
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <AvatarIniciales nombre={c.nombre} />
        <span className="font-medium text-slate-700">{c.nombre}</span>
      </span>
    ),
  },
  {
    label: "Cuenta",
    texto: (c) => c.cuenta,
    celda: (c) => <span className="font-mono text-xs">{c.cuenta}</span>,
  },
  { label: "Agrupación", texto: (c) => c.grupo, celda: (c) => c.grupo },
  {
    label: "Propuesto por",
    texto: (c) => c.propone,
    celda: (c) => <span className="whitespace-nowrap">{c.propone}</span>,
  },
  {
    label: "Justificación",
    texto: (c) => c.justificacion,
    celda: (c) => (
      <span className="block max-w-[320px] whitespace-normal leading-relaxed">
        {c.justificacion}
      </span>
    ),
  },
  {
    label: "Autorizar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (c, acciones) => (
      <BotonDecision
        tono="aprobar"
        etiqueta={`Autorizar a ${c.nombre} como condicionado`}
        onClick={() => acciones.resolver(c, true)}
      >
        <HiOutlineCheck className="h-4 w-4" />
      </BotonDecision>
    ),
  },
  {
    label: "Rechazar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (c, acciones) => (
      <BotonDecision
        tono="rechazar"
        etiqueta={`Rechazar la propuesta para ${c.nombre}`}
        onClick={() => acciones.resolver(c, false)}
      >
        <HiOutlineXMark className="h-4 w-4" />
      </BotonDecision>
    ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

/**
 * Excepción de talento: un encargado propone a un estudiante cuyo índice no
 * alcanza el mínimo. El administrador es la segunda firma — sin ella la
 * solicitud no puede quedar aprobada.
 */
export default function Condicionados({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { condicionados, resolverCondicionado } = useProcad();
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("estudiantes:condicionados", COLUMNAS);

  const filtrados = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    if (!busqueda) return condicionados;
    return condicionados.filter(
      (c) => c.nombre.toLowerCase().includes(busqueda) || c.cuenta.includes(busqueda),
    );
  }, [condicionados, texto]);

  function confirmar(c: CondicionadoPendiente, autorizar: boolean) {
    abrirDialogo({
      titulo: autorizar
        ? `¿Autorizar a ${c.nombre} como condicionado?`
        : `¿Rechazar la propuesta para ${c.nombre}?`,
      descripcion: autorizar
        ? `Propuesto por ${c.propone}. Al autorizar, su solicitud queda aprobada con la doble firma completa.`
        : `Propuesto por ${c.propone}. Explique por qué no procede: es lo que le queda a él —y a quien audite— para entender la decisión.`,
      confirmar: autorizar ? "Sí, autorizar" : "Sí, rechazar",
      tono: autorizar ? "aprobar" : "rechazar",
      // Rechazar pide motivo; autorizar no. Negarle a alguien una excepción de
      // talento sin decir por qué deja al encargado sin nada que corregir.
      campos: autorizar
        ? undefined
        : [
            {
              id: "motivo",
              label: "Motivo del rechazo",
              multilinea: true,
              marcador: "Ej. La justificación no acredita el talento alegado.",
            },
          ],
      nota: "Usted queda registrado como la segunda firma de esta decisión.",
      onConfirmar: (valores) => resolverCondicionado(c.id, autorizar, valores.motivo),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Cada una llega con la firma del encargado que la propone. La suya es la segunda, y sin ella
        la solicitud del estudiante no puede quedar aprobada.
      </p>

      <BarraTabla
        conteo={
          filtrados.length === condicionados.length
            ? `${condicionados.length} ${condicionados.length === 1 ? "propuesta" : "propuestas"}`
            : `${filtrados.length} de ${condicionados.length}`
        }
        vista={vista}
        hayFilas={filtrados.length > 0}
        onDescargar={() => descargarTabla("condicionados-procad", CAMPOS, vista, filtrados, "Condicionados")}
      >
        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Nombre o cuenta"
          etiqueta="Buscar por nombre o cuenta"
        />
        {texto.trim() !== "" && <BotonLimpiar onClick={() => setTexto("")} />}
      </BarraTabla>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos
          vista={vista}
          anchoMinimo="980px"
          columnas={COLUMNAS}
          filas={filasDe(CAMPOS, filtrados, { resolver: confirmar })}
        />
        {condicionados.length === 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Cuando un encargado proponga una excepción de talento, aparecerá aquí esperando su
            firma.
          </p>
        )}
      </div>
    </div>
  );
}
