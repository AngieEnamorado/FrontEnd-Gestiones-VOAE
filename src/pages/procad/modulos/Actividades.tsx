import { useMemo, useState } from "react";
import { HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import BarraTabla, {
  BotonLimpiar,
  BuscadorTabla,
  CLASE_FILTRO,
} from "../../../components/procad/BarraTabla";
import BotonDecision, { SinAccion } from "../../../components/procad/BotonDecision";
import {
  columnasDe,
  descargarTabla,
  filasDe,
  type CampoTabla,
} from "../../../components/procad/camposTabla";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";
import type { ActividadProcad, EstadoActividadProcad } from "../../../types";

const ETIQUETA: Record<EstadoActividadProcad, string> = {
  PENDIENTE_VALIDACION: "Pendiente de validar",
  VALIDADA: "Validada",
  RECHAZADA: "Rechazada",
};

const TONO = {
  PENDIENTE_VALIDACION: "pendiente",
  VALIDADA: "activo",
  RECHAZADA: "negativo",
} as const;

const ORDEN_ESTADOS: EstadoActividadProcad[] = [
  "PENDIENTE_VALIDACION",
  "VALIDADA",
  "RECHAZADA",
];

interface AccionesCelda {
  resolver: (a: ActividadProcad, estado: EstadoActividadProcad) => void;
}

const CAMPOS: CampoTabla<ActividadProcad, AccionesCelda>[] = [
  {
    label: "Actividad",
    texto: (a) => a.titulo,
    celda: (a) => (
      <span className="block max-w-[280px] whitespace-normal font-medium text-slate-700">
        {a.titulo}
      </span>
    ),
  },
  {
    label: "Agrupación",
    texto: (a) => a.grupo,
    celda: (a) => <span className="whitespace-nowrap">{a.grupo}</span>,
  },
  {
    label: "Fecha",
    texto: (a) => a.fecha,
    celda: (a) => <span className="whitespace-nowrap">{a.fecha}</span>,
  },
  {
    label: "Inscritos",
    numerica: true,
    texto: (a) => String(a.inscritos),
    celda: (a) => a.inscritos,
  },
  {
    label: "Estado",
    texto: (a) => ETIQUETA[a.estado],
    celda: (a) => <PildoraEstado tono={TONO[a.estado]}>{ETIQUETA[a.estado]}</PildoraEstado>,
  },
  // Una columna por decisión, como en Estudiantes: la mano baja en vertical
  // por la columna de lo que está haciendo en vez de buscar el botón fila a
  // fila entre dos que miden lo mismo.
  {
    label: "Validar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (a, acciones) =>
      a.estado === "PENDIENTE_VALIDACION" ? (
        <BotonDecision
          tono="aprobar"
          etiqueta={`Validar «${a.titulo}»`}
          onClick={() => acciones.resolver(a, "VALIDADA")}
        >
          <HiOutlineCheck className="h-4 w-4" />
        </BotonDecision>
      ) : (
        <SinAccion />
      ),
  },
  {
    label: "Rechazar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (a, acciones) =>
      a.estado === "PENDIENTE_VALIDACION" ? (
        <BotonDecision
          tono="rechazar"
          etiqueta={`Rechazar «${a.titulo}»`}
          onClick={() => acciones.resolver(a, "RECHAZADA")}
        >
          <HiOutlineXMark className="h-4 w-4" />
        </BotonDecision>
      ) : (
        <SinAccion />
      ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

/**
 * Las actividades que reportan los encargados. Solo las validadas cuentan para
 * la elegibilidad del estudiante, así que validar aquí mueve las cifras de
 * todo el programa.
 */
export default function Actividades({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { actividades, resolverActividad } = useProcad();
  const [estado, setEstado] = useState<EstadoActividadProcad | "todos">("todos");
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("agrupaciones:actividades", COLUMNAS);

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return actividades.filter((a) => {
      if (estado !== "todos" && a.estado !== estado) return false;
      if (
        busqueda &&
        !a.titulo.toLowerCase().includes(busqueda) &&
        !a.grupo.toLowerCase().includes(busqueda)
      ) {
        return false;
      }
      return true;
    });
  }, [actividades, estado, texto]);

  const hayFiltros = estado !== "todos" || texto.trim() !== "";

  function confirmar(a: ActividadProcad, nuevoEstado: EstadoActividadProcad) {
    const valida = nuevoEstado === "VALIDADA";
    abrirDialogo({
      titulo: valida ? `¿Validar «${a.titulo}»?` : `¿Rechazar «${a.titulo}»?`,
      descripcion: valida
        ? `Agrupación: ${a.grupo}. Al validarla, la asistencia de esta actividad empieza a contar para la elegibilidad de sus integrantes.`
        : `Agrupación: ${a.grupo}. Al rechazarla, no cuenta para la elegibilidad de nadie.`,
      confirmar: "Sí, confirmar",
      tono: valida ? "aprobar" : "rechazar",
      onConfirmar: () => resolverActividad(a.id, nuevoEstado),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Las reporta el encargado de cada agrupación. Hasta que usted no la valide, la asistencia de
        una actividad no cuenta para la elegibilidad de nadie.
      </p>

      <BarraTabla
        conteo={
          filtradas.length === actividades.length
            ? `${actividades.length} ${actividades.length === 1 ? "actividad" : "actividades"}`
            : `${filtradas.length} de ${actividades.length}`
        }
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={() => descargarTabla("actividades-procad", CAMPOS, vista, filtradas)}
      >
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoActividadProcad | "todos")}
          aria-label="Estado de la actividad"
          className={`${CLASE_FILTRO} w-[190px]`}
        >
          <option value="todos">Todo estado</option>
          {ORDEN_ESTADOS.map((k) => (
            <option key={k} value={k}>
              {ETIQUETA[k]}
            </option>
          ))}
        </select>

        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Actividad o agrupación"
          etiqueta="Buscar por actividad o agrupación"
          ancho="w-[230px]"
        />

        {hayFiltros && (
          <BotonLimpiar
            onClick={() => {
              setEstado("todos");
              setTexto("");
            }}
          />
        )}
      </BarraTabla>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos
          vista={vista}
          anchoMinimo="940px"
          columnas={COLUMNAS}
          filas={filasDe(CAMPOS, filtradas, { resolver: confirmar })}
        />
      </div>
    </div>
  );
}
