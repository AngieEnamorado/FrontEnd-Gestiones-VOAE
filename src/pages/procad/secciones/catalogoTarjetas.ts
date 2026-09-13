/**
 * Las 33 estadísticas del panel, en el mismo orden en que se dibujan.
 *
 * Hace falta tenerlas listadas de antemano porque el armador del reporte
 * personalizado las ofrece todas antes de que el usuario visite los apartados;
 * el catálogo que llena `visibilidadTarjetas` solo conoce las que ya se
 * dibujaron alguna vez, así que no sirve para elegir.
 *
 * `numero` es el de la especificación del programa —el mismo que llevan las
 * tarjetas— y es lo que viaja en la URL del reporte. Si se agrega o se renombra
 * una tarjeta hay que anotarla aquí también; en desarrollo, una tarjeta que se
 * dibuje sin estar en esta lista avisa por consola.
 */
export interface TarjetaCatalogo {
  numero: string;
  titulo: string;
  /** Letra del apartado: "A" son las cifras de encabezado, B–G las pestañas. */
  seccion: string;
  /** Qué forma tiene la estadística, para reconocerla al elegirla. */
  tipo: string;
}

/** Los siete apartados, con el nombre corto que llevan las pestañas. */
export const APARTADOS = [
  { id: "A", label: "Cifras de encabezado" },
  { id: "B", label: "Participación" },
  { id: "C", label: "Cobertura" },
  { id: "D", label: "Acceso" },
  { id: "E", label: "Equidad" },
  { id: "F", label: "Tendencia" },
  { id: "G", label: "Casos especiales" },
] as const;

export const CATALOGO_TARJETAS: TarjetaCatalogo[] = [
  // A · Cifras de encabezado
  {
    numero: "1",
    titulo: "Promedio de actividades asistidas por estudiante",
    seccion: "A",
    tipo: "Cifra con tendencia",
  },
  { numero: "4", titulo: "Estudiantes en agrupaciones", seccion: "A", tipo: "Cifra con tendencia" },
  { numero: "2", titulo: "En matrícula preferencial", seccion: "A", tipo: "Cifra con tendencia" },
  { numero: "3", titulo: "Elegibilidad", seccion: "A", tipo: "Cifra con tendencia" },
  { numero: "5", titulo: "Agrupaciones activas", seccion: "A", tipo: "Cifra con tendencia" },
  { numero: "6", titulo: "Actividades validadas", seccion: "A", tipo: "Cifra con tendencia" },

  // B · Participación y cumplimiento
  {
    numero: "7",
    titulo: "Promedio de actividades asistidas por agrupación",
    seccion: "B",
    tipo: "Barras",
  },
  { numero: "8", titulo: "Elegibilidad por agrupación", seccion: "B", tipo: "Barras" },
  { numero: "9", titulo: "Tasa de cumplimiento del mínimo", seccion: "B", tipo: "Barras" },
  { numero: "11", titulo: "Tasa de asistencia", seccion: "B", tipo: "Barras" },
  { numero: "10", titulo: "Elegibilidad frente a cumplimiento", seccion: "B", tipo: "Dispersión" },
  {
    numero: "12",
    titulo: "Agrupaciones activas sin actividades validadas",
    seccion: "B",
    tipo: "Listado",
  },

  // C · Cobertura territorial
  { numero: "13", titulo: "Estudiantes por agrupación", seccion: "C", tipo: "Barras" },
  { numero: "14", titulo: "Grupos por centro regional", seccion: "C", tipo: "Barras" },
  { numero: "15", titulo: "Actividades por centro regional", seccion: "C", tipo: "Barras" },
  {
    numero: "18",
    titulo: "Distribución deportivo frente a artístico",
    seccion: "C",
    tipo: "Barra apilada",
  },
  {
    numero: "16",
    titulo: "Composición de estudiantes por centro",
    seccion: "C",
    tipo: "Barras apiladas",
  },
  { numero: "17", titulo: "Resumen por centro", seccion: "C", tipo: "Tabla" },

  // D · Acceso al programa
  { numero: "19", titulo: "Recorrido de acceso al programa", seccion: "D", tipo: "Embudo y dona" },
  {
    numero: "20",
    titulo: "Tasa de aprobación de solicitudes, por campus",
    seccion: "D",
    tipo: "Barras",
  },
  {
    numero: "21",
    titulo: "Aspirantes que cumplen el índice mínimo",
    seccion: "D",
    tipo: "Medidor",
  },
  { numero: "22", titulo: "Cobertura de visorías", seccion: "D", tipo: "Medidor" },

  // E · Equidad y permanencia
  { numero: "23", titulo: "Participación por sexo", seccion: "E", tipo: "Barra apilada" },
  { numero: "25", titulo: "Retención", seccion: "E", tipo: "Medidor" },
  { numero: "24", titulo: "Participación por carrera", seccion: "E", tipo: "Columnas" },
  {
    numero: "26",
    titulo: "Estudiantes PROSENE dentro de los elegibles",
    seccion: "E",
    tipo: "Cifra destacada",
  },

  // F · Tendencia
  {
    numero: "27",
    titulo: "Evolución del porcentaje de elegibilidad entre períodos",
    seccion: "F",
    tipo: "Línea de tendencia",
  },
  {
    numero: "28",
    titulo: "Evolución de estudiantes inscritos y actividades",
    seccion: "F",
    tipo: "Líneas de tendencia",
  },

  // G · Casos especiales
  {
    numero: "29",
    titulo: "Agrupaciones con condicionados este período",
    seccion: "G",
    tipo: "Listado",
  },
  { numero: "30", titulo: "Agrupaciones con colaborador externo", seccion: "G", tipo: "Listado" },
  { numero: "31", titulo: "Selecciones multi-campus", seccion: "G", tipo: "Tabla" },
  { numero: "32", titulo: "Matrícula excepcional", seccion: "G", tipo: "Cifra destacada" },
  {
    numero: "33",
    titulo: "Seguimiento a egresados del programa",
    seccion: "G",
    tipo: "Próximamente",
  },
];

/** Los números del catálogo, en orden. */
export const NUMEROS_TARJETAS = CATALOGO_TARJETAS.map((t) => t.numero);

export function tarjetasDeSeccion(seccion: string): TarjetaCatalogo[] {
  return CATALOGO_TARJETAS.filter((t) => t.seccion === seccion);
}

/** Deja solo los números que existen, en el orden del catálogo. */
export function ordenarSeleccion(numeros: string[]): string[] {
  return NUMEROS_TARJETAS.filter((n) => numeros.includes(n));
}
