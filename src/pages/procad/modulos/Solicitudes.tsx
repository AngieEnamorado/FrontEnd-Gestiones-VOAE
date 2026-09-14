import { useMemo, useState } from "react";
import { HiOutlineCheck, HiOutlineEye, HiOutlinePencil, HiOutlineXMark } from "react-icons/hi2";
import AvatarIniciales from "../../../components/procad/AvatarIniciales";
import BarraTabla, {
  BotonLimpiar,
  BuscadorTabla,
  CLASE_FILTRO,
} from "../../../components/procad/BarraTabla";
import BotonDecision, { SinAccion, SinDato } from "../../../components/procad/BotonDecision";
import {
  columnasDe,
  descargarTabla,
  filasDe,
  type CampoTabla,
} from "../../../components/procad/camposTabla";
import FichaEstudiante from "../../../components/procad/FichaEstudiante";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { ETIQUETA_ESTADO, ORDEN_ESTADOS } from "../../../components/procad/paleta";
import { useProcad } from "../../../context/ProcadContext";
import { CENTROS, INDICE_MINIMO } from "../../../data/mockProcadEstadisticas";
import type { EstadoSolicitudProcad, SolicitudProcad, TipoAgrupacion } from "../../../types";

const TONO_ESTADO = {
  aprobada: "activo",
  pendiente: "pendiente",
  observada: "info",
  noCumple: "negativo",
} as const;

/** La fecha en corto: en una tabla, «19 ago 2026» se lee de un vistazo. */
function enCorto(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-HN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ETIQUETA_TIPO: Record<TipoAgrupacion, string> = {
  deportivo: "Deportiva",
  artistico: "Artística",
};

/**
 * En reposo los tres botones son grises; el color aparece al acercarse o al
 * llegar con el teclado. Con tres acciones coloreadas en cada fila —y una
 * píldora de estado al lado— ninguna destacaba: la fila entera era un semáforo.
 * Gris, la vista baja por la tabla leyendo datos, y el color aparece justo
 * cuando la mano ya eligió qué va a pulsar.
 */
/** Lo que la celda necesita del módulo para hacer algo al pulsarla. */
interface AccionesCelda {
  verFicha: (s: SolicitudProcad) => void;
  resolver: (id: number, nombre: string, estado: EstadoSolicitudProcad) => void;
}

const CAMPOS: CampoTabla<SolicitudProcad, AccionesCelda>[] = [
  {
    label: "Estudiante",
    texto: (s) => s.nombre,
    celda: (s) => (
      <span className="flex items-center gap-2.5 whitespace-nowrap">
        <AvatarIniciales nombre={s.nombre} />
        <span className="font-medium text-slate-700">{s.nombre}</span>
      </span>
    ),
  },
  {
    label: "Cuenta",
    texto: (s) => s.cuenta,
    celda: (s) => <span className="font-mono text-xs">{s.cuenta}</span>,
  },
  {
    label: "Tipo",
    texto: (s) => ETIQUETA_TIPO[s.tipo],
    celda: (s) => ETIQUETA_TIPO[s.tipo],
  },
  { label: "Agrupación", texto: (s) => s.grupo, celda: (s) => s.grupo },
  {
    label: "Campus",
    texto: (s) => s.centro,
    celda: (s) => <span className="whitespace-nowrap">{s.centro}</span>,
  },
  {
    label: "Carrera",
    texto: (s) => s.carrera,
    celda: (s) => <span className="whitespace-nowrap">{s.carrera}</span>,
  },
  {
    label: "Posición",
    ocultaAlInicio: true,
    texto: (s) => s.posicion ?? "",
    celda: (s) => s.posicion ?? <SinDato />,
  },
  {
    label: "Instrumento",
    ocultaAlInicio: true,
    texto: (s) => s.instrumento ?? "",
    celda: (s) => s.instrumento ?? <SinDato />,
  },
  {
    label: "Nivel",
    ocultaAlInicio: true,
    texto: (s) => s.nivelExperiencia ?? "",
    celda: (s) => s.nivelExperiencia ?? <SinDato />,
  },
  {
    label: "Correo",
    ocultaAlInicio: true,
    texto: (s) => s.correo,
    celda: (s) => <span className="text-xs">{s.correo}</span>,
  },
  {
    label: "Teléfono",
    ocultaAlInicio: true,
    texto: (s) => s.telefono,
    celda: (s) => <span className="whitespace-nowrap font-mono text-xs">{s.telefono}</span>,
  },
  {
    label: "Identidad",
    ocultaAlInicio: true,
    texto: (s) => s.identidad,
    celda: (s) => <span className="whitespace-nowrap font-mono text-xs">{s.identidad}</span>,
  },
  {
    label: "Sexo",
    ocultaAlInicio: true,
    texto: (s) => (s.sexo === "F" ? "Femenino" : "Masculino"),
    celda: (s) => (s.sexo === "F" ? "Femenino" : "Masculino"),
  },
  {
    label: "Contacto de emergencia",
    ocultaAlInicio: true,
    texto: (s) => `${s.contactoEmergencia.nombre} · ${s.contactoEmergencia.telefono}`,
    celda: (s) => (
      <span className="whitespace-nowrap">
        {s.contactoEmergencia.nombre}
        <span className="ml-1.5 font-mono text-xs text-slate-400">
          {s.contactoEmergencia.telefono}
        </span>
      </span>
    ),
  },
  {
    label: "Período",
    ocultaAlInicio: true,
    texto: (s) => s.periodo,
    celda: (s) => s.periodo,
  },
  {
    label: "Solicitada",
    ocultaAlInicio: true,
    texto: (s) => enCorto(s.fechaSolicitud),
    celda: (s) => <span className="whitespace-nowrap">{enCorto(s.fechaSolicitud)}</span>,
  },
  {
    label: "Índice",
    numerica: true,
    texto: (s) => `${s.indice}%`,
    // Por debajo del mínimo se marca: es el único número de la tabla que puede
    // cambiar una decisión por sí solo.
    celda: (s) => (
      <span className={s.indice < INDICE_MINIMO ? "font-semibold text-rose-600" : ""}>
        {s.indice}%
      </span>
    ),
  },
  {
    label: "Índice global",
    numerica: true,
    ocultaAlInicio: true,
    texto: (s) => `${s.indiceGlobal}%`,
    celda: (s) => `${s.indiceGlobal}%`,
  },
  {
    label: "Matrícula",
    ocultaAlInicio: true,
    texto: (s) => (s.matriculaVerificada ? "Verificada" : "Sin verificar"),
    celda: (s) =>
      s.matriculaVerificada ? (
        "Verificada"
      ) : (
        <span className="text-amber-700">Sin verificar</span>
      ),
  },
  {
    label: "Estado",
    texto: (s) => ETIQUETA_ESTADO[s.estado],
    celda: (s) => (
      <PildoraEstado tono={TONO_ESTADO[s.estado]}>{ETIQUETA_ESTADO[s.estado]}</PildoraEstado>
    ),
  },
  {
    // La ficha tiene columna propia y no va entre las acciones: mirar a quién
    // se está resolviendo es el paso de antes, no una decisión más.
    label: "Ficha",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (s, acciones) => (
      <span className="flex justify-center">
        <button
          type="button"
          onClick={() => acciones.verFicha(s)}
          title={`Ver la ficha de ${s.nombre}`}
          aria-label={`Ver la ficha de ${s.nombre}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-[background-color,color,transform] duration-150 ease-suave hover:bg-unah-navy/5 hover:text-unah-navy active:scale-95"
        >
          <HiOutlineEye className="h-[18px] w-[18px]" />
        </button>
      </span>
    ),
  },
  // Una columna por decisión y no un racimo de botones en una sola: así cada
  // acción se puede ocultar o fijar por su cuenta, la fila deja de medir lo que
  // miden tres botones seguidos, y la mano baja en vertical por la columna de
  // la decisión que está tomando en vez de buscarla fila por fila.
  {
    label: "Aprobar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (s, acciones) =>
      s.estado === "pendiente" ? (
        <BotonDecision
          tono="aprobar"
          etiqueta={`Aprobar la solicitud de ${s.nombre}`}
          onClick={() => acciones.resolver(s.id, s.nombre, "aprobada")}
        >
          <HiOutlineCheck className="h-4 w-4" />
        </BotonDecision>
      ) : (
        <SinAccion />
      ),
  },
  {
    label: "Observar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (s, acciones) =>
      s.estado === "pendiente" ? (
        <BotonDecision
          tono="observar"
          etiqueta={`Observar la solicitud de ${s.nombre}`}
          onClick={() => acciones.resolver(s.id, s.nombre, "observada")}
        >
          <HiOutlinePencil className="h-4 w-4" />
        </BotonDecision>
      ) : (
        <SinAccion />
      ),
  },
  {
    label: "No cumple",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (s, acciones) =>
      s.estado === "pendiente" ? (
        <BotonDecision
          tono="rechazar"
          etiqueta={`Marcar que ${s.nombre} no cumple el requisito`}
          onClick={() => acciones.resolver(s.id, s.nombre, "noCumple")}
        >
          <HiOutlineXMark className="h-4 w-4" />
        </BotonDecision>
      ) : (
        <SinAccion />
      ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

export default function Solicitudes({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { solicitudes, resolverSolicitud } = useProcad();
  const [centro, setCentro] = useState("todos");
  const [estado, setEstado] = useState<EstadoSolicitudProcad | "todos">("todos");
  const [texto, setTexto] = useState("");
  /** La solicitud cuya ficha se está viendo, o `null` con la ficha cerrada. */
  const [ficha, setFicha] = useState<SolicitudProcad | null>(null);
  // La vista se crea aquí y no dentro de la tabla porque su botón va arriba,
  // con los demás filtros: elegir columnas es filtrar, solo que a lo ancho.
  const vista = useVistaTabla("estudiantes:solicitudes", COLUMNAS);

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return solicitudes.filter((s) => {
      if (centro !== "todos" && s.centro !== centro) return false;
      if (estado !== "todos" && s.estado !== estado) return false;
      if (busqueda && !s.nombre.toLowerCase().includes(busqueda) && !s.cuenta.includes(busqueda)) {
        return false;
      }
      return true;
    });
  }, [solicitudes, centro, estado, texto]);

  const hayFiltros = centro !== "todos" || estado !== "todos" || texto.trim() !== "";

  /**
   * Lo que se ve es lo que se descarga: las mismas filas ya filtradas y las
   * mismas columnas, en el mismo orden, sin las que solo son botones.
   */
  function descargar() {
    descargarTabla("solicitudes-procad", CAMPOS, vista, filtradas);
  }

  function limpiar() {
    setCentro("todos");
    setEstado("todos");
    setTexto("");
  }

  function confirmarResolucion(id: number, nombre: string, nuevoEstado: EstadoSolicitudProcad) {
    if (nuevoEstado === "observada") {
      abrirDialogo({
        titulo: "Observar solicitud",
        descripcion: `Explique a ${nombre} qué debe corregir para que pueda volver a enviarla.`,
        confirmar: "Observar",
        tono: "primario",
        campos: [
          {
            id: "motivo",
            label: "Motivo",
            multilinea: true,
            marcador: "Ej. El contacto de emergencia no es válido.",
          },
        ],
        onConfirmar: (valores) => resolverSolicitud(id, "observada", valores.motivo),
      });
      return;
    }

    const aprueba = nuevoEstado === "aprobada";
    abrirDialogo({
      titulo: aprueba
        ? `¿Aprobar la solicitud de ${nombre}?`
        : `¿Marcar que ${nombre} no cumple el requisito?`,
      descripcion: aprueba
        ? "Queda como integrante de la agrupación desde este período."
        : "La solicitud se cierra sin aprobarse. El estudiante puede volver a postularse el próximo período.",
      confirmar: "Sí, confirmar",
      tono: aprueba ? "aprobar" : "rechazar",
      onConfirmar: () => resolverSolicitud(id, nuevoEstado),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Todas llegan con el índice mínimo del {INDICE_MINIMO}% ya verificado desde el portal, así
        que la decisión aquí es sobre el criterio del encargado, no sobre el expediente.
      </p>

      <BarraTabla
        conteo={
          filtradas.length === solicitudes.length
            ? `${solicitudes.length} ${solicitudes.length === 1 ? "solicitud" : "solicitudes"}`
            : `${filtradas.length} de ${solicitudes.length}`
        }
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={descargar}
      >
        <select
          value={centro}
          onChange={(e) => setCentro(e.target.value)}
          aria-label="Campus"
          className={`${CLASE_FILTRO} w-[190px]`}
        >
          <option value="todos">Todos los campus</option>
          {CENTROS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoSolicitudProcad | "todos")}
          aria-label="Estado de la solicitud"
          className={`${CLASE_FILTRO} w-[150px]`}
        >
          <option value="todos">Todo estado</option>
          {ORDEN_ESTADOS.map((k) => (
            <option key={k} value={k}>
              {ETIQUETA_ESTADO[k]}
            </option>
          ))}
        </select>

        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Nombre o cuenta"
          etiqueta="Buscar por nombre o cuenta"
        />

        {hayFiltros && <BotonLimpiar onClick={limpiar} />}
      </BarraTabla>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos
          vista={vista}
          anchoMinimo="1080px"
          columnas={COLUMNAS}
          filas={filasDe(CAMPOS, filtradas, {
            verFicha: setFicha,
            resolver: confirmarResolucion,
          })}
        />
      </div>

      <FichaEstudiante
        solicitud={ficha}
        onClose={() => setFicha(null)}
        onResolver={(id, nombre, nuevoEstado) => {
          setFicha(null);
          confirmarResolucion(id, nombre, nuevoEstado);
        }}
      />
    </div>
  );
}
