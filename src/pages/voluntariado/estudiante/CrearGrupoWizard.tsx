import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineCheck, HiOutlineXMark, HiOutlinePlus, HiOutlineExclamationTriangle } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { campus, redesTematicas } from "../../../data/mockCatalogosVoluntariado";
import { gruposVoluntariado, solicitudesGrupoVoluntariado } from "../../../data/mockGruposVoluntariado";
import type { CargoJuntaDirectiva } from "../../../types";

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange";
const claseLabel = "mb-1.5 block text-[11px] font-bold text-slate-500";

const cargosFijos: CargoJuntaDirectiva[] = ["Presidente", "Vicepresidente", "Secretario", "Tesorero", "Fiscal", "Vocal"];

const nombresPadron = [
  ["Diego Salgado", "Ingeniería Industrial"],
  ["Karla Espinoza", "Trabajo Social"],
  ["Marvin Portillo", "Derecho"],
  ["Suyapa Reyes", "Enfermería"],
  ["Néstor Aceituno", "Administración de Empresas"],
];

function buscarEnPadron(cuenta: string): { nombre: string; carrera: string } | null {
  const directorio = [
    ...gruposVoluntariado.flatMap((g) => g.miembros),
    ...solicitudesGrupoVoluntariado.flatMap((g) => g.miembros),
  ];
  const conocido = directorio.find((m) => m.numeroCuenta === cuenta);
  if (conocido) return { nombre: conocido.nombre, carrera: conocido.carrera };
  if (/^\d{11}$/.test(cuenta)) {
    const indice = Number(cuenta.slice(-1)) % nombresPadron.length;
    const [nombre, carrera] = nombresPadron[indice];
    return { nombre, carrera };
  }
  return null;
}

interface FilaJunta {
  cargo: CargoJuntaDirectiva;
  numeroCuenta: string;
}

interface Fundador {
  numeroCuenta: string;
  nombre: string;
  carrera: string;
}

interface ActividadProyectada {
  id: string;
  nombre: string;
  mes: string;
}

let contador = 0;
function generarId() {
  contador += 1;
  return `wiz-${contador}`;
}

export default function CrearGrupoWizard() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(0);

  const [nombre, setNombre] = useState("");
  const [campusId, setCampusId] = useState("");
  const [redesIds, setRedesIds] = useState<string[]>([]);
  const [fechaCreacion, setFechaCreacion] = useState("");
  const [reseña, setReseña] = useState("");
  const [proposito, setProposito] = useState("");
  const [mision, setMision] = useState("");
  const [vision, setVision] = useState("");

  const [junta, setJunta] = useState<FilaJunta[]>(cargosFijos.map((cargo) => ({ cargo, numeroCuenta: "" })));

  const [cuentaFundador, setCuentaFundador] = useState("");
  const [errorFundador, setErrorFundador] = useState("");
  const [fundadores, setFundadores] = useState<Fundador[]>([]);

  const [actividades, setActividades] = useState<ActividadProyectada[]>([]);

  const [estatutosOk, setEstatutosOk] = useState(false);
  const [logoOk, setLogoOk] = useState(false);
  const [actaOk, setActaOk] = useState(false);

  const documentosCompletos = estatutosOk && logoOk;
  const esUltimoPaso = paso === 4;

  function alternarRed(id: string) {
    setRedesIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  function actualizarJunta(cargo: CargoJuntaDirectiva, numeroCuenta: string) {
    setJunta((prev) => prev.map((f) => (f.cargo === cargo ? { ...f, numeroCuenta } : f)));
  }

  function validarFundador() {
    setErrorFundador("");
    if (fundadores.some((f) => f.numeroCuenta === cuentaFundador)) {
      setErrorFundador("Ese número de cuenta ya fue agregado.");
      return;
    }
    const resultado = buscarEnPadron(cuentaFundador);
    if (!resultado) {
      setErrorFundador("No se encontró esa matrícula en Registro.");
      return;
    }
    setFundadores((prev) => [...prev, { numeroCuenta: cuentaFundador, ...resultado }]);
    setCuentaFundador("");
  }

  function quitarFundador(cuenta: string) {
    setFundadores((prev) => prev.filter((f) => f.numeroCuenta !== cuenta));
  }

  function agregarActividad() {
    setActividades((prev) => [...prev, { id: generarId(), nombre: "", mes: "" }]);
  }

  function actualizarActividad(id: string, campo: "nombre" | "mes", valor: string) {
    setActividades((prev) => prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));
  }

  function quitarActividad(id: string) {
    setActividades((prev) => prev.filter((a) => a.id !== id));
  }

  function siguiente() {
    if (esUltimoPaso) {
      if (!documentosCompletos) return;
      navigate("/voluntariado/portal-estudiante/solicitudes");
      return;
    }
    setPaso((p) => Math.min(p + 1, 4));
  }

  const tituloPaso = ["Datos del grupo", "Junta directiva propuesta", "Miembros fundadores", "Proyección de actividades", "Documentos"][paso];

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Crear grupo" />

      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 pb-3 pt-2">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-[5px] flex-1 rounded-full ${i <= paso ? "bg-unah-navy" : "bg-slate-200"}`} />
          ))}
        </div>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Paso {paso + 1} de 5
        </p>
        <p className="text-[13px] font-bold text-slate-800">{tituloPaso}</p>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        {paso === 0 && (
          <div className="flex flex-col gap-3.5">
            <div>
              <label className={claseLabel}>Nombre del grupo</label>
              <input className={claseInput} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Manos que Ayudan" />
            </div>
            <div>
              <label className={claseLabel}>Campus</label>
              <select className={claseInput} value={campusId} onChange={(e) => setCampusId(e.target.value)}>
                <option value="" disabled>Selecciona un campus</option>
                {campus.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <p className={claseLabel}>Redes temáticas</p>
              <div className="flex flex-wrap gap-1.5">
                {redesTematicas.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => alternarRed(r.id)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                      redesIds.includes(r.id) ? "border-transparent bg-unah-orange text-white" : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {r.nombre}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={claseLabel}>Fecha de creación</label>
              <input type="date" className={claseInput} value={fechaCreacion} onChange={(e) => setFechaCreacion(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Reseña histórica</label>
              <textarea className={`${claseInput} resize-none`} rows={3} value={reseña} onChange={(e) => setReseña(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Propósito</label>
              <textarea className={`${claseInput} resize-none`} rows={2} value={proposito} onChange={(e) => setProposito(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Misión</label>
              <textarea className={`${claseInput} resize-none`} rows={2} value={mision} onChange={(e) => setMision(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Visión</label>
              <textarea className={`${claseInput} resize-none`} rows={2} value={vision} onChange={(e) => setVision(e.target.value)} />
            </div>
          </div>
        )}

        {paso === 1 && (
          <div className="flex flex-col gap-3">
            {junta.map((fila) => (
              <div key={fila.cargo}>
                <label className={claseLabel}>{fila.cargo}</label>
                <input
                  className={claseInput}
                  placeholder="Número de cuenta"
                  value={fila.numeroCuenta}
                  onChange={(e) => actualizarJunta(fila.cargo, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {paso === 2 && (
          <div>
            <label className={claseLabel}>Número de cuenta</label>
            <div className="flex gap-2">
              <input
                className={claseInput}
                value={cuentaFundador}
                onChange={(e) => setCuentaFundador(e.target.value)}
                placeholder="Ej. 20191000123"
              />
              <button
                type="button"
                onClick={validarFundador}
                disabled={!cuentaFundador}
                className="shrink-0 rounded-lg bg-unah-navy px-4 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                Validar
              </button>
            </div>
            {errorFundador && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{errorFundador}</p>}

            <div className="mt-4 flex flex-col gap-2">
              {fundadores.map((f) => (
                <div key={f.numeroCuenta} className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-slate-800">{f.nombre}</p>
                    <p className="truncate text-[11px] text-slate-500">{f.numeroCuenta} · {f.carrera}</p>
                  </div>
                  <button type="button" onClick={() => quitarFundador(f.numeroCuenta)} aria-label="Quitar">
                    <HiOutlineXMark className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-unah-navy p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Total de fundadores</p>
              <p className="text-2xl font-extrabold">{fundadores.length}</p>
              <p className="mt-1 text-[10.5px] text-white/60">
                Este número se calcula automáticamente — no se digita.
              </p>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <div className="flex flex-col gap-2.5">
              {actividades.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3">
                  <input
                    className={claseInput}
                    placeholder="Nombre de la actividad"
                    value={a.nombre}
                    onChange={(e) => actualizarActividad(a.id, "nombre", e.target.value)}
                  />
                  <input
                    className={`${claseInput} w-24 shrink-0`}
                    placeholder="Mes"
                    value={a.mes}
                    onChange={(e) => actualizarActividad(a.id, "mes", e.target.value)}
                  />
                  <button type="button" onClick={() => quitarActividad(a.id)} aria-label="Quitar">
                    <HiOutlineXMark className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={agregarActividad}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-3 text-[12.5px] font-semibold text-slate-500"
            >
              <HiOutlinePlus className="h-4 w-4" />
              Agregar actividad
            </button>
          </div>
        )}

        {paso === 4 && (
          <div className="flex flex-col gap-3">
            <FilaDocumento label="Estatutos" formato="PDF" obligatorio value={estatutosOk} onChange={setEstatutosOk} />
            <FilaDocumento label="Logo del grupo" formato="PNG/JPG" obligatorio value={logoOk} onChange={setLogoOk} />
            <FilaDocumento label="Acta de junta" formato="PDF" obligatorio={false} value={actaOk} onChange={setActaOk} />

            {!documentosCompletos && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-[12px] font-semibold text-red-700">Faltan documentos obligatorios para enviar la solicitud.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white p-4">
        {paso > 0 && (
          <button
            type="button"
            onClick={() => setPaso((p) => p - 1)}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          onClick={siguiente}
          disabled={esUltimoPaso && !documentosCompletos}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white ${
            esUltimoPaso && !documentosCompletos ? "bg-slate-300" : esUltimoPaso ? "bg-emerald-600" : "bg-unah-navy"
          }`}
        >
          {esUltimoPaso ? "Enviar solicitud" : "Continuar"}
        </button>
      </footer>
    </div>
  );
}

function FilaDocumento({
  label,
  formato,
  obligatorio,
  value,
  onChange,
}: {
  label: string;
  formato: string;
  obligatorio: boolean;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
      <div>
        <p className="text-[13px] font-bold text-slate-800">
          {label} {obligatorio && <span className="text-red-500">*</span>}
        </p>
        <p className="text-[11px] text-slate-400">{formato}</p>
      </div>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-unah-orange" />
    </label>
  );
}
