import { HiChevronLeft } from "react-icons/hi2";
import type { ReactNode } from "react";
import EstadoBadge from "./EstadoBadge";
import BloqueCambioEstado from "./BloqueCambioEstado";
import { enCorto } from "../utils/fechas";
import type { EstadoSolicitud, SolicitudGira } from "../types";

const NO_ESPECIFICADO = "No especificado";

function formatearMonto(monto: number): string {
  return monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Seccion({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800">
        <span className="mr-2 text-unah-orange">{numero}.</span>
        {titulo}
      </h2>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Un par etiqueta-valor. Sin valor, dice "No especificado" en gris. */
function Dato({ etiqueta, valor, ancho }: { etiqueta: string; valor?: ReactNode; ancho?: boolean }) {
  const vacio = valor === undefined || valor === null || valor === "";
  return (
    <div className={`rounded-xl bg-slate-50 px-4 py-3 ${ancho ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <dt className="text-xs font-semibold text-slate-400">{etiqueta}</dt>
      <dd
        className={`mt-1 text-sm leading-relaxed ${
          vacio ? "text-slate-400" : "font-medium text-slate-800"
        }`}
      >
        {vacio ? NO_ESPECIFICADO : valor}
      </dd>
    </div>
  );
}

function Rejilla({ children }: { children: ReactNode }) {
  return <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>;
}

function Etiquetas({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-unah-navy"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Las etiquetas de una lista, o `undefined` para que `Dato` muestre "No especificado". */
function listaOVacio(items?: string[]): ReactNode {
  return items?.length ? <Etiquetas items={items} /> : undefined;
}

function fecha(valor?: string): string | undefined {
  return valor ? enCorto(valor) : undefined;
}

/**
 * La solicitud como ficha informativa: la información solo se lee. El estado
 * se muestra como un dato más; si se pasa `cambioDeEstado`, al pie aparece el
 * selector para dictaminarla (lo que hace el jefe de aprobación). Sin él, no
 * hay ningún control: es lo que ve el jefe de misión sobre lo que ya envió.
 */
export default function FichaSolicitudGira({
  solicitud,
  onRegresar,
  cambioDeEstado,
}: {
  solicitud: SolicitudGira;
  onRegresar: () => void;
  cambioDeEstado?: { estado: EstadoSolicitud; onCambiar: (estado: EstadoSolicitud) => void };
}) {
  const estado = cambioDeEstado?.estado ?? solicitud.estado;
  const costos = solicitud.desgloseCostos ?? [];
  const total = costos.reduce((suma, linea) => suma + linea.monto, 0);
  const acompanantes = solicitud.docentesAcompanantes ?? [];

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onRegresar}
        className="flex items-center gap-1.5 self-start rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
      >
        <HiChevronLeft className="h-4 w-4" />
        Regresar
      </button>

      <div>
        <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Detalle de la solicitud</h1>
        <p className="mt-2">
          <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
            {solicitud.id}
          </span>
        </p>
      </div>

      <Seccion numero={1} titulo="Datos generales">
        <Rejilla>
          <Dato etiqueta="Estado" valor={<EstadoBadge estado={estado} />} />
          <Dato etiqueta="Solicitante" valor={solicitud.estudiante} />
          <Dato etiqueta="Categoría" valor={solicitud.categoria} />
          <Dato etiqueta="Período" valor={solicitud.periodo} />
          <Dato etiqueta="Campus que organiza" valor={solicitud.centro} />
          <Dato etiqueta="Alcance del viaje" valor={solicitud.alcanceViaje} />
          <Dato etiqueta="Destino" valor={solicitud.destino} />
          <Dato etiqueta="Alojamiento" valor={solicitud.alojamiento} />
          <Dato etiqueta="Objetivo académico" valor={solicitud.descripcion} ancho />
        </Rejilla>
      </Seccion>

      <Seccion numero={2} titulo="Fechas y horarios">
        <Rejilla>
          <Dato etiqueta="Fecha de salida" valor={fecha(solicitud.fecha)} />
          <Dato etiqueta="Hora de salida" valor={solicitud.horaSalida} />
          <Dato etiqueta="Fecha de retorno" valor={fecha(solicitud.fechaRetorno)} />
          <Dato etiqueta="Hora de retorno" valor={solicitud.horaRetorno} />
          <Dato etiqueta="Inicio de inscripción" valor={fecha(solicitud.aperturaInscripciones)} />
          <Dato etiqueta="Fin de inscripción" valor={fecha(solicitud.cierreInscripciones)} />
        </Rejilla>
      </Seccion>

      <Seccion numero={3} titulo="Alcance académico">
        <Rejilla>
          <Dato etiqueta="Carreras participantes" valor={listaOVacio(solicitud.carrerasParticipantes)} />
          <Dato
            etiqueta="Facultades participantes"
            valor={listaOVacio(solicitud.facultadesParticipantes)}
          />
          <Dato etiqueta="Finalidad de la gira" valor={listaOVacio(solicitud.finalidadesGira)} />
        </Rejilla>
      </Seccion>

      <Seccion numero={4} titulo="Personas">
        <Rejilla>
          <Dato etiqueta="Jefe de misión" valor={solicitud.docente} />
          <Dato etiqueta="Jefe de aprobación" valor={solicitud.jefeAprobacion} />
          <Dato etiqueta="Estudiantes aproximados" valor={solicitud.estudiantesAproximados} />
          <Dato etiqueta="Docentes aproximados" valor={solicitud.docentesAproximados} />
          <Dato
            etiqueta="Docentes acompañantes"
            ancho
            valor={
              acompanantes.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {acompanantes.map((persona) => (
                    <li key={persona.nombre}>
                      {persona.nombre}
                      <span className="font-normal text-slate-500"> · {persona.rol}</span>
                    </li>
                  ))}
                </ul>
              ) : undefined
            }
          />
        </Rejilla>
      </Seccion>

      <Seccion numero={5} titulo="Transporte">
        <Rejilla>
          <Dato
            etiqueta="Transporte de la universidad"
            valor={
              solicitud.utilizaTransporteUniversidad === undefined
                ? undefined
                : solicitud.utilizaTransporteUniversidad
                  ? "Sí, se solicita"
                  : "No se solicita"
            }
          />
          <Dato etiqueta="Medios de transporte" valor={listaOVacio(solicitud.mediosTransporte)} />
          <Dato etiqueta="Observaciones del traslado" valor={solicitud.observacionesTraslado} />
        </Rejilla>
      </Seccion>

      <Seccion numero={6} titulo="Financiamiento">
        <Rejilla>
          <Dato etiqueta="Origen de fondos" valor={listaOVacio(solicitud.origenFondos)} ancho />
        </Rejilla>

        <div>
          <p className="text-xs font-semibold text-slate-400">Desglose de costos</p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3">Detalle</th>
                  <th className="px-4 py-3 text-right">Monto (L)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costos.map((linea) => (
                  <tr key={`${linea.concepto}-${linea.detalle}`}>
                    <td className="px-4 py-3 font-medium text-slate-700">{linea.concepto}</td>
                    <td className="px-4 py-3 text-slate-600">{linea.detalle}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {formatearMonto(linea.monto)}
                    </td>
                  </tr>
                ))}
                {costos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                      Aún no se han registrado líneas de costo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-right text-sm font-bold text-slate-800">
            Total: L {formatearMonto(total)}
          </p>
        </div>
      </Seccion>

      {cambioDeEstado && (
        <BloqueCambioEstado
          titulo="Estado de la solicitud"
          estado={cambioDeEstado.estado}
          onCambiar={cambioDeEstado.onCambiar}
        />
      )}
    </div>
  );
}
