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
import type { ExpulsionPendiente } from "../../../types";

interface AccionesCelda {
  resolver: (x: ExpulsionPendiente, aprobar: boolean) => void;
}

const CAMPOS: CampoTabla<ExpulsionPendiente, AccionesCelda>[] = [
  {
    label: "Estudiante",
    texto: (x) => x.nombre,
    celda: (x) => (
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <AvatarIniciales nombre={x.nombre} />
        <span className="font-medium text-slate-700">{x.nombre}</span>
      </span>
    ),
  },
  {
    label: "Cuenta",
    texto: (x) => x.cuenta,
    celda: (x) => <span className="font-mono text-xs">{x.cuenta}</span>,
  },
  { label: "Agrupación", texto: (x) => x.grupo, celda: (x) => x.grupo },
  {
    label: "Solicitada por",
    texto: (x) => x.solicita,
    celda: (x) => <span className="block max-w-[220px] whitespace-normal">{x.solicita}</span>,
  },
  {
    label: "Motivo",
    texto: (x) => x.motivo,
    celda: (x) => <span className="whitespace-nowrap">{x.motivo}</span>,
  },
  {
    label: "Detalle",
    texto: (x) => x.detalle,
    celda: (x) => (
      <span className="block max-w-[280px] whitespace-normal leading-relaxed">{x.detalle}</span>
    ),
  },
  {
    // Aprobar una expulsión es la decisión dura de esta pantalla, así que va en
    // rojo: el color dice lo que hace, no si es el botón principal.
    label: "Aprobar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (x, acciones) => (
      <BotonDecision
        tono="rechazar"
        etiqueta={`Aprobar la expulsión de ${x.nombre}`}
        onClick={() => acciones.resolver(x, true)}
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
    celda: (x, acciones) => (
      <BotonDecision
        tono="aprobar"
        etiqueta={`Rechazar la expulsión de ${x.nombre}: el estudiante se queda`}
        onClick={() => acciones.resolver(x, false)}
      >
        <HiOutlineXMark className="h-4 w-4" />
      </BotonDecision>
    ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

/**
 * Solo el administrador resuelve una expulsión, y la decisión queda en firme:
 * no hay apelación. Por eso el diálogo lo dice antes de confirmar.
 */
export default function Expulsiones({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { expulsiones, resolverExpulsion } = useProcad();
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("estudiantes:expulsiones", COLUMNAS);

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    if (!busqueda) return expulsiones;
    return expulsiones.filter(
      (x) => x.nombre.toLowerCase().includes(busqueda) || x.cuenta.includes(busqueda),
    );
  }, [expulsiones, texto]);

  function confirmar(x: ExpulsionPendiente, aprobar: boolean) {
    abrirDialogo({
      titulo: aprobar
        ? `¿Aprobar la expulsión de ${x.nombre}?`
        : `¿Rechazar la expulsión de ${x.nombre}?`,
      descripcion: aprobar
        ? `Motivo: ${x.motivo}. Su solicitud pasará a Expulsado de inmediato.`
        : `Motivo: ${x.motivo}. El estudiante se queda; explique por qué la solicitud no procede.`,
      confirmar: aprobar ? "Sí, aprobar" : "Sí, rechazar",
      tono: aprobar ? "rechazar" : "aprobar",
      // Rechazar deja al encargado con una expulsión negada: sin el motivo
      // escrito no tiene cómo saber si el caso se rehace o se cierra.
      campos: aprobar
        ? undefined
        : [
            {
              id: "motivo",
              label: "Motivo del rechazo",
              multilinea: true,
              marcador: "Ej. La falta no amerita expulsión; corresponde una amonestación.",
            },
          ],
      nota: "Esta decisión no admite apelación.",
      onConfirmar: (valores) => resolverExpulsion(x.id, aprobar, valores.motivo),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Las envía el encargado de la agrupación y las resuelve usted. Aprobarla saca al estudiante
        del programa en el acto, y no admite apelación.
      </p>

      <BarraTabla
        conteo={
          filtradas.length === expulsiones.length
            ? `${expulsiones.length} sin resolver`
            : `${filtradas.length} de ${expulsiones.length}`
        }
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={() => descargarTabla("expulsiones-procad", CAMPOS, vista, filtradas, "Expulsiones")}
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
          anchoMinimo="1060px"
          columnas={COLUMNAS}
          filas={filasDe(CAMPOS, filtradas, { resolver: confirmar })}
        />
        {expulsiones.length === 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Las solicitudes de expulsión que envíen los encargados aparecerán aquí sin resolver.
          </p>
        )}
      </div>
    </div>
  );
}
