import { useMemo, useState } from "react";
import { HiOutlineCalendarDays } from "react-icons/hi2";
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
import { CENTROS } from "../../../data/mockProcadEstadisticas";
import type { EstadoVisoria, VisoriaProcad } from "../../../types";

const ETIQUETA: Record<EstadoVisoria, string> = {
  BORRADOR: "Borrador",
  PROGRAMADA: "Programada",
};

interface AccionesCelda {
  programar: (v: VisoriaProcad) => void;
}

const CAMPOS: CampoTabla<VisoriaProcad, AccionesCelda>[] = [
  {
    label: "Agrupación",
    texto: (v) => v.grupo,
    celda: (v) => (
      <span className="whitespace-nowrap font-medium text-slate-700">{v.grupo}</span>
    ),
  },
  {
    label: "Centro",
    texto: (v) => v.centro,
    celda: (v) => <span className="whitespace-nowrap">{v.centro}</span>,
  },
  {
    label: "Fecha",
    texto: (v) => v.fecha,
    celda: (v) => <span className="whitespace-nowrap">{v.fecha}</span>,
  },
  {
    label: "Hora",
    texto: (v) => v.hora,
    celda: (v) => <span className="whitespace-nowrap">{v.hora}</span>,
  },
  {
    label: "Citados",
    numerica: true,
    texto: (v) => String(v.citados),
    celda: (v) => v.citados,
  },
  {
    label: "Estado",
    texto: (v) => ETIQUETA[v.estado],
    celda: (v) => (
      <PildoraEstado tono={v.estado === "PROGRAMADA" ? "activo" : "pendiente"}>
        {ETIQUETA[v.estado]}
      </PildoraEstado>
    ),
  },
  {
    label: "Programar",
    centrada: true,
    exportable: false,
    texto: () => "",
    celda: (v, acciones) =>
      v.estado === "BORRADOR" ? (
        <BotonDecision
          tono="primario"
          etiqueta={`Programar la visoría de ${v.grupo}`}
          onClick={() => acciones.programar(v)}
        >
          <HiOutlineCalendarDays className="h-4 w-4" />
        </BotonDecision>
      ) : (
        <SinAccion razon="Ya programada" />
      ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

/** El calendario de visorías del período: qué grupo prueba aspirantes y cuándo. */
export default function Visorias({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { visorias, programarVisoria } = useProcad();
  const [centro, setCentro] = useState("todos");
  const [texto, setTexto] = useState("");
  const vista = useVistaTabla("agrupaciones:visorias", COLUMNAS);

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return visorias.filter((v) => {
      if (centro !== "todos" && v.centro !== centro) return false;
      if (busqueda && !v.grupo.toLowerCase().includes(busqueda)) return false;
      return true;
    });
  }, [visorias, centro, texto]);

  const hayFiltros = centro !== "todos" || texto.trim() !== "";

  function confirmar(v: VisoriaProcad) {
    abrirDialogo({
      titulo: `¿Programar la visoría de ${v.grupo}?`,
      descripcion: `${v.fecha} · ${v.hora} · ${v.citados} citados. Al programarla, los aspirantes citados quedan notificados de la fecha.`,
      confirmar: "Sí, programar",
      tono: "primario",
      onConfirmar: () => programarVisoria(v.id),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Una visoría en borrador todavía no existe para nadie más: al programarla, los aspirantes
        citados quedan notificados de la fecha.
      </p>

      <BarraTabla
        conteo={
          filtradas.length === visorias.length
            ? `${visorias.length} ${visorias.length === 1 ? "visoría" : "visorías"}`
            : `${filtradas.length} de ${visorias.length}`
        }
        vista={vista}
        hayFilas={filtradas.length > 0}
        onDescargar={() => descargarTabla("visorias-procad", CAMPOS, vista, filtradas)}
      >
        <select
          value={centro}
          onChange={(e) => setCentro(e.target.value)}
          aria-label="Centro"
          className={`${CLASE_FILTRO} w-[190px]`}
        >
          <option value="todos">Todos los centros</option>
          {CENTROS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Agrupación"
          etiqueta="Buscar por agrupación"
        />

        {hayFiltros && (
          <BotonLimpiar
            onClick={() => {
              setCentro("todos");
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
          filas={filasDe(CAMPOS, filtradas, { programar: confirmar })}
        />
      </div>
    </div>
  );
}
