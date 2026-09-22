import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineArrowDownTray, HiOutlineMagnifyingGlass, HiOutlineEye } from "react-icons/hi2";
import DetalleInscripcionModal from "../../components/DetalleInscripcionModal";
import EstadoGiraBadge from "../../components/giras/EstadoGiraBadge";
import { listarInscripcionesDeGira, obtenerGira } from "../../api/giras";
import { useConsulta } from "../../api/useConsulta";
import { etiquetaPeriodo, fechaCorta } from "../../utils/girasFormato";
import type { InscripcionGiraResumen } from "../../types/giras";

function descargarExcel(idGira: number, filas: InscripcionGiraResumen[]) {
  const encabezados = ["ID Inscripción", "Nombre estudiante", "Cuenta", "Estado", "Fecha", "Período"];
  const lineas = filas.map((fila) =>
    [
      `INS-${fila.idInscripcion}`,
      fila.nombreViajero,
      fila.numeroCuenta ?? "",
      fila.nombreEstado,
      fechaCorta(fila.fechaEnvio ?? fila.fechaRegistro),
      etiquetaPeriodo(fila.anioPeriodo, fila.numeroPac),
    ]
      .map((valor) => `"${valor.replace(/"/g, '""')}"`)
      .join(","),
  );
  const contenido = [encabezados.join(","), ...lineas].join("\r\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `inscripciones-GIR-${idGira}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <div className="mt-1 text-sm font-medium text-slate-700">{children}</div>
    </div>
  );
}

export default function InscripcionesGira() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<InscripcionGiraResumen | null>(null);

  const idGira = Number(id);
  const gira = useConsulta(() => obtenerGira(idGira), [idGira]);
  const roster = useConsulta(() => listarInscripcionesDeGira(idGira), [idGira]);
  const inscripciones = useMemo(() => roster.datos ?? [], [roster.datos]);

  const filas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return inscripciones.filter(
      (i) =>
        !texto ||
        `ins-${i.idInscripcion}`.includes(texto) ||
        i.nombreViajero.toLowerCase().includes(texto) ||
        (i.numeroCuenta ?? "").includes(texto),
    );
  }, [inscripciones, busqueda]);

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/giras/mis-giras")}
          className="flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Regresar
        </button>

        <button
          type="button"
          onClick={() => descargarExcel(idGira, filas)}
          disabled={filas.length === 0}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" />
          Descargar Excel
        </button>
      </div>

      {gira.cargando && !gira.datos ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Cargando gira…</div>
      ) : !gira.datos ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          {gira.error ?? "No se encontró la gira solicitada."}
        </div>
      ) : (
        <>
          {/* Información general de la gira */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Información general de la gira</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Dato etiqueta="ID Gira">
                <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                  GIR-{gira.datos.idGira}
                </span>
              </Dato>
              <Dato etiqueta="Destino">{gira.datos.destinoGira ?? "—"}</Dato>
              <Dato etiqueta="Estado">
                <EstadoGiraBadge codigo={gira.datos.codigoEstado} />
              </Dato>
              <Dato etiqueta="Centro">{gira.datos.nombreCampus}</Dato>
              <Dato etiqueta="Período">{etiquetaPeriodo(gira.datos.anioPeriodo, gira.datos.numeroPac)}</Dato>
              <Dato etiqueta="Fecha de salida">{fechaCorta(gira.datos.fechaSalidaConfirmada)}</Dato>
              <Dato etiqueta="Inscritos">
                {gira.datos.totalInscritos} de {gira.datos.totalInscripciones}
              </Dato>
            </div>
          </div>

          {/* Tabla de inscripciones */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Inscripciones registradas</h2>

            {/* Búsqueda */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por ID, nombre o cuenta del estudiante..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="table-scrollbar mt-4 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-4 py-3">ID Inscripción</th>
                    <th className="px-4 py-3">Nombre estudiante</th>
                    <th className="px-4 py-3">Cuenta</th>
                    <th className="px-4 py-3">Estado de inscripción</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-center">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filas.map((fila) => (
                    <tr key={fila.idInscripcion} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                          INS-{fila.idInscripcion}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{fila.nombreViajero}</td>
                      <td className="px-4 py-4 text-slate-600">{fila.numeroCuenta ?? "—"}</td>
                      <td className="px-4 py-4">
                        <EstadoGiraBadge codigo={fila.codigoEstado} />
                      </td>
                      <td className="px-4 py-4 text-slate-500">{fechaCorta(fila.fechaEnvio ?? fila.fechaRegistro)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            title="Ver"
                            onClick={() => setSeleccionada(fila)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <HiOutlineEye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {roster.cargando && inscripciones.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                        Cargando inscripciones…
                      </td>
                    </tr>
                  )}

                  {roster.error && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm font-medium text-rose-600">
                        {roster.error}
                      </td>
                    </tr>
                  )}

                  {!roster.cargando && !roster.error && filas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                        {inscripciones.length === 0
                          ? "Esta gira todavía no tiene inscripciones enviadas."
                          : "No se encontraron inscripciones con la búsqueda."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <DetalleInscripcionModal inscripcion={seleccionada} onClose={() => setSeleccionada(null)} />
    </div>
  );
}
