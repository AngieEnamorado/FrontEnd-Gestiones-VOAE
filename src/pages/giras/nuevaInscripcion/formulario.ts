// El modelo del formulario de Nueva Inscripción y cómo se convierte de y hacia
// la API. Todo son textos (es lo que entregan los inputs); se convierte al armar
// el cuerpo del POST/PUT.
import type {
  CuerpoInscripcionGira,
  FichaSaludCuerpo,
  FichaSaludGira,
  InscripcionGiraDetalle,
} from "../../../types/giras";

export const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange disabled:bg-slate-50 disabled:text-slate-400";
export const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";

/** Una ficha de salud tal como se edita: todo texto, el contacto de emergencia aplanado. */
export interface FichaForm {
  idTipoSangre: string;
  alergias: string;
  condicionesMedicas: string;
  discapacidad: string;
  medicamentos: string;
  contactoNombre: string;
  contactoParentesco: string;
  contactoTelefono: string;
}

export interface DocumentoInscripcionForm {
  id: string;
  tipoDocumento: string;
  nombre: string;
  linkDocumento: string;
}

export interface AcompananteForm {
  nombre: string;
  fechaNacimiento: string;
  correoViajero: string;
  telefonoViajeroExterno: string;
}

export interface FormularioInscripcion {
  idGira: string;
  /** Solo cuando inscribe el jefe de misión: el estudiante (usuario-unidad con rol Viajero). */
  idViajero: string;
  motivoExcepcion: string;
  tieneAcompanante: boolean;
  acompanante: AcompananteForm;
  fichaEstudiante: FichaForm;
  fichaAcompanante: FichaForm;
  documentos: DocumentoInscripcionForm[];
  observaciones: string;
}

let contador = 0;
export function idLocal(): string {
  contador += 1;
  return `doc-${contador}`;
}

export const fichaVacia = (): FichaForm => ({
  idTipoSangre: "",
  alergias: "",
  condicionesMedicas: "",
  discapacidad: "",
  medicamentos: "",
  contactoNombre: "",
  contactoParentesco: "",
  contactoTelefono: "",
});

export function formularioVacio(): FormularioInscripcion {
  return {
    idGira: "",
    idViajero: "",
    motivoExcepcion: "",
    tieneAcompanante: false,
    acompanante: { nombre: "", fechaNacimiento: "", correoViajero: "", telefonoViajeroExterno: "" },
    fichaEstudiante: fichaVacia(),
    fichaAcompanante: fichaVacia(),
    documentos: [],
    observaciones: "",
  };
}

const texto = (valor: string | null | undefined): string => valor ?? "";

function fichaDesde(ficha: FichaSaludGira | null): FichaForm {
  if (!ficha) return fichaVacia();
  return {
    idTipoSangre: ficha.idTipoSangre === null ? "" : String(ficha.idTipoSangre),
    alergias: texto(ficha.alergias),
    condicionesMedicas: texto(ficha.condicionesMedicas),
    discapacidad: texto(ficha.discapacidad),
    medicamentos: texto(ficha.medicamentos),
    contactoNombre: texto(ficha.contactoEmergenciaNombre),
    contactoParentesco: texto(ficha.contactoEmergenciaParentesco),
    contactoTelefono: texto(ficha.contactoEmergenciaTelefono),
  };
}

/** Carga una inscripción guardada (borrador o en corrección) en el formulario. */
export function formularioDesde(i: InscripcionGiraDetalle): FormularioInscripcion {
  return {
    idGira: String(i.idGira),
    idViajero: String(i.idViajero),
    motivoExcepcion: texto(i.motivoExcepcion),
    tieneAcompanante: i.acompanante !== null,
    acompanante: {
      nombre: texto(i.acompanante?.nombre),
      fechaNacimiento: texto(i.acompanante?.fechaNacimiento),
      correoViajero: texto(i.acompanante?.correoViajero),
      telefonoViajeroExterno: texto(i.acompanante?.telefonoViajeroExterno),
    },
    fichaEstudiante: fichaDesde(i.fichaSaludEstudiante),
    fichaAcompanante: fichaDesde(i.fichaSaludAcompanante),
    documentos: i.documentos.map((d) => ({
      id: idLocal(),
      tipoDocumento: d.tipoDocumento,
      nombre: texto(d.nombre),
      linkDocumento: d.linkDocumento,
    })),
    observaciones: texto(i.observaciones),
  };
}

const textoONulo = (valor: string): string | null => (valor.trim() === "" ? null : valor.trim());

/** null si no se llenó nada: una ficha vacía no se guarda. */
function fichaACuerpo(f: FichaForm): FichaSaludCuerpo | null {
  const vacia = Object.values(f).every((v) => v.trim() === "");
  if (vacia) return null;
  return {
    idTipoSangre: f.idTipoSangre === "" ? null : Number(f.idTipoSangre),
    alergias: textoONulo(f.alergias),
    condicionesMedicas: textoONulo(f.condicionesMedicas),
    discapacidad: textoONulo(f.discapacidad),
    medicamentos: textoONulo(f.medicamentos),
    contactoEmergenciaNombre: textoONulo(f.contactoNombre),
    contactoEmergenciaParentesco: textoONulo(f.contactoParentesco),
    contactoEmergenciaTelefono: textoONulo(f.contactoTelefono),
  };
}

/**
 * El cuerpo de POST/PUT. Manda todo lo editable (lo vacío como null): el
 * formulario es la fuente de verdad, así que lo que la persona quitó se quita
 * también de la base.
 */
export function cuerpoDesde(
  f: FormularioInscripcion,
  contexto: {
    idTipoInscripcion: number;
    /** Quién inscribe en nombre de otro; null si el estudiante se inscribe solo. */
    idInscribidorExcepcional: number | null;
  },
): CuerpoInscripcionGira {
  const excepcional = contexto.idInscribidorExcepcional !== null;
  return {
    idTipoInscripcion: contexto.idTipoInscripcion,
    idInscribidorExcepcional: contexto.idInscribidorExcepcional,
    motivoExcepcion: excepcional ? textoONulo(f.motivoExcepcion) : null,
    observaciones: textoONulo(f.observaciones),
    acompanante: f.tieneAcompanante
      ? {
          nombre: f.acompanante.nombre.trim(),
          fechaNacimiento: f.acompanante.fechaNacimiento,
          correoViajero: f.acompanante.correoViajero.trim(),
          telefonoViajeroExterno: textoONulo(f.acompanante.telefonoViajeroExterno),
        }
      : null,
    fichaSaludEstudiante: fichaACuerpo(f.fichaEstudiante),
    fichaSaludAcompanante: f.tieneAcompanante ? fichaACuerpo(f.fichaAcompanante) : null,
    documentos: f.documentos
      .filter((d) => d.tipoDocumento.trim() !== "" && d.linkDocumento.trim() !== "")
      .map((d) => ({
        tipoDocumento: d.tipoDocumento.trim(),
        nombre: textoONulo(d.nombre),
        linkDocumento: d.linkDocumento.trim(),
      })),
  };
}
