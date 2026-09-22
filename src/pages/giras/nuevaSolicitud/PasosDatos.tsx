import type { ReactNode } from "react";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import type { RegistroCatalogoApi, UsuarioUnidadGira } from "../../../types/giras";
import { alternar, claseInput, claseLabel, type FormularioSolicitud } from "./formulario";

/** Todo lo que los pasos ofrecen para elegir; sale de la API, nunca de listas escritas aquí. */
export interface OpcionesFormulario {
  campus: { id: number; nombre: string }[];
  alcances: RegistroCatalogoApi[];
  carreras: RegistroCatalogoApi[];
  facultades: RegistroCatalogoApi[];
  finalidades: RegistroCatalogoApi[];
  transportes: RegistroCatalogoApi[];
  financiamientos: RegistroCatalogoApi[];
  jefesAprobacion: UsuarioUnidadGira[];
  docentes: UsuarioUnidadGira[];
  /** Parámetro maxDocentesPorGira. */
  maxDocentes: number;
  nombreJefeMision: string;
}

export interface PropiedadesPaso {
  f: FormularioSolicitud;
  cambiar: (parcial: Partial<FormularioSolicitud>) => void;
  op: OpcionesFormulario;
}

export function SeccionFormulario({
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

/** Una lista de casillas para elegir varios registros de una tabla tipo. */
export function CasillasDeCatalogo({
  registros,
  elegidos,
  onCambiar,
  vacio,
}: {
  registros: RegistroCatalogoApi[];
  elegidos: number[];
  onCambiar: (ids: number[]) => void;
  vacio: string;
}) {
  if (registros.length === 0) return <p className="text-sm text-slate-400">{vacio}</p>;
  return (
    <>
      {registros.map((r) => (
        <label key={r.id} className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={elegidos.includes(r.id)}
            onChange={() => onCambiar(alternar(elegidos, r.id))}
            className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
          />
          {r.nombre}
        </label>
      ))}
    </>
  );
}

export function PasoDatosGenerales({ f, cambiar, op }: PropiedadesPaso) {
  return (
    <SeccionFormulario numero={1} titulo="Datos generales" id="datos-generales">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={claseLabel}>Campus que organiza</label>
          <select
            className={claseInput}
            value={f.idCampus}
            onChange={(e) => cambiar({ idCampus: e.target.value })}
          >
            <option value="" disabled>
              Selecciona un campus
            </option>
            {op.campus.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={claseLabel}>Alcance del viaje</label>
          <select
            className={claseInput}
            value={f.idTipoAlcance}
            onChange={(e) => cambiar({ idTipoAlcance: e.target.value })}
          >
            <option value="">Selecciona el alcance</option>
            {op.alcances.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={claseLabel}>Destino</label>
          <input
            type="text"
            maxLength={150}
            placeholder="Ej. Copán Ruinas, Copán"
            value={f.destinoGira}
            onChange={(e) => cambiar({ destinoGira: e.target.value })}
            className={claseInput}
          />
        </div>

        <div>
          <label className={claseLabel}>Alojamiento</label>
          <input
            type="text"
            maxLength={150}
            placeholder="Ej. Hotel Marina Copán"
            value={f.alojamientoGira}
            onChange={(e) => cambiar({ alojamientoGira: e.target.value })}
            className={claseInput}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={claseLabel}>Objetivo académico</label>
          <textarea
            value={f.objetivoAcademico}
            onChange={(e) => cambiar({ objetivoAcademico: e.target.value.slice(0, 1000) })}
            maxLength={1000}
            rows={4}
            placeholder="Describe el objetivo académico de la gira..."
            className={`${claseInput} resize-none`}
          />
          <p className="mt-1 text-right text-xs text-slate-400">{f.objetivoAcademico.length}/1000</p>
        </div>
      </div>

      <p className="mb-4 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Fechas y horarios</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={claseLabel}>Fecha de salida</label>
          <input
            type="date"
            value={f.fechaSalidaPropuesta}
            onChange={(e) => cambiar({ fechaSalidaPropuesta: e.target.value })}
            className={claseInput}
          />
        </div>
        <div>
          <label className={claseLabel}>Hora de salida</label>
          <input
            type="time"
            value={f.horaSalidaPropuesta}
            onChange={(e) => cambiar({ horaSalidaPropuesta: e.target.value })}
            className={claseInput}
          />
        </div>
        <div>
          <label className={claseLabel}>Fecha de retorno</label>
          <input
            type="date"
            value={f.fechaRetornoPropuesta}
            min={f.fechaSalidaPropuesta || undefined}
            onChange={(e) => cambiar({ fechaRetornoPropuesta: e.target.value })}
            className={claseInput}
          />
        </div>
        <div>
          <label className={claseLabel}>Hora de retorno</label>
          <input
            type="time"
            value={f.horaRetornoPropuesta}
            onChange={(e) => cambiar({ horaRetornoPropuesta: e.target.value })}
            className={claseInput}
          />
        </div>
        <div>
          <label className={claseLabel}>Fecha inicio de inscripción</label>
          <input
            type="date"
            value={f.fechaInicioInscripcion}
            onChange={(e) => cambiar({ fechaInicioInscripcion: e.target.value })}
            className={claseInput}
          />
        </div>
        <div>
          <label className={claseLabel}>Fecha fin de inscripción</label>
          <input
            type="date"
            value={f.fechaFinInscripcion}
            min={f.fechaInicioInscripcion || undefined}
            onChange={(e) => cambiar({ fechaFinInscripcion: e.target.value })}
            className={claseInput}
          />
        </div>
      </div>
    </SeccionFormulario>
  );
}

export function PasoAlcance({ f, cambiar, op }: PropiedadesPaso) {
  return (
    <SeccionFormulario numero={2} titulo="Alcance académico" id="alcance-academico">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className={claseLabel}>Carreras participantes</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <CasillasDeCatalogo
              registros={op.carreras}
              elegidos={f.categorias}
              onCambiar={(categorias) => cambiar({ categorias })}
              vacio="No hay carreras registradas. Se agregan en Configuraciones."
            />
          </div>
        </div>

        <div>
          <p className={claseLabel}>Facultades participantes</p>
          <div className="grid grid-cols-1 gap-2">
            <CasillasDeCatalogo
              registros={op.facultades}
              elegidos={f.facultades}
              onCambiar={(facultades) => cambiar({ facultades })}
              vacio="No hay facultades registradas. Se agregan en Configuraciones."
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className={claseLabel}>Finalidad de la gira</p>
        <div className="flex flex-wrap gap-4">
          <CasillasDeCatalogo
            registros={op.finalidades}
            elegidos={f.finalidades}
            onCambiar={(finalidades) => cambiar({ finalidades })}
            vacio="No hay finalidades registradas."
          />
        </div>
      </div>
    </SeccionFormulario>
  );
}

export function PasoPersonas({ f, cambiar, op }: PropiedadesPaso) {
  const limite = op.maxDocentes;

  function cambiarDocente(indice: number, valor: string) {
    cambiar({ docentes: f.docentes.map((d, i) => (i === indice ? valor : d)) });
  }

  return (
    <SeccionFormulario numero={3} titulo="Personas" id="personas">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={claseLabel}>Jefe de aprobación</label>
          <select
            className={claseInput}
            value={f.idJefeAprobacion}
            onChange={(e) => cambiar({ idJefeAprobacion: e.target.value })}
          >
            <option value="" disabled>
              Selecciona un jefe de aprobación
            </option>
            {op.jefesAprobacion.map((j) => (
              <option key={j.idUsuarioUnidad} value={j.idUsuarioUnidad}>
                {j.nombreCompleto}
                {j.nombreCampus ? ` · ${j.nombreCampus}` : ""}
              </option>
            ))}
          </select>
          {op.jefesAprobacion.length === 0 && (
            <p className="mt-1 text-xs text-amber-700">No hay jefes de aprobación en la base de datos.</p>
          )}
        </div>

        <div>
          <label className={claseLabel}>Jefe de misión</label>
          <input type="text" value={op.nombreJefeMision} disabled className={claseInput} />
        </div>

        <div>
          <label className={claseLabel}>Estudiantes aproximados</label>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={f.totalAproximadoEstudiantes}
            onChange={(e) => cambiar({ totalAproximadoEstudiantes: e.target.value })}
            className={claseInput}
          />
        </div>

        <div>
          <label className={claseLabel}>Docentes aproximados</label>
          <input
            type="number"
            min={0}
            max={limite}
            placeholder="0"
            value={f.totalAproximadoDocentes}
            onChange={(e) => cambiar({ totalAproximadoDocentes: e.target.value })}
            className={claseInput}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className={claseLabel}>
            Docentes acompañantes <span className="font-normal text-slate-400">(máximo {limite})</span>
          </p>
          <button
            type="button"
            onClick={() => cambiar({ docentes: [...f.docentes, ""] })}
            disabled={f.docentes.length >= limite}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlinePlus className="h-3.5 w-3.5" />
            Agregar acompañante
          </button>
        </div>

        {f.docentes.length === 0 && <p className="mt-2 text-sm text-slate-400">Aún no se han agregado acompañantes.</p>}

        <div className="mt-3 flex flex-col gap-3">
          {f.docentes.map((docente, indice) => (
            <div key={indice} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <select
                className={claseInput}
                value={docente}
                onChange={(e) => cambiarDocente(indice, e.target.value)}
                aria-label={`Docente acompañante ${indice + 1}`}
              >
                <option value="">Selecciona un docente</option>
                {op.docentes.map((d) => (
                  <option key={d.idUsuarioUnidad} value={d.idUsuarioUnidad}>
                    {d.nombreCompleto}
                  </option>
                ))}
              </select>
              <button
                type="button"
                title="Quitar acompañante"
                onClick={() => cambiar({ docentes: f.docentes.filter((_, i) => i !== indice) })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
              >
                <HiOutlineTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {op.docentes.length === 0 && (
          <p className="mt-2 text-xs text-amber-700">No hay usuarios con perfil Docente en la base de datos.</p>
        )}
      </div>
    </SeccionFormulario>
  );
}
