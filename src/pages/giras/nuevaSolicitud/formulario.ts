// El modelo del formulario de Nueva Solicitud y cómo se convierte de y hacia la
// API. Los campos de texto y de número se guardan como texto (es lo que
// entregan los inputs) y se convierten al armar el cuerpo del POST/PUT.
import type { CuerpoSolicitudGira, SolicitudGiraDetalle } from "../../../types/giras";

export const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange disabled:bg-slate-50 disabled:text-slate-400";
export const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";

export interface LineaCostoForm {
  id: string;
  nombre: string;
  descripcion: string;
  total: string;
}

export interface DocumentoForm {
  id: string;
  tipoDocumento: string;
  nombre: string;
  linkDocumento: string;
}

/** Un medio de transporte elegido, con su observación (la base la guarda por medio). */
export interface TransporteForm {
  idTipoTransporte: number;
  observacion: string;
}

export interface FormularioSolicitud {
  // Datos generales
  idCampus: string;
  idTipoAlcance: string;
  destinoGira: string;
  alojamientoGira: string;
  objetivoAcademico: string;
  fechaSalidaPropuesta: string;
  horaSalidaPropuesta: string;
  fechaRetornoPropuesta: string;
  horaRetornoPropuesta: string;
  fechaInicioInscripcion: string;
  fechaFinInscripcion: string;
  // Alcance académico (ids de las tablas tipo)
  categorias: number[];
  facultades: number[];
  finalidades: number[];
  // Personas
  idJefeAprobacion: string;
  totalAproximadoEstudiantes: string;
  totalAproximadoDocentes: string;
  /** idUsuarioUnidad de cada docente acompañante; "" es una fila que aún no se eligió. */
  docentes: string[];
  // Transporte
  usaTransporteUniversidad: boolean;
  transportes: TransporteForm[];
  // Financiamiento
  financiamientos: number[];
  costos: LineaCostoForm[];
  // Documentos
  documentos: DocumentoForm[];
}

let contador = 0;
/** Un id local para las filas que se agregan y quitan; no viaja a la API. */
export function idLocal(): string {
  contador += 1;
  return `fila-${contador}`;
}

export function formularioVacio(idCampus?: number | null): FormularioSolicitud {
  return {
    idCampus: idCampus ? String(idCampus) : "",
    idTipoAlcance: "",
    destinoGira: "",
    alojamientoGira: "",
    objetivoAcademico: "",
    fechaSalidaPropuesta: "",
    horaSalidaPropuesta: "",
    fechaRetornoPropuesta: "",
    horaRetornoPropuesta: "",
    fechaInicioInscripcion: "",
    fechaFinInscripcion: "",
    categorias: [],
    facultades: [],
    finalidades: [],
    idJefeAprobacion: "",
    totalAproximadoEstudiantes: "",
    totalAproximadoDocentes: "",
    docentes: [],
    usaTransporteUniversidad: false,
    transportes: [],
    financiamientos: [],
    costos: [],
    documentos: [],
  };
}

const texto = (valor: string | null): string => valor ?? "";

/** Carga una solicitud guardada (borrador o en corrección) en el formulario. */
export function formularioDesde(s: SolicitudGiraDetalle): FormularioSolicitud {
  return {
    idCampus: String(s.idCampus),
    idTipoAlcance: s.idTipoAlcance === null ? "" : String(s.idTipoAlcance),
    destinoGira: texto(s.destinoGira),
    alojamientoGira: texto(s.alojamientoGira),
    objetivoAcademico: texto(s.objetivoAcademico),
    fechaSalidaPropuesta: texto(s.fechaSalidaPropuesta),
    horaSalidaPropuesta: texto(s.horaSalidaPropuesta),
    fechaRetornoPropuesta: texto(s.fechaRetornoPropuesta),
    horaRetornoPropuesta: texto(s.horaRetornoPropuesta),
    fechaInicioInscripcion: texto(s.fechaInicioInscripcion),
    fechaFinInscripcion: texto(s.fechaFinInscripcion),
    categorias: s.categorias.map((c) => c.idCategoria),
    facultades: s.facultades.map((f) => f.idFacultad),
    finalidades: s.finalidades.map((f) => f.idTipoFinalidad),
    idJefeAprobacion: String(s.idJefeAprobacion),
    totalAproximadoEstudiantes: s.totalAproximadoEstudiantes ? String(s.totalAproximadoEstudiantes) : "",
    totalAproximadoDocentes: s.totalAproximadoDocentes ? String(s.totalAproximadoDocentes) : "",
    docentes: s.docentes.map((d) => String(d.idUsuarioAcompanante)),
    usaTransporteUniversidad: s.usaTransporteUniversidad,
    transportes: s.transportes.map((t) => ({ idTipoTransporte: t.idTipoTransporte, observacion: texto(t.observacion) })),
    financiamientos: s.financiamientos.map((f) => f.idTipoFinanciamiento),
    costos: s.costos.map((c) => ({
      id: idLocal(),
      nombre: c.nombre,
      descripcion: texto(c.descripcion),
      total: String(c.total),
    })),
    documentos: s.documentos.map((d) => ({
      id: idLocal(),
      tipoDocumento: d.tipoDocumento,
      nombre: texto(d.nombre),
      linkDocumento: d.linkDocumento,
    })),
  };
}

const numeroOSinValor = (valor: string): number | null => (valor.trim() === "" ? null : Number(valor));
const textoONulo = (valor: string): string | null => (valor.trim() === "" ? null : valor.trim());

/**
 * El cuerpo de POST/PUT. Manda TODOS los campos (los vacíos como null) y todas
 * las listas: el formulario es la fuente de verdad, así que lo que la persona
 * quitó tiene que quitarse también en la base.
 */
export function cuerpoDesde(f: FormularioSolicitud, idJefeMision: number): CuerpoSolicitudGira {
  return {
    idJefeMision,
    idJefeAprobacion: Number(f.idJefeAprobacion),
    idCampus: Number(f.idCampus),
    idTipoAlcance: numeroOSinValor(f.idTipoAlcance),
    objetivoAcademico: textoONulo(f.objetivoAcademico),
    destinoGira: textoONulo(f.destinoGira),
    alojamientoGira: textoONulo(f.alojamientoGira),
    fechaSalidaPropuesta: textoONulo(f.fechaSalidaPropuesta),
    horaSalidaPropuesta: textoONulo(f.horaSalidaPropuesta),
    fechaRetornoPropuesta: textoONulo(f.fechaRetornoPropuesta),
    horaRetornoPropuesta: textoONulo(f.horaRetornoPropuesta),
    fechaInicioInscripcion: textoONulo(f.fechaInicioInscripcion),
    fechaFinInscripcion: textoONulo(f.fechaFinInscripcion),
    usaTransporteUniversidad: f.usaTransporteUniversidad,
    totalAproximadoEstudiantes: Number(f.totalAproximadoEstudiantes) || 0,
    totalAproximadoDocentes: Number(f.totalAproximadoDocentes) || 0,
    categorias: f.categorias,
    facultades: f.facultades,
    finalidades: f.finalidades,
    financiamientos: f.financiamientos,
    transportes: f.transportes.map((t) => ({
      idTipoTransporte: t.idTipoTransporte,
      observacion: textoONulo(t.observacion),
    })),
    // Una fila a medio llenar (sin concepto) no es una línea de costo: se descarta.
    costos: f.costos
      .filter((c) => c.nombre.trim() !== "")
      .map((c) => ({ nombre: c.nombre.trim(), descripcion: textoONulo(c.descripcion), total: Number(c.total) || 0 })),
    docentes: [...new Set(f.docentes.filter((d) => d !== "").map(Number))],
    documentos: f.documentos
      .filter((d) => d.tipoDocumento.trim() !== "" && d.linkDocumento.trim() !== "")
      .map((d) => ({
        tipoDocumento: d.tipoDocumento.trim(),
        nombre: textoONulo(d.nombre),
        linkDocumento: d.linkDocumento.trim(),
      })),
  };
}

/** Alterna un id en una lista de ids elegidos. */
export function alternar(lista: number[], id: number): number[] {
  return lista.includes(id) ? lista.filter((v) => v !== id) : [...lista, id];
}
