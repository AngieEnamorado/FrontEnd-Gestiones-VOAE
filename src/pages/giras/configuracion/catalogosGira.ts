// Cómo se presenta cada tabla tipo de Giras en la pantalla de Configuración.
// Los REGISTROS no están aquí: vienen de la API (`/catalogos/{slug}`). Esto es
// solo lo que la pantalla necesita saber de cada tabla: cómo se llama, qué
// columnas tiene y si admite desactivar registros.

export type CampoExtra = "aplicaA" | "requiereMotivo";

export interface DefinicionTablaTipo {
  /** El nombre del catálogo en la API. */
  slug: string;
  nombre: string;
  descripcion: string;
  /** La tabla tiene columna `descripcion`. */
  conDescripcion: boolean;
  /** La tabla tiene columna de estado: solo entonces un registro se puede desactivar. */
  conEstado: boolean;
  extras?: CampoExtra[];
}

export const TABLAS_TIPO: DefinicionTablaTipo[] = [
  {
    slug: "transporte",
    nombre: "Tipos de transporte",
    descripcion: "Medios con los que se puede trasladar una gira.",
    conDescripcion: true,
    conEstado: false,
  },
  {
    slug: "facultades",
    nombre: "Facultades",
    descripcion: "Facultades que pueden participar en una gira.",
    conDescripcion: false,
    conEstado: true,
  },
  {
    slug: "carreras",
    nombre: "Carreras",
    descripcion: "Carreras que pueden participar en una gira.",
    conDescripcion: false,
    conEstado: true,
  },
  {
    slug: "financiamiento",
    nombre: "Tipos de financiamiento",
    descripcion: "Origen de los fondos con que se paga una gira.",
    conDescripcion: true,
    conEstado: false,
  },
  {
    slug: "finalidades",
    nombre: "Finalidades de gira",
    descripcion: "Para qué se organiza la gira.",
    conDescripcion: true,
    conEstado: false,
  },
  {
    slug: "alcance",
    nombre: "Alcances de la gira",
    descripcion: "Local, nacional o internacional.",
    conDescripcion: true,
    conEstado: false,
  },
  {
    slug: "cancelacion",
    nombre: "Motivos de cancelación",
    descripcion: "Por qué se deniega una solicitud o se cancela una gira.",
    conDescripcion: true,
    conEstado: true,
    extras: ["aplicaA"],
  },
  {
    slug: "inscripcion",
    nombre: "Tipos de inscripción",
    descripcion: "Cómo se inscribe un viajero: por su cuenta o de forma excepcional.",
    conDescripcion: true,
    conEstado: true,
    extras: ["requiereMotivo"],
  },
  {
    slug: "modificaciones",
    nombre: "Tipos de modificación",
    descripcion: "Qué se puede cambiar en una gira ya aprobada.",
    conDescripcion: true,
    conEstado: false,
  },
  {
    slug: "sangre",
    nombre: "Tipos de sangre",
    descripcion: "Opciones de la ficha de salud.",
    conDescripcion: false,
    conEstado: false,
  },
  {
    slug: "informe",
    nombre: "Tipos de informe",
    descripcion: "Informes que se presentan de una gira.",
    conDescripcion: false,
    conEstado: false,
  },
  {
    slug: "tipos-categoria",
    nombre: "Tipos de categoría",
    descripcion: "Agrupan las categorías: carrera o externo.",
    conDescripcion: true,
    conEstado: false,
  },
  {
    slug: "tipos-unidad",
    nombre: "Tipos de unidad",
    descripcion: "Alcance de un usuario: categoría, facultad o campus.",
    conDescripcion: true,
    conEstado: false,
  },
];

/** Los valores que admite `aplicaA` en los motivos de cancelación. */
export const APLICA_A: { valor: string; etiqueta: string }[] = [
  { valor: "AMBAS", etiqueta: "Solicitudes y giras" },
  { valor: "SOLICITUD", etiqueta: "Solo solicitudes" },
  { valor: "GIRA", etiqueta: "Solo giras" },
];
