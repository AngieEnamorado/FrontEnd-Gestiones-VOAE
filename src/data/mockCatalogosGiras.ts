import type { CatalogoGira, CategoriaParametro, ParametroSistema } from "../types";

// Datos de ejemplo para "Configuración de tablas y parámetros" de Giras. Los
// registros de cada catálogo salen de las listas que hoy están escritas dentro
// de los formularios (NuevaSolicitud, NuevaInscripcion); cuando haya backend,
// esos formularios leerán de aquí y este será el único lugar donde se editan.

export const catalogosGirasIniciales: CatalogoGira[] = [
  {
    id: "transporte",
    nombre: "Tipos de transporte",
    descripcion: "Medios con los que se puede trasladar una gira.",
    registros: [
      { id: 1, codigo: "BUS_UNI", nombre: "Bus universitario", descripcion: "Unidad de la flota de la UNAH.", activo: true },
      { id: 2, codigo: "BUS_ALQ", nombre: "Bus alquilado", descripcion: "Bus contratado a una empresa externa.", activo: true },
      { id: 3, codigo: "MICROBUS", nombre: "Microbús", descripcion: "Para grupos pequeños.", activo: true },
      { id: 4, codigo: "VEH_PROP", nombre: "Vehículo propio", descripcion: "El docente o el estudiante viaja en su vehículo.", activo: true },
      { id: 5, codigo: "AEREO", nombre: "Aéreo", descripcion: "Vuelos nacionales e internacionales.", activo: true },
      { id: 6, codigo: "MARITIMO", nombre: "Marítimo", descripcion: "Lancha o ferri; se usa en giras a las Islas de la Bahía.", activo: false },
    ],
  },
  {
    id: "facultades",
    nombre: "Facultades",
    descripcion: "Facultades que pueden participar en una gira.",
    registros: [
      { id: 1, codigo: "FAC-ESP", nombre: "Ciencias Espaciales", descripcion: "", activo: true },
      { id: 2, codigo: "FAC-ECO", nombre: "Ciencias Económicas, Administrativas y Contables", descripcion: "", activo: true },
      { id: 3, codigo: "FAC-SOC", nombre: "Ciencias Sociales", descripcion: "", activo: true },
      { id: 4, codigo: "FAC-MED", nombre: "Ciencias Médicas", descripcion: "", activo: true },
      { id: 5, codigo: "FAC-ING", nombre: "Ingeniería", descripcion: "", activo: true },
      { id: 6, codigo: "FAC-HUM", nombre: "Humanidades y Artes", descripcion: "", activo: true },
    ],
  },
  {
    id: "carreras",
    nombre: "Carreras",
    descripcion: "Carreras que pueden participar en una gira.",
    registros: [
      { id: 1, codigo: "CAR-ICIV", nombre: "Ingeniería Civil", descripcion: "", activo: true },
      { id: 2, codigo: "CAR-IIND", nombre: "Ingeniería Industrial", descripcion: "", activo: true },
      { id: 3, codigo: "CAR-MED", nombre: "Medicina", descripcion: "", activo: true },
      { id: 4, codigo: "CAR-DER", nombre: "Derecho", descripcion: "", activo: true },
      { id: 5, codigo: "CAR-ARQ", nombre: "Arquitectura", descripcion: "", activo: true },
      { id: 6, codigo: "CAR-ENF", nombre: "Enfermería", descripcion: "", activo: true },
      { id: 7, codigo: "CAR-ADM", nombre: "Administración de Empresas", descripcion: "", activo: true },
      { id: 8, codigo: "CAR-BIO", nombre: "Biología", descripcion: "Suspendida mientras se revisa el plan de estudios.", activo: false },
    ],
  },
  {
    id: "financiamiento",
    nombre: "Tipos de financiamiento",
    descripcion: "Origen de los fondos con que se paga una gira.",
    registros: [
      { id: 1, codigo: "INST", nombre: "Institucional", descripcion: "Presupuesto de la universidad.", activo: true },
      { id: 2, codigo: "APORTE", nombre: "Aporte de viajeros", descripcion: "Lo cubren los participantes.", activo: true },
      { id: 3, codigo: "MIXTO", nombre: "Mixto", descripcion: "Parte institucional y parte aporte de viajeros.", activo: true },
      { id: 4, codigo: "EXTERNO", nombre: "Externo", descripcion: "Patrocinio o cooperación de otra entidad.", activo: false },
    ],
  },
  {
    id: "finalidades",
    nombre: "Finalidades de gira",
    descripcion: "Para qué se organiza la gira.",
    registros: [
      { id: 1, codigo: "ACAD", nombre: "Académica", descripcion: "Práctica de campo ligada a una asignatura.", activo: true },
      { id: 2, codigo: "SOCIAL", nombre: "Social", descripcion: "Proyectos de vinculación con la comunidad.", activo: true },
      { id: 3, codigo: "DEPORT", nombre: "Deportiva", descripcion: "", activo: true },
      { id: 4, codigo: "CULT", nombre: "Cultural", descripcion: "", activo: true },
      { id: 5, codigo: "RECREA", nombre: "Recreativa", descripcion: "", activo: true },
    ],
  },
];

export const categoriasParametros: {
  id: CategoriaParametro;
  titulo: string;
  descripcion: string;
}[] = [
  {
    id: "giras",
    titulo: "Parámetros de giras",
    descripcion: "Reglas para solicitar y organizar una gira.",
  },
  {
    id: "sistema",
    titulo: "Notificaciones y sistema",
    descripcion: "Avisos por correo y comportamiento general.",
  },
];

// Los valores son de demostración. `min` y `max` son los límites que la pantalla
// deja guardar; qué tan razonables son de verdad lo decide el negocio.
export const parametrosSistemaIniciales: ParametroSistema[] = [
  {
    clave: "maxDocentesPorGira",
    etiqueta: "Máximo de docentes por giras",
    categoria: "giras",
    descripcion:
      "Límite máximo de docentes acompañantes que se pueden agregar a una solicitud de gira. Al llegar al tope, el formulario deja de ofrecer «Agregar acompañante».",
    tipo: "numero",
    valor: 2,
    unidad: "docentes",
    min: 0,
    max: 10,
  },
  {
    clave: "notificarPorCorreo",
    etiqueta: "Notificación",
    categoria: "sistema",
    descripcion:
      "Envía un correo al jefe de misión cuando llega una inscripción nueva y al solicitante cuando cambia el estado de su solicitud.",
    tipo: "booleano",
    valor: true,
  },
  {
    clave: "correoRemitente",
    etiqueta: "Correo remitente",
    categoria: "sistema",
    descripcion: "Dirección desde la que salen los correos de notificación del módulo de Giras.",
    tipo: "texto",
    valor: "giras@unah.hn",
    formato: "correo",
  },
  {
    clave: "modoMantenimiento",
    etiqueta: "Mantenimiento",
    categoria: "sistema",
    descripcion:
      "Bloquea las solicitudes y las inscripciones nuevas mientras se hace mantenimiento. Lo que ya está registrado se sigue pudiendo consultar.",
    tipo: "booleano",
    valor: false,
  },
];
