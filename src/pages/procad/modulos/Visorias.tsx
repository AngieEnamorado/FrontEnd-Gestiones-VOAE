import { useMemo, useState } from "react";
import {
  HiOutlineArrowDownTray,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { CLASE_FILTRO } from "../../../components/procad/BarraTabla";
import CalendarioVisorias from "../../../components/procad/CalendarioVisorias";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import DetalleVisoria from "../../../components/procad/DetalleVisoria";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";
import { CENTROS } from "../../../data/mockProcadEstadisticas";
import { enCorto, enLargo, moverMes, nombreDelMes, partes } from "../../../utils/fechas";
import { descargarExcel } from "../../../utils/exportarExcel";
import type { VisoriaProcad } from "../../../types";

type Apartado = "todas" | "BORRADOR" | "PROGRAMADA";

/**
 * El calendario de visorías del período.
 *
 * Era una tabla, y una tabla contesta «¿cuándo es la del voleibol?» pero no
 * «¿qué semana tengo libre?» ni «¿no estaré poniendo dos el mismo día en el
 * mismo campus?», que son las dos preguntas con las que se programa. El mes
 * dibujado las contesta de un vistazo, y marca solo el cruce que estorba: dos
 * pruebas a la vez en el mismo centro.
 *
 * A la derecha, lo que falta por programar. Un borrador no existe para nadie
 * más que el administrador, así que si se queda ahí, la prueba no ocurre.
 */
export default function Visorias({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { visorias, programarVisoria } = useProcad();
  const [centro, setCentro] = useState("todos");
  const [apartado, setApartado] = useState<Apartado>("todas");
  const [abierta, setAbierta] = useState<VisoriaProcad | null>(null);

  // El mes que se abre no es el de hoy sino el de la primera visoría del
  // período: el calendario académico y el calendario del año no coinciden, y
  // abrir en un mes vacío haría pensar que no hay ninguna.
  const primera = useMemo(
    () => [...visorias].sort((a, b) => a.fecha.localeCompare(b.fecha))[0],
    [visorias],
  );
  const [vista, setVista] = useState(() => {
    const { anio, mes } = partes(primera?.fecha ?? "2026-01-01");
    return { anio, mes };
  });

  const filtradas = useMemo(
    () =>
      visorias.filter((v) => {
        if (centro !== "todos" && v.centro !== centro) return false;
        if (apartado !== "todas" && v.estado !== apartado) return false;
        return true;
      }),
    [visorias, centro, apartado],
  );

  const borradores = useMemo(
    () =>
      visorias
        .filter((v) => v.estado === "BORRADOR")
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [visorias],
  );

  const delMes = useMemo(
    () =>
      filtradas
        .filter((v) => {
          const { anio, mes } = partes(v.fecha);
          return anio === vista.anio && mes === vista.mes;
        })
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [filtradas, vista],
  );

  /** La otra visoría del mismo día y campus que la abierta, si la hay. */
  const choque = useMemo(() => {
    if (!abierta) return null;
    return (
      visorias.find(
        (v) => v.id !== abierta.id && v.fecha === abierta.fecha && v.centro === abierta.centro,
      ) ?? null
    );
  }, [abierta, visorias]);

  function confirmar(v: VisoriaProcad) {
    abrirDialogo({
      titulo: `¿Programar la visoría de ${v.grupo}?`,
      descripcion: `${enLargo(v.fecha)}, ${v.hora}. ${v.citados} citados en ${v.centro}. Al programarla quedan notificados de la fecha.`,
      confirmar: "Sí, programar",
      tono: "primario",
      onConfirmar: () => {
        programarVisoria(v.id);
        setAbierta(null);
      },
    });
  }

  /** Salta al mes de una visoría y la abre; el borrador puede estar en otro mes. */
  function irA(v: VisoriaProcad) {
    const { anio, mes } = partes(v.fecha);
    setVista({ anio, mes });
    setAbierta(v);
  }

  function descargar() {
    descargarExcel(
      "visorias-procad",
      ["Agrupación", "Centro", "Fecha", "Hora", "Citados", "Estado"],
      delMes.map((v) => [
        v.grupo,
        v.centro,
        enCorto(v.fecha),
        v.hora,
        String(v.citados),
        v.estado === "BORRADOR" ? "Borrador" : "Programada",
      ]),
      "Visorías",
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Una visoría en borrador todavía no existe para nadie más: al programarla, los aspirantes
        citados quedan notificados de la fecha. El triángulo marca los días con dos visorías en el
        mismo campus.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <ChipsFiltro
          etiqueta="Estado de la visoría"
          activa={apartado}
          onCambiar={setApartado}
          opciones={[
            { id: "todas", label: "Todas", conteo: visorias.length },
            {
              id: "BORRADOR",
              label: "Sin programar",
              conteo: visorias.filter((v) => v.estado === "BORRADOR").length,
            },
            {
              id: "PROGRAMADA",
              label: "Programadas",
              conteo: visorias.filter((v) => v.estado === "PROGRAMADA").length,
            },
          ]}
        />

        <select
          value={centro}
          onChange={(e) => setCentro(e.target.value)}
          aria-label="Centro"
          className={`${CLASE_FILTRO} w-[200px]`}
        >
          <option value="todos">Todos los centros</option>
          {CENTROS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={descargar}
          disabled={delMes.length === 0}
          title="Descargar las visorías de este mes en un libro de Excel"
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
          Excel
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold capitalize text-slate-800">
              {nombreDelMes(vista.anio, vista.mes)}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {delMes.length === 0
                ? "sin visorías"
                : `${delMes.length} ${delMes.length === 1 ? "visoría" : "visorías"}`}
            </p>

            <div className="ml-auto flex gap-1">
              <BotonMes
                etiqueta="Mes anterior"
                onClick={() => setVista(moverMes(vista.anio, vista.mes, -1))}
              >
                <HiOutlineChevronLeft className="h-4 w-4" />
              </BotonMes>
              <BotonMes
                etiqueta="Mes siguiente"
                onClick={() => setVista(moverMes(vista.anio, vista.mes, 1))}
              >
                <HiOutlineChevronRight className="h-4 w-4" />
              </BotonMes>
            </div>
          </div>

          <CalendarioVisorias
            anio={vista.anio}
            mes={vista.mes}
            visorias={filtradas}
            onAbrir={setAbierta}
          />
        </div>

        <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <h3 className="text-sm font-bold text-slate-800">Sin programar</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {borradores.length === 0
              ? "Todas las visorías del período están programadas."
              : "Mientras sigan aquí, los citados no saben que existen."}
          </p>

          <ul className="mt-3 flex flex-col gap-2">
            {borradores.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => irA(v)}
                  className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-left transition-colors duration-150 hover:border-amber-400 hover:bg-amber-100/70"
                >
                  <p className="truncate text-[13px] font-semibold text-amber-900">{v.grupo}</p>
                  <p className="mt-0.5 truncate text-[11px] text-amber-800">
                    {enCorto(v.fecha)} · {v.hora}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-amber-700/80">{v.centro}</p>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <DetalleVisoria
        visoria={abierta ? (visorias.find((v) => v.id === abierta.id) ?? null) : null}
        choque={choque}
        onCerrar={() => setAbierta(null)}
        onProgramar={confirmar}
      />
    </div>
  );
}

function BotonMes({
  etiqueta,
  onClick,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={etiqueta}
      aria-label={etiqueta}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-700"
    >
      {children}
    </button>
  );
}
