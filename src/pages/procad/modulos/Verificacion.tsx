import { useMemo, useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import { ETIQUETA_ESTADO } from "../../../components/procad/paleta";
import { useProcad } from "../../../context/ProcadContext";
import { INDICE_MINIMO } from "../../../data/mockProcadEstadisticas";

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{children}</p>
    </div>
  );
}

/**
 * Busca a un estudiante y confirma su matrícula, sincronizada desde Registro.
 * La Forma 003 se consulta por API: aquí no se guarda copia local de nada.
 */
export default function Verificacion() {
  const { solicitudes } = useProcad();
  const [consulta, setConsulta] = useState("");

  const halladas = useMemo(() => {
    const q = consulta.trim().toLowerCase();
    if (!q) return [];
    return solicitudes
      .filter((s) => s.cuenta.includes(q) || s.nombre.toLowerCase().includes(q))
      .slice(0, 6);
  }, [solicitudes, consulta]);

  const sinResultados = consulta.trim().length > 0 && halladas.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <label className="mb-1.5 block text-xs font-semibold text-slate-500" htmlFor="ver-q">
          Nombre o número de cuenta
        </label>
        <div className="relative max-w-md">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="ver-q"
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Ej. 20191002345"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-unah-orange"
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          La Forma 003 se consulta por API contra Registro — no se guarda copia local.
        </p>
      </div>

      {!consulta.trim() && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm italic text-slate-400 shadow-sm">
          Escriba un nombre o número de cuenta para verificar su matrícula.
        </p>
      )}

      {sinResultados && (
        <p className="rounded-2xl bg-white p-6 text-center text-sm italic text-slate-400 shadow-sm">
          Ningún estudiante coincide con «{consulta.trim()}».
        </p>
      )}

      {halladas.map((s) => (
        <div key={s.id} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-800">{s.nombre}</h3>
            <PildoraEstado tono={s.indice >= INDICE_MINIMO ? "activo" : "pendiente"}>
              {s.indice >= INDICE_MINIMO ? "Matrícula verificada" : "Requiere revisión"}
            </PildoraEstado>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Dato etiqueta="Cuenta">
              <span className="font-mono text-xs">{s.cuenta}</span>
            </Dato>
            <Dato etiqueta="Índice">{s.indice}%</Dato>
            <Dato etiqueta="Agrupación">{s.grupo}</Dato>
            <Dato etiqueta="Centro">{s.centro}</Dato>
            <Dato etiqueta="Estado de la solicitud">{ETIQUETA_ESTADO[s.estado]}</Dato>
          </div>
        </div>
      ))}
    </div>
  );
}
