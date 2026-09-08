import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiAcademicCap,
  HiOutlineListBullet,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import EstadoBadge from "../../components/EstadoBadge";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";
import { misGiras } from "../../data/mockMisGiras";

const todasLasGiras = [...solicitudesGiras, ...misGiras];

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400";
const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";

interface Paso {
  id: string;
  label: string;
  icon: IconType;
}

const pasos: Paso[] = [
  { id: "datos-generales", label: "Datos generales", icon: HiAcademicCap },
  { id: "alcance-academico", label: "Alcance académico", icon: HiOutlineListBullet },
  { id: "personas", label: "Personas", icon: HiOutlineUserGroup },
  { id: "transporte", label: "Transporte", icon: HiOutlineTruck },
  { id: "financiamiento", label: "Financiamiento", icon: HiOutlineBanknotes },
  { id: "documentos", label: "Documentos", icon: HiOutlineDocumentText },
];

const carrerasDisponibles = [
  "Ingeniería Civil",
  "Ingeniería Industrial",
  "Medicina",
  "Derecho",
  "Arquitectura",
  "Enfermería",
  "Administración de Empresas",
  "Biología",
];

const facultadesDisponibles = [
  "Ciencias Espaciales",
  "Ciencias Económicas, Administrativas y Contables",
  "Ciencias Sociales",
  "Ciencias Médicas",
  "Ingeniería",
  "Humanidades y Artes",
];

const finalidadesDisponibles = ["Académica", "Social", "Deportiva", "Cultural", "Recreativa"];

const mediosTransporte = [
  "Bus universitario",
  "Bus alquilado",
  "Microbús",
  "Vehículo propio",
  "Aéreo",
  "Marítimo",
];

const origenesFondos = ["Institucional", "Aporte de viajeros", "Mixto", "Externo"];

function AnilloProgreso({ porcentaje }: { porcentaje: number }) {
  const radio = 30;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentaje / 100) * circunferencia;

  return (
    <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={radio} stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <circle
          cx="38"
          cy="38"
          r={radio}
          stroke="#f5820f"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-700">{porcentaje}%</span>
    </div>
  );
}

function SeccionFormulario({
  numero,
  titulo,
  id,
  children,
}: {
  numero: number;
  titulo: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800">
        <span className="mr-2 text-unah-orange">{numero}.</span>
        {titulo}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function DetalleSolicitud() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pasoActivo, setPasoActivo] = useState(0);

  const solicitud = useMemo(() => todasLasGiras.find((s) => s.id === id), [id]);

  const porcentaje = Math.round(((pasoActivo + 1) / pasos.length) * 100);
  const esUltimoPaso = pasoActivo === pasos.length - 1;

  function irAPaso(indice: number) {
    setPasoActivo(indice);
  }

  function regresarASolicitudes() {
    navigate("/giras/solicitudes");
  }

  if (!solicitud) {
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={regresarASolicitudes}
          className="flex items-center gap-1.5 self-start rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
        >
          <HiChevronLeft className="h-4 w-4" />
          Regresar
        </button>
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No se encontró la solicitud solicitada.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={regresarASolicitudes}
          className="flex items-center gap-1.5 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
        >
          <HiChevronLeft className="h-4 w-4" />
          Regresar
        </button>

        <EstadoBadge estado={solicitud.estado} />
      </div>

      <div>
        <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Detalle de la solicitud</h1>
      </div>

      {/* Stepper */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-start overflow-x-auto">
            {pasos.map((paso, indice) => {
              const Icon = paso.icon;
              const activo = indice === pasoActivo;
              const completado = indice < pasoActivo;
              const esUltimo = indice === pasos.length - 1;
              return (
                <div key={paso.id} className={`flex items-start ${esUltimo ? "" : "flex-1"}`}>
                  <button
                    type="button"
                    onClick={() => irAPaso(indice)}
                    className="flex w-[92px] shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        activo || completado
                          ? "bg-unah-orange text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={`text-[11px] font-medium leading-tight ${
                        activo ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {paso.label}
                    </span>
                  </button>

                  {!esUltimo && (
                    <div
                      className={`mt-5 h-px flex-1 ${completado ? "bg-unah-orange" : "bg-slate-200"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center self-center">
            <AnilloProgreso porcentaje={porcentaje} />
            <p className="mt-2 text-xs font-medium text-slate-400">
              Paso {pasoActivo + 1} de {pasos.length}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Datos generales */}
      {pasoActivo === 0 && (
        <SeccionFormulario numero={1} titulo="Datos generales" id="datos-generales">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={claseLabel}>Campus que organiza</label>
              <select className={claseInput} disabled defaultValue={solicitud.centro}>
                <option value="" disabled>
                  No especificado
                </option>
                <option>CIUDAD UNIVERSITARIA</option>
                <option>CURLA</option>
                <option>CURLP</option>
                <option>CURC</option>
                <option>CURSA</option>
              </select>
            </div>

            <div>
              <label className={claseLabel}>Alcance del viaje</label>
              <select className={claseInput} disabled defaultValue="">
                <option value="" disabled>
                  No especificado
                </option>
                <option>Nacional</option>
                <option>Internacional</option>
              </select>
            </div>

            <div>
              <label className={claseLabel}>Destino</label>
              <input type="text" disabled defaultValue={solicitud.destino} className={claseInput} />
            </div>

            <div>
              <label className={claseLabel}>Alojamiento</label>
              <input
                type="text"
                disabled
                placeholder="No especificado"
                defaultValue=""
                className={claseInput}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={claseLabel}>Objetivo académico</label>
              <textarea
                disabled
                rows={4}
                defaultValue={solicitud.descripcion}
                className={`${claseInput} resize-none`}
              />
            </div>
          </div>

          <p className="mb-4 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Fechas y horarios
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={claseLabel}>Fecha de salida</label>
              <input type="date" disabled defaultValue={solicitud.fecha} className={claseInput} />
            </div>
            <div>
              <label className={claseLabel}>Hora de salida</label>
              <input type="time" disabled defaultValue="" className={claseInput} />
            </div>
            <div>
              <label className={claseLabel}>Fecha de retorno</label>
              <input type="date" disabled defaultValue="" className={claseInput} />
            </div>
            <div>
              <label className={claseLabel}>Hora de retorno</label>
              <input type="time" disabled defaultValue="" className={claseInput} />
            </div>
            <div>
              <label className={claseLabel}>Fecha inicio de inscripción</label>
              <input type="date" disabled defaultValue="" className={claseInput} />
            </div>
            <div>
              <label className={claseLabel}>Fecha fin de inscripción</label>
              <input type="date" disabled defaultValue="" className={claseInput} />
            </div>
          </div>
        </SeccionFormulario>
      )}

      {/* 2. Alcance académico */}
      {pasoActivo === 1 && (
        <SeccionFormulario numero={2} titulo="Alcance académico" id="alcance-academico">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className={claseLabel}>Carreras participantes</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {carrerasDisponibles.map((carrera) => (
                  <label key={carrera} className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      disabled
                      defaultChecked={false}
                      className="h-4 w-4 rounded border-slate-300 accent-unah-orange disabled:opacity-50"
                    />
                    {carrera}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className={claseLabel}>Facultades participantes</p>
              <div className="grid grid-cols-1 gap-2">
                {facultadesDisponibles.map((facultad) => (
                  <label key={facultad} className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      disabled
                      defaultChecked={false}
                      className="h-4 w-4 rounded border-slate-300 accent-unah-orange disabled:opacity-50"
                    />
                    {facultad}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className={claseLabel}>Finalidad de la gira</p>
            <div className="flex flex-wrap gap-4">
              {finalidadesDisponibles.map((finalidad) => (
                <label key={finalidad} className="flex items-center gap-2 text-sm text-slate-400">
                  <input
                    type="checkbox"
                    disabled
                    defaultChecked={false}
                    className="h-4 w-4 rounded border-slate-300 accent-unah-orange disabled:opacity-50"
                  />
                  {finalidad}
                </label>
              ))}
            </div>
          </div>
        </SeccionFormulario>
      )}

      {/* 3. Personas */}
      {pasoActivo === 2 && (
        <SeccionFormulario numero={3} titulo="Personas" id="personas">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={claseLabel}>Jefe de aprobación</label>
              <select className={claseInput} disabled defaultValue="">
                <option value="" disabled>
                  No especificado
                </option>
                <option>Decanatura de la Facultad</option>
                <option>Vicerrectoría Académica</option>
                <option>Dirección de Relaciones Internacionales</option>
              </select>
            </div>

            <div>
              <label className={claseLabel}>Jefe de misión</label>
              <input type="text" disabled defaultValue={solicitud.docente} className={claseInput} />
            </div>

            <div>
              <label className={claseLabel}>Estudiantes aproximados</label>
              <input
                type="number"
                disabled
                placeholder="No especificado"
                defaultValue=""
                className={claseInput}
              />
            </div>

            <div>
              <label className={claseLabel}>Docentes aproximados</label>
              <input
                type="number"
                disabled
                placeholder="No especificado"
                defaultValue=""
                className={claseInput}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className={claseLabel}>Docentes acompañantes</p>
            <p className="mt-2 text-sm text-slate-400">Aún no se han agregado acompañantes.</p>
          </div>
        </SeccionFormulario>
      )}

      {/* 4. Transporte */}
      {pasoActivo === 3 && (
        <SeccionFormulario numero={4} titulo="Transporte" id="transporte">
          <label className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              disabled
              defaultChecked={false}
              className="h-4 w-4 rounded border-slate-300 accent-unah-orange disabled:opacity-50"
            />
            Solicito transporte de la universidad
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mediosTransporte.map((medio) => (
              <label key={medio} className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  disabled
                  defaultChecked={false}
                  className="h-4 w-4 rounded border-slate-300 accent-unah-orange disabled:opacity-40"
                />
                {medio}
              </label>
            ))}
          </div>

          <div className="mt-6">
            <label className={claseLabel}>Observaciones del traslado</label>
            <textarea
              disabled
              rows={3}
              placeholder="No especificado"
              defaultValue=""
              className={`${claseInput} resize-none`}
            />
          </div>
        </SeccionFormulario>
      )}

      {/* 5. Financiamiento */}
      {pasoActivo === 4 && (
        <SeccionFormulario numero={5} titulo="Financiamiento" id="financiamiento">
          <div>
            <p className={claseLabel}>Origen de fondos</p>
            <div className="flex flex-wrap gap-4">
              {origenesFondos.map((origen) => (
                <label key={origen} className="flex items-center gap-2 text-sm text-slate-400">
                  <input
                    type="checkbox"
                    disabled
                    defaultChecked={false}
                    className="h-4 w-4 rounded border-slate-300 accent-unah-orange disabled:opacity-50"
                  />
                  {origen}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className={claseLabel}>Desglose de costos</p>

            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-4 py-3">Concepto</th>
                    <th className="px-4 py-3">Detalle</th>
                    <th className="px-4 py-3">Monto (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                      Aún no se han agregado líneas de costo.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-right text-sm font-bold text-slate-800">
              Total: L{" "}
              {(0).toLocaleString("es-HN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </SeccionFormulario>
      )}

      {/* 6. Documentos */}
      {pasoActivo === 5 && (
        <SeccionFormulario numero={6} titulo="Documentos" id="documentos">
          <p className={claseLabel}>Documentos de respaldo</p>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Enlace / URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                    Aún no se han agregado documentos de respaldo.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SeccionFormulario>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {pasoActivo > 0 && (
            <button
              type="button"
              onClick={() => irAPaso(pasoActivo - 1)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <HiChevronLeft className="h-4 w-4" />
              Anterior
            </button>
          )}
          {!esUltimoPaso && (
            <button
              type="button"
              onClick={() => irAPaso(pasoActivo + 1)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Siguiente
              <HiChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={regresarASolicitudes}
          className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-unah-navy transition-colors hover:bg-slate-200"
        >
          Volver a Solicitudes
        </button>
      </div>
    </div>
  );
}
