import type { EstadoSolicitud, RegistroVoluntariadoAnalitica } from "../types";
import { campus, redesTematicas } from "./mockCatalogosVoluntariado";

// Dataset ficticio "plano" para alimentar el dashboard de Estadísticas de
// Voluntariado — mismo enfoque que mockEstadisticasGiras.ts: un PRNG con
// semilla fija para que los gráficos muestren siempre los mismos números
// entre recargas (no es Math.random puro), independiente de los mocks
// operativos (grupos/actividades) que alimentan el resto del módulo.
function crearGeneradorAleatorio(semilla: number) {
  let estado = semilla;
  return function siguiente() {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const azar = crearGeneradorAleatorio(20260910);

function elegir<T>(lista: T[]): T {
  return lista[Math.floor(azar() * lista.length)];
}

function elegirPonderado<T>(opciones: [T, number][]): T {
  const total = opciones.reduce((acc, [, peso]) => acc + peso, 0);
  let umbral = azar() * total;
  for (const [valor, peso] of opciones) {
    umbral -= peso;
    if (umbral <= 0) return valor;
  }
  return opciones[opciones.length - 1][0];
}

function entero(min: number, max: number) {
  return Math.floor(azar() * (max - min + 1)) + min;
}

export const CAMPUS = campus.map((c) => c.nombre);

// Dos o tres grupos ficticios por campus, alineados con la red temática que
// predomina en cada uno — así "Top grupos" reparte resultados entre campus
// en vez de concentrarse solo en los 4 grupos ya aprobados del mock operativo.
const CAMPUS_GRUPOS: Record<string, [string, string][]> = {
  cu: [
    ["Manos que Ayudan", "social"],
    ["EcoUNAH", "ambiental"],
    ["Voces del Campus", "cultural"],
  ],
  curla: [
    ["Brigada de Salud UNAH", "salud"],
    ["Litoral Verde", "ambiental"],
  ],
  curlp: [
    ["Raíces del Pacífico", "cultural"],
    ["Salud Comunitaria CURLP", "salud"],
  ],
  curc: [
    ["Voces Culturales", "cultural"],
    ["Aula Abierta Comayagua", "educativa"],
  ],
  curoc: [
    ["Occidente Solidario", "social"],
    ["Guardianes del Bosque", "ambiental"],
  ],
  "unah-tec": [
    ["Tec Emprende Social", "educativa"],
    ["Manos Técnicas", "social"],
  ],
  "unah-vs": [
    ["Ajedrez Solidario", "educativa"],
    ["Valle Verde", "ambiental"],
  ],
  choluteca: [
    ["Unidos por Choluteca", "social"],
    ["Costa Sur en Acción", "salud"],
  ],
  danli: [
    ["Huella Verde Danlí", "ambiental"],
    ["Oriente Solidario", "social"],
  ],
  juticalpa: [
    ["Olancho Coopera", "social"],
    ["Cultura Viva Olancho", "cultural"],
  ],
};

const ESTADOS: [EstadoSolicitud, number][] = [
  ["APROBADA", 78],
  ["PENDIENTE", 12],
  ["RECHAZADA", 6],
  ["DEVUELTA", 4],
];

// "I Periodo" cae entre enero y mayo; "II Periodo" entre julio y noviembre —
// mismo criterio que mockEstadisticasGiras.ts.
const MESES_POR_PERIODO: Record<string, number[]> = {
  "I Periodo": [0, 1, 2, 3, 4],
  "II Periodo": [6, 7, 8, 9, 10],
};

const TOTAL_REGISTROS = 128;

export const registrosVoluntariado: RegistroVoluntariadoAnalitica[] = Array.from(
  { length: TOTAL_REGISTROS },
  (_, indice) => {
    const año = elegir([2025, 2026]);
    const periodo = elegir(["I Periodo", "II Periodo"]);
    const mes = elegir(MESES_POR_PERIODO[periodo]);
    const dia = entero(1, 27);
    const campusElegido = elegir(campus);
    const [grupo, red] = elegir(CAMPUS_GRUPOS[campusElegido.id]);

    return {
      id: `VOL-${año}-${String(indice + 1).padStart(3, "0")}`,
      fecha: `${año}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
      año,
      periodo,
      campus: campusElegido.nombre,
      red,
      grupo,
      estado: elegirPonderado(ESTADOS),
      participantes: entero(8, 45),
      horas: entero(20, 180),
    };
  },
);

export { redesTematicas };
