import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiAcademicCap,
  HiOutlineListBullet,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useUsuarioActual } from "../../context/UserContext";

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange disabled:bg-slate-50 disabled:text-slate-400";
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

interface Acompanante {
  id: string;
  nombre: string;
  rol: string;
}

interface LineaCosto {
  id: string;
  concepto: string;
  detalle: string;
  monto: string;
}

interface DocumentoRespaldo {
  id: string;
  tipo: string;
  nombre: string;
  enlace: string;
}

let contadorId = 0;
function generarId() {
  contadorId += 1;
  return `tmp-${contadorId}`;
}

function alternarEnLista(lista: string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

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
  children: ReactNode;
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

export default function NuevaSolicitud() {
  const navigate = useNavigate();
  const usuario = useUsuarioActual();
  const [pasoActivo, setPasoActivo] = useState(0);

  // Datos generales + fechas y horarios
  const [objetivo, setObjetivo] = useState("");

  // Alcance académico
  const [carreras, setCarreras] = useState<string[]>([]);
  const [facultades, setFacultades] = useState<string[]>([]);
  const [finalidades, setFinalidades] = useState<string[]>([]);

  // Personas
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>([]);

  // Transporte
  const [solicitaTransporte, setSolicitaTransporte] = useState(false);
  const [medios, setMedios] = useState<string[]>([]);

  // Financiamiento
  const [origenes, setOrigenes] = useState<string[]>([]);
  const [costos, setCostos] = useState<LineaCosto[]>([]);

  // Documentos
  const [documentos, setDocumentos] = useState<DocumentoRespaldo[]>([]);

  const porcentaje = Math.round(((pasoActivo + 1) / pasos.length) * 100);
  const esUltimoPaso = pasoActivo === pasos.length - 1;

  const inicioFormularioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inicioFormularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pasoActivo]);

  function irAPaso(indice: number) {
    setPasoActivo(indice);
  }

  function agregarAcompanante() {
    if (acompanantes.length >= 2) return;
    setAcompanantes((prev) => [...prev, { id: generarId(), nombre: "", rol: "" }]);
  }

  function actualizarAcompanante(id: string, campo: "nombre" | "rol", valor: string) {
    setAcompanantes((prev) => prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));
  }

  function quitarAcompanante(id: string) {
    setAcompanantes((prev) => prev.filter((a) => a.id !== id));
  }

  function agregarCosto() {
    setCostos((prev) => [...prev, { id: generarId(), concepto: "", detalle: "", monto: "" }]);
  }

  function actualizarCosto(id: string, campo: keyof Omit<LineaCosto, "id">, valor: string) {
    setCostos((prev) => prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)));
  }

  function quitarCosto(id: string) {
    setCostos((prev) => prev.filter((c) => c.id !== id));
  }

  function agregarDocumento() {
    setDocumentos((prev) => [...prev, { id: generarId(), tipo: "", nombre: "", enlace: "" }]);
  }

  function actualizarDocumento(id: string, campo: keyof Omit<DocumentoRespaldo, "id">, valor: string) {
    setDocumentos((prev) => prev.map((d) => (d.id === id ? { ...d, [campo]: valor } : d)));
  }

  function quitarDocumento(id: string) {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  }

  const totalCostos = costos.reduce((acc, c) => acc + (parseFloat(c.monto) || 0), 0);

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    navigate("/giras/solicitudes");
  }

  function manejarGuardarBorrador() {
    navigate("/giras/solicitudes");
  }

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/giras/solicitudes")}
          className="flex items-center gap-1.5 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
        >
          <HiChevronLeft className="h-4 w-4" />
          Regresar
        </button>

        <div className="mt-4">
          <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Nueva Solicitud</h1>
        </div>
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
                <div
                  key={paso.id}
                  className={`flex items-start ${esUltimo ? "" : "flex-1"}`}
                >
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
                      className={`mt-5 h-px flex-1 ${
                        completado ? "bg-unah-orange" : "bg-slate-200"
                      }`}
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

      <div ref={inicioFormularioRef} />

      {/* 1. Datos generales */}
      {pasoActivo === 0 && (
      <SeccionFormulario numero={1} titulo="Datos generales" id="datos-generales">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={claseLabel}>Campus que organiza</label>
            <select className={claseInput} defaultValue="">
              <option value="" disabled>
                Selecciona un campus
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
            <select className={claseInput} defaultValue="">
              <option value="" disabled>
                Selecciona el alcance
              </option>
              <option>Nacional</option>
              <option>Internacional</option>
            </select>
          </div>

          <div>
            <label className={claseLabel}>Destino</label>
            <input type="text" placeholder="Ej. Copán Ruinas, Copán" className={claseInput} />
          </div>

          <div>
            <label className={claseLabel}>Alojamiento</label>
            <input type="text" placeholder="Ej. Hotel Marina Copán" className={claseInput} />
          </div>

          <div className="sm:col-span-2">
            <label className={claseLabel}>Objetivo académico</label>
            <textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value.slice(0, 1000))}
              maxLength={1000}
              rows={4}
              placeholder="Describe el objetivo académico de la gira..."
              className={`${claseInput} resize-none`}
            />
            <p className="mt-1 text-right text-xs text-slate-400">{objetivo.length}/1000</p>
          </div>
        </div>

        <p className="mb-4 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Fechas y horarios
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={claseLabel}>Fecha de salida</label>
            <input type="date" className={claseInput} />
          </div>
          <div>
            <label className={claseLabel}>Hora de salida</label>
            <input type="time" className={claseInput} />
          </div>
          <div>
            <label className={claseLabel}>Fecha de retorno</label>
            <input type="date" className={claseInput} />
          </div>
          <div>
            <label className={claseLabel}>Hora de retorno</label>
            <input type="time" className={claseInput} />
          </div>
          <div>
            <label className={claseLabel}>Fecha inicio de inscripción</label>
            <input type="date" className={claseInput} />
          </div>
          <div>
            <label className={claseLabel}>Fecha fin de inscripción</label>
            <input type="date" className={claseInput} />
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
                <label key={carrera} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={carreras.includes(carrera)}
                    onChange={() => setCarreras((prev) => alternarEnLista(prev, carrera))}
                    className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
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
                <label key={facultad} className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={facultades.includes(facultad)}
                    onChange={() => setFacultades((prev) => alternarEnLista(prev, facultad))}
                    className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
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
              <label key={finalidad} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={finalidades.includes(finalidad)}
                  onChange={() => setFinalidades((prev) => alternarEnLista(prev, finalidad))}
                  className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
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
            <select className={claseInput} defaultValue="">
              <option value="" disabled>
                Selecciona un jefe de aprobación
              </option>
              <option>Decanatura de la Facultad</option>
              <option>Vicerrectoría Académica</option>
              <option>Dirección de Relaciones Internacionales</option>
            </select>
          </div>

          <div>
            <label className={claseLabel}>Jefe de misión</label>
            <input type="text" value={usuario.nombreCompleto} disabled className={claseInput} />
          </div>

          <div>
            <label className={claseLabel}>Estudiantes aproximados</label>
            <input type="number" min={0} placeholder="0" className={claseInput} />
          </div>

          <div>
            <label className={claseLabel}>Docentes aproximados</label>
            <input type="number" min={0} placeholder="0" className={claseInput} />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className={claseLabel}>Docentes acompañantes</p>
            <button
              type="button"
              onClick={agregarAcompanante}
              disabled={acompanantes.length >= 2}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Agregar acompañante
            </button>
          </div>

          {acompanantes.length === 0 && (
            <p className="mt-2 text-sm text-slate-400">Aún no se han agregado acompañantes.</p>
          )}

          <div className="mt-3 flex flex-col gap-3">
            {acompanantes.map((acompanante, indice) => (
              <div
                key={acompanante.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
              >
                <input
                  type="text"
                  placeholder={`Nombre del acompañante ${indice + 1}`}
                  value={acompanante.nombre}
                  onChange={(e) => actualizarAcompanante(acompanante.id, "nombre", e.target.value)}
                  className={claseInput}
                />
                <input
                  type="text"
                  placeholder="Rol / cargo"
                  value={acompanante.rol}
                  onChange={(e) => actualizarAcompanante(acompanante.id, "rol", e.target.value)}
                  className={claseInput}
                />
                <button
                  type="button"
                  title="Quitar acompañante"
                  onClick={() => quitarAcompanante(acompanante.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 sm:self-auto"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </SeccionFormulario>
      )}

      {/* 4. Transporte */}
      {pasoActivo === 3 && (
      <SeccionFormulario numero={4} titulo="Transporte" id="transporte">
        <label className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={solicitaTransporte}
            onChange={(e) => setSolicitaTransporte(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
          />
          Solicito transporte de la universidad
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {mediosTransporte.map((medio) => (
            <label
              key={medio}
              className={`flex items-center gap-2 text-sm ${
                solicitaTransporte ? "text-slate-600" : "text-slate-300"
              }`}
            >
              <input
                type="checkbox"
                disabled={!solicitaTransporte}
                checked={medios.includes(medio)}
                onChange={() => setMedios((prev) => alternarEnLista(prev, medio))}
                className="h-4 w-4 rounded border-slate-300 accent-unah-orange disabled:opacity-40"
              />
              {medio}
            </label>
          ))}
        </div>

        <div className="mt-6">
          <label className={claseLabel}>Observaciones del traslado</label>
          <textarea
            rows={3}
            placeholder="Detalles adicionales sobre el transporte..."
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
              <label key={origen} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={origenes.includes(origen)}
                  onChange={() => setOrigenes((prev) => alternarEnLista(prev, origen))}
                  className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
                />
                {origen}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className={claseLabel}>Desglose de costos</p>
            <button
              type="button"
              onClick={agregarCosto}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-slate-50"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Agregar línea de costo
            </button>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3">Detalle</th>
                  <th className="px-4 py-3">Monto (L)</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costos.map((costo) => (
                  <tr key={costo.id}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Ej. Transporte"
                        value={costo.concepto}
                        onChange={(e) => actualizarCosto(costo.id, "concepto", e.target.value)}
                        className={claseInput}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Ej. Bus ida y vuelta"
                        value={costo.detalle}
                        onChange={(e) => actualizarCosto(costo.id, "detalle", e.target.value)}
                        className={claseInput}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={costo.monto}
                        onChange={(e) => actualizarCosto(costo.id, "monto", e.target.value)}
                        className={claseInput}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        title="Quitar línea"
                        onClick={() => quitarCosto(costo.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {costos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                      Aún no se han agregado líneas de costo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-right text-sm font-bold text-slate-800">
            Total: L{" "}
            {totalCostos.toLocaleString("es-HN", {
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
        <div className="flex items-center justify-between">
          <p className={claseLabel}>Documentos de respaldo</p>
          <button
            type="button"
            onClick={agregarDocumento}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-slate-50"
          >
            <HiOutlinePlus className="h-3.5 w-3.5" />
            Agregar documento
          </button>
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Enlace / URL</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentos.map((documento) => (
                <tr key={documento.id}>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Ej. Carta aval"
                      value={documento.tipo}
                      onChange={(e) => actualizarDocumento(documento.id, "tipo", e.target.value)}
                      className={claseInput}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Ej. carta_aval_gira.pdf"
                      value={documento.nombre}
                      onChange={(e) => actualizarDocumento(documento.id, "nombre", e.target.value)}
                      className={claseInput}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={documento.enlace}
                      onChange={(e) => actualizarDocumento(documento.id, "enlace", e.target.value)}
                      className={claseInput}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      title="Quitar documento"
                      onClick={() => quitarDocumento(documento.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {documentos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                    Aún no se han agregado documentos de respaldo.
                  </td>
                </tr>
              )}
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
          <p className="text-xs text-slate-400 sm:max-w-xs">
            Al enviarla queda en manos del jefe de aprobación y ya no podrá editarla.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={manejarGuardarBorrador}
            className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-unah-navy transition-colors hover:bg-slate-200"
          >
            Guardar borrador
          </button>
          {esUltimoPaso ? (
            <button
              type="submit"
              className="rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
            >
              Enviar solicitud
            </button>
          ) : (
            <button
              type="button"
              onClick={() => irAPaso(pasoActivo + 1)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
            >
              Siguiente
              <HiChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
