import { HiChevronLeft } from "react-icons/hi2";
import type { ReactNode } from "react";
import EstadoGiraBadge from "./giras/EstadoGiraBadge";
import { etiquetaPeriodo, fechaCorta, formatearMonto } from "../utils/girasFormato";
import type { SolicitudGiraDetalle } from "../types/giras";

const NO_ESPECIFICADO = "No especificado";

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
      <dd className={`mt-1 text-sm leading-relaxed ${vacio ? "text-slate-400" : "font-medium text-slate-800"}`}>
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
        <li key={item} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-unah-navy">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Las etiquetas de una lista, o `undefined` para que `Dato` muestre "No especificado". */
function listaOVacio(items: string[]): ReactNode {
  return items.length ? <Etiquetas items={items} /> : undefined;
}

/**
 * La solicitud como ficha informativa: todo se lee. Lo que se puede hacer con
 * ella (dictaminar) lo pone quien la usa en `pie`; sin él, no hay ningún
 * control: es lo que ve el jefe de misión sobre lo que ya envió.
 */
export default function FichaSolicitudGira({
  solicitud,
  onRegresar,
  pie,
  titulo = "Detalle de la solicitud",
  identificador = `SOL-${solicitud.idSolicitud}`,
  estado = solicitud.codigoEstado,
  acciones,
}: {
  solicitud: SolicitudGiraDetalle;
  onRegresar: () => void;
  pie?: ReactNode;
  /** Por defecto es la ficha de la solicitud; ResumenGira la reutiliza para la gira. */
  titulo?: string;
  identificador?: string;
  /** El código de estado que se muestra en «Datos generales». */
  estado?: string;
  /** Botones junto a «Regresar» (p. ej. descargar PDF). */
  acciones?: ReactNode;
}) {
  const total = solicitud.costos.reduce((suma, linea) => suma + linea.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={onRegresar}
          className="flex items-center gap-1.5 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
        >
          <HiChevronLeft className="h-4 w-4" />
          Regresar
        </button>
        {acciones}
      </div>

      <div>
        <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{titulo}</h1>
        <p className="mt-2">
          <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
            {identificador}
          </span>
        </p>
      </div>

      <Seccion numero={1} titulo="Datos generales">
        <Rejilla>
          <Dato etiqueta="Estado" valor={<EstadoGiraBadge codigo={estado} />} />
          <Dato etiqueta="Solicitante" valor={solicitud.nombreJefeMision} />
          <Dato
            etiqueta="Categorías"
            valor={listaOVacio(solicitud.categorias.map((categoria) => categoria.nombre))}
          />
          <Dato
            etiqueta="Período"
            valor={
              solicitud.anioPeriodo === null ? undefined : etiquetaPeriodo(solicitud.anioPeriodo, solicitud.numeroPac)
            }
          />
          <Dato etiqueta="Campus que organiza" valor={solicitud.nombreCampus} />
          <Dato etiqueta="Alcance del viaje" valor={solicitud.nombreAlcance} />
          <Dato etiqueta="Destino" valor={solicitud.destinoGira} />
          <Dato etiqueta="Alojamiento" valor={solicitud.alojamientoGira} />
          <Dato etiqueta="Objetivo académico" valor={solicitud.objetivoAcademico} ancho />
        </Rejilla>
      </Seccion>

      <Seccion numero={2} titulo="Fechas y horarios">
        <Rejilla>
          <Dato
            etiqueta="Fecha de salida"
            valor={solicitud.fechaSalidaPropuesta ? fechaCorta(solicitud.fechaSalidaPropuesta) : undefined}
          />
          <Dato etiqueta="Hora de salida" valor={solicitud.horaSalidaPropuesta} />
          <Dato
            etiqueta="Fecha de retorno"
            valor={solicitud.fechaRetornoPropuesta ? fechaCorta(solicitud.fechaRetornoPropuesta) : undefined}
          />
          <Dato etiqueta="Hora de retorno" valor={solicitud.horaRetornoPropuesta} />
          <Dato
            etiqueta="Inicio de inscripción"
            valor={solicitud.fechaInicioInscripcion ? fechaCorta(solicitud.fechaInicioInscripcion) : undefined}
          />
          <Dato
            etiqueta="Fin de inscripción"
            valor={solicitud.fechaFinInscripcion ? fechaCorta(solicitud.fechaFinInscripcion) : undefined}
          />
        </Rejilla>
      </Seccion>

      <Seccion numero={3} titulo="Alcance académico">
        <Rejilla>
          <Dato
            etiqueta="Facultades participantes"
            valor={listaOVacio(solicitud.facultades.map((f) => f.nombre))}
          />
          <Dato
            etiqueta="Finalidad de la gira"
            valor={listaOVacio(solicitud.finalidades.map((f) => f.nombre))}
          />
        </Rejilla>
      </Seccion>

      <Seccion numero={4} titulo="Personas">
        <Rejilla>
          <Dato etiqueta="Jefe de misión" valor={solicitud.nombreJefeMision} />
          <Dato etiqueta="Jefe de aprobación" valor={solicitud.nombreJefeAprobacion} />
          <Dato etiqueta="Estudiantes aproximados" valor={solicitud.totalAproximadoEstudiantes} />
          <Dato etiqueta="Docentes aproximados" valor={solicitud.totalAproximadoDocentes} />
          <Dato
            etiqueta="Docentes acompañantes"
            ancho
            valor={
              solicitud.docentes.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {solicitud.docentes.map((persona) => (
                    <li key={persona.idDocenteAcompanante}>{persona.nombreCompleto ?? "—"}</li>
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
            valor={solicitud.usaTransporteUniversidad ? "Sí, se solicita" : "No se solicita"}
          />
          <Dato
            etiqueta="Medios de transporte"
            valor={listaOVacio(solicitud.transportes.map((t) => t.nombre))}
          />
          <Dato
            etiqueta="Observaciones del traslado"
            valor={
              solicitud.transportes.some((t) => t.observacion) ? (
                <ul className="flex flex-col gap-1">
                  {solicitud.transportes
                    .filter((t) => t.observacion)
                    .map((t) => (
                      <li key={t.idTipoTransporte}>
                        <span className="font-normal text-slate-500">{t.nombre}: </span>
                        {t.observacion}
                      </li>
                    ))}
                </ul>
              ) : undefined
            }
          />
        </Rejilla>
      </Seccion>

      <Seccion numero={6} titulo="Financiamiento">
        <Rejilla>
          <Dato
            etiqueta="Origen de fondos"
            valor={listaOVacio(solicitud.financiamientos.map((f) => f.nombre))}
            ancho
          />
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
                {solicitud.costos.map((linea) => (
                  <tr key={linea.idCostoDetalle}>
                    <td className="px-4 py-3 font-medium text-slate-700">{linea.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{linea.descripcion}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatearMonto(linea.total)}</td>
                  </tr>
                ))}
                {solicitud.costos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                      Aún no se han registrado líneas de costo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-right text-sm font-bold text-slate-800">Total: L {formatearMonto(total)}</p>
        </div>
      </Seccion>

      <Seccion numero={7} titulo="Documentos de respaldo">
        {solicitud.documentos.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {solicitud.documentos.map((doc) => (
              <li key={doc.idSolicitudDocumento} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-slate-700">{doc.tipoDocumento}</span>
                {doc.nombre && <span className="text-slate-500"> · {doc.nombre}</span>}
                <a
                  href={doc.linkDocumento}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 block break-all text-xs font-medium text-blue-600 hover:underline"
                >
                  {doc.linkDocumento}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No se adjuntaron documentos.</p>
        )}
      </Seccion>

      {solicitud.dictamenes.length > 0 && (
        <Seccion numero={8} titulo="Historial de dictámenes">
          <ul className="flex flex-col gap-3">
            {solicitud.dictamenes.map((d) => (
              <li key={d.idSolicitudDictamen} className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <EstadoGiraBadge codigo={d.codigoEstado === "Aprobado" ? "Aprobada" : d.codigoEstado === "Denegado" ? "Denegada" : d.codigoEstado} />
                  <span className="text-xs text-slate-400">
                    {d.nombreJefeAprobacion ?? "—"} · {fechaCorta(d.fechaDictamen)}
                  </span>
                </div>
                {d.nombreTipoCancelacion && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">Motivo: {d.nombreTipoCancelacion}</p>
                )}
                {d.justificacionDictamen && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{d.justificacionDictamen}</p>
                )}
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      {pie}
    </div>
  );
}
