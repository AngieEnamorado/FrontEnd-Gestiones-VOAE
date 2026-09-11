import { useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import BotonAccion from "../../../components/procad/BotonAccion";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { ETIQUETA_ESTADO, ORDEN_ESTADOS } from "../../../components/procad/paleta";
import { useProcad } from "../../../context/ProcadContext";
import { CENTROS, INDICE_MINIMO } from "../../../data/mockProcadEstadisticas";
import type { EstadoSolicitudProcad } from "../../../types";

const TONO_ESTADO = {
  aprobada: "activo",
  pendiente: "pendiente",
  observada: "info",
  noCumple: "negativo",
} as const;

const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";
const claseCampo =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition-colors focus:border-unah-orange";

export default function Solicitudes({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { solicitudes, resolverSolicitud } = useProcad();
  const [centro, setCentro] = useState("todos");
  const [estado, setEstado] = useState<EstadoSolicitudProcad | "todos">("todos");
  const [texto, setTexto] = useState("");

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
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className={claseLabel} htmlFor="sol-centro">
              Campus
            </label>
            <select
              id="sol-centro"
              value={centro}
              onChange={(e) => setCentro(e.target.value)}
              className={claseCampo}
            >
              <option value="todos">Todos</option>
              {CENTROS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[170px] flex-1">
            <label className={claseLabel} htmlFor="sol-estado">
              Estado
            </label>
            <select
              id="sol-estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoSolicitudProcad | "todos")}
              className={claseCampo}
            >
              <option value="todos">Todos</option>
              {ORDEN_ESTADOS.map((k) => (
                <option key={k} value={k}>
                  {ETIQUETA_ESTADO[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px] flex-1">
            <label className={claseLabel} htmlFor="sol-texto">
              Nombre o cuenta
            </label>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="sol-texto"
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar…"
                autoComplete="off"
                className={`${claseCampo} pl-9`}
              />
            </div>
          </div>

          <p className="py-2.5 text-xs font-semibold text-slate-400">
            {filtradas.length} de {solicitudes.length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <p className="mb-4 text-xs leading-relaxed text-slate-500">
          Todas llegan con el índice mínimo del {INDICE_MINIMO}% ya verificado desde el portal, así
          que la decisión aquí es sobre el criterio del encargado, no sobre el expediente.
        </p>
        <TablaDatos
          anchoMinimo="900px"
          columnas={[
            { label: "Estudiante" },
            { label: "Cuenta" },
            { label: "Agrupación" },
            { label: "Índice", numerica: true },
            { label: "Estado" },
            { label: "Acciones" },
          ]}
          filas={filtradas.map((s) => [
            <span key={`n-${s.id}`} className="font-medium text-slate-700">
              {s.nombre}
            </span>,
            <span key={`c-${s.id}`} className="font-mono text-xs">
              {s.cuenta}
            </span>,
            s.grupo,
            `${s.indice}%`,
            <PildoraEstado key={`e-${s.id}`} tono={TONO_ESTADO[s.estado]}>
              {ETIQUETA_ESTADO[s.estado]}
            </PildoraEstado>,
            s.estado === "pendiente" ? (
              <span key={`a-${s.id}`} className="flex flex-wrap gap-1.5">
                <BotonAccion
                  tono="aprobar"
                  onClick={() => confirmarResolucion(s.id, s.nombre, "aprobada")}
                >
                  Aprobar
                </BotonAccion>
                <BotonAccion
                  tono="observar"
                  onClick={() => confirmarResolucion(s.id, s.nombre, "observada")}
                >
                  Observar
                </BotonAccion>
                <BotonAccion
                  tono="rechazar"
                  onClick={() => confirmarResolucion(s.id, s.nombre, "noCumple")}
                >
                  No cumple
                </BotonAccion>
              </span>
            ) : (
              <span key={`a-${s.id}`} className="text-xs italic text-slate-400">
                Ya resuelta
              </span>
            ),
          ])}
        />
      </div>
    </div>
  );
}
